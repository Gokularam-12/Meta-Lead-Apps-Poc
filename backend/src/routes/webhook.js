const express = require('express');
const router = express.Router();

const {
  getLeadDetails,
  generateMockLead
} = require('../services/metaService');

const {
  broadcastLead,
  getConnectedClientsCount
} = require('../socket');

// Meta Webhook Verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_VERIFY_TOKEN;

  console.log(
    `[Webhook GET] Verification request received: mode=${mode}, token provided=${Boolean(token)}`
  );

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook GET] Verification successful!');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook GET] Verification failed.');

  return res.status(403).json({
    error: 'Verification failed. Invalid hub.verify_token or hub.mode.'
  });
});

// Receive Meta Webhook Events
router.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('[Webhook POST] Incoming Meta webhook event received.');

  if (body.object !== 'page') {
    console.warn(`[Webhook POST] Unknown webhook object: ${body.object}`);

    return res.status(404).json({
      error: 'Expected object: page'
    });
  }

  // Acknowledge Meta's webhook request
  res.status(200).send('EVENT_RECEIVED');

  try {
    if (!Array.isArray(body.entry)) {
      console.warn('[Webhook POST] Invalid entry format.');
      return;
    }

    for (const entry of body.entry) {
      const pageId = entry.id;

      if (!Array.isArray(entry.changes)) {
        continue;
      }

      for (const change of entry.changes) {
        if (change.field !== 'leadgen') {
          console.log(
            `[Webhook POST] Ignored change field: ${change.field}`
          );
          continue;
        }

        const {
          leadgen_id,
          form_id,
          created_time,
          ad_id,
          adgroup_id
        } = change.value;

        console.log(
          `[Webhook POST] New lead event detected. Lead ID: ${leadgen_id}`
        );

        const leadData = await getLeadDetails({
          leadgen_id,
          form_id,
          page_id: pageId,
          created_time
        });

        if (ad_id) {
          leadData.adId = ad_id;
        }

        if (adgroup_id) {
          leadData.adGroupId = adgroup_id;
        }

        broadcastLead(leadData);

        console.log('[Webhook POST] Lead successfully broadcasted.');
      }
    }
  } catch (err) {
    // Never log the complete Axios error because it may expose access tokens.
    const message =
      err.response?.data?.error?.message || err.message;

    console.error(
      '[Webhook POST] Error processing webhook event:',
      message
    );
  }
});

// Local Test Lead Simulation
router.post('/api/test-lead', (req, res) => {
  const customData = req.body || {};

  const mockLead = generateMockLead({
    leadgen_id:
      customData.leadgen_id ||
      String(
        Math.floor(100000000000 + Math.random() * 900000000000)
      ),

    form_id: customData.form_id || 'DEMO_FORM_9921',

    page_id: customData.page_id || 'DEMO_PAGE_8832',

    created_time: Math.floor(Date.now() / 1000)
  });

  if (customData.fullName) {
    mockLead.fullName = customData.fullName;
  }

  if (customData.email) {
    mockLead.email = customData.email;
  }

  if (customData.phoneNumber) {
    mockLead.phoneNumber = customData.phoneNumber;
  }

  mockLead.source = 'local_simulation';

  console.log('[API] Local test lead generated.');

  broadcastLead(mockLead);

  return res.status(200).json({
    success: true,
    message: 'Test lead broadcasted to connected Socket.io clients.',
    lead: mockLead,
    activeSockets: getConnectedClientsCount()
  });
});

// Backend Health Check
router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSockets: getConnectedClientsCount(),
    metaVerifyTokenConfigured: Boolean(
      process.env.META_VERIFY_TOKEN
    ),
    metaAccessTokenConfigured: Boolean(
      process.env.META_PAGE_ACCESS_TOKEN
    )
  });
});

module.exports = router;