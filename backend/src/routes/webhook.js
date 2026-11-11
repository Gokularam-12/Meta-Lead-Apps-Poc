const express = require('express');
const router = express.Router();
const { getLeadDetails, generateMockLead } = require('../services/metaService');
const { broadcastLead, getConnectedClientsCount } = require('../socket');

/**
 * GET /webhook
 * Meta Webhook Verification Endpoint
 * When configuring the webhook in the Meta App Dashboard, Meta sends a GET request
 * with hub.mode, hub.verify_token, and hub.challenge.
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_VERIFY_TOKEN;

  console.log(`[Webhook GET] 🔍 Verification request received: mode=${mode}, token=${token}`);

  // Check if mode and token match the expected configuration
  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook GET] ✅ Verification successful! Responding with challenge token.');
    // Meta requires the raw challenge string returned with status 200
    return res.status(200).send(challenge);
  }

  console.warn(`[Webhook GET] ❌ Verification failed. Token mismatch or invalid mode. Expected: ${expectedToken}, Got: ${token}`);
  return res.status(403).json({
    error: 'Verification failed. Invalid hub.verify_token or hub.mode.'
  });
});

/**
 * POST /webhook
 * Meta Webhook Receiver Endpoint
 * Receives real-time leadgen notification events from Meta.
 */
router.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('[Webhook POST] 📥 Incoming Meta webhook event payload:');
  console.log(JSON.stringify(body, null, 2));

  // Verify that the event is from a Page subscription
  if (body.object === 'page') {
    // Immediately acknowledge receipt to Meta to prevent timeout/retries
    res.status(200).send('EVENT_RECEIVED');

    try {
      // Iterate through entries and changes
      if (Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          const pageId = entry.id;

          if (Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              // We are listening for the 'leadgen' field
              if (change.field === 'leadgen') {
                const {
                  leadgen_id,
                  form_id,
                  created_time,
                  ad_id,
                  adgroup_id
                } = change.value;

                console.log(`[Webhook POST] 🎯 New LeadGen event detected! Leadgen ID: ${leadgen_id}, Form ID: ${form_id}`);

                // Enrich lead data (either via Graph API or mock fallback)
                const leadData = await getLeadDetails({
                  leadgen_id,
                  form_id,
                  page_id: pageId,
                  created_time
                });

                // Attach any extra IDs if present
                if (ad_id) leadData.adId = ad_id;
                if (adgroup_id) leadData.adGroupId = adgroup_id;

                // Broadcast immediately to all connected mobile clients via Socket.io
                broadcastLead(leadData);
              } else {
                console.log(`[Webhook POST] ℹ️ Ignored change field: ${change.field}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[Webhook POST] 💥 Error processing webhook event:', err);
    }
  } else {
    // Return 404 if event is not from a page subscription
    console.warn(`[Webhook POST] ⚠️ Unknown webhook object: ${body.object}`);
    res.status(404).json({ error: 'Expected object: page' });
  }
});

/**
 * POST /api/test-lead
 * Helper endpoint to simulate an incoming lead directly from the React Native app or cURL.
 * Useful for local testing and live demonstrations without setting up ngrok or Meta Developer portal.
 */
router.post('/api/test-lead', (req, res) => {
  const customData = req.body || {};
  const mockLead = generateMockLead({
    leadgen_id: customData.leadgen_id || String(Math.floor(100000000000 + Math.random() * 900000000000)),
    form_id: customData.form_id || 'DEMO_FORM_9921',
    page_id: customData.page_id || 'DEMO_PAGE_8832',
    created_time: Math.floor(Date.now() / 1000)
  });

  if (customData.fullName) mockLead.fullName = customData.fullName;
  if (customData.email) mockLead.email = customData.email;
  if (customData.phoneNumber) mockLead.phoneNumber = customData.phoneNumber;
  mockLead.source = 'local_simulation';

  console.log('[API] 🧪 Generated test lead simulation:', mockLead);
  broadcastLead(mockLead);

  return res.status(200).json({
    success: true,
    message: 'Test lead broadcasted to connected Socket.io clients.',
    lead: mockLead,
    activeSockets: getConnectedClientsCount()
  });
});

/**
 * GET /api/health
 * Health check endpoint reporting server status and active Socket.io clients.
 */
router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSockets: getConnectedClientsCount(),
    metaVerifyTokenConfigured: Boolean(process.env.META_VERIFY_TOKEN),
    metaAccessTokenConfigured: Boolean(process.env.META_PAGE_ACCESS_TOKEN)
  });
});

module.exports = router;
