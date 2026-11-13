const axios = require('axios');

const MOCK_PROFILES = [
  { name: 'Arun Kumar', email: 'arun.kumar@example.com', phone: '+91 9876543210', city: 'Chennai, Tamil Nadu' },
  { name: 'Priya', email: 'priya@example.com', phone: '+91 9876543211', city: 'Bengaluru, Karnataka' },
  { name: 'Rahul ', email: 'rahul@example.com', phone: '+91 9876543212', city: 'Hyderabad, Telangana' },
  { name: 'Sneha ', email: 'sneha@example.com', phone: '+91 9876543213', city: 'Coimbatore, Tamil Nadu' },
  { name: 'Vikram ', email: 'vikram@example.com', phone: '+91 9876543214', city: 'Mumbai, Maharashtra' }
];

function generateMockLead({ leadgen_id, form_id, page_id, created_time }) {
  const index = Math.abs(parseInt(leadgen_id, 10) || Date.now()) % MOCK_PROFILES.length;
  const profile = MOCK_PROFILES[index];

  return {
    id: `lead_${leadgen_id || Date.now()}`,
    leadgen_id: String(leadgen_id || Date.now()),
    form_id: String(form_id || 'FORM_482910394'),
    page_id: String(page_id || 'PAGE_109283746'),
    fullName: profile.name,
    email: profile.email,
    phoneNumber: profile.phone,
    customFields: {
      location: profile.city,
      preferred_contact_time: 'Morning (9AM - 12PM)',
      interest: 'Enterprise Solution Inquiry'
    },
    createdTime: created_time
      ? new Date(Number(created_time) * 1000).toISOString()
      : new Date().toISOString(),
    source: 'local_simulation',
    isMock: true
  };
}

function normalizeGraphApiFields(fieldDataArray = []) {
  const result = {
    fullName: '',
    email: '',
    phoneNumber: '',
    customFields: {}
  };

  for (const field of fieldDataArray) {
    const key = (field.name || '').toLowerCase();
    const value = field.values?.length > 0 ? field.values[0] : '';

    if (['full_name', 'name', 'fullname'].includes(key)) {
      result.fullName = value;
    } else if (key === 'first_name') {
      result.fullName = result.fullName
        ? `${result.fullName} ${value}`
        : value;
    } else if (['email', 'user_email', 'work_email'].includes(key)) {
      result.email = value;
    } else if (['phone_number', 'phone', 'mobile_phone'].includes(key)) {
      result.phoneNumber = value;
    } else {
      result.customFields[field.name] = value;
    }
  }

  return result;
}

async function getLeadDetails({ leadgen_id, form_id, page_id, created_time }) {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';

  if (!pageAccessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN is not configured.');
  }

  try {
    console.log(`[MetaService] Fetching real Meta lead: ${leadgen_id}`);

    const url = `https://graph.facebook.com/${apiVersion}/${leadgen_id}`;

    const response = await axios.get(url, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,created_time,form_id,field_data,ad_id,ad_name,campaign_id,campaign_name'
      },
      timeout: 10000
    });

    const data = response.data;
    const normalizedFields = normalizeGraphApiFields(data.field_data);

    console.log('[MetaService] Successfully retrieved real lead details.');

    return {
      id: data.id || `lead_${leadgen_id}`,
      leadgen_id: String(leadgen_id),
      form_id: String(data.form_id || form_id),
      page_id: String(page_id),
      adId: data.ad_id || null,
      adName: data.ad_name || null,
      campaignName: data.campaign_name || null,
      fullName: normalizedFields.fullName || 'Anonymous Meta Lead',
      email: normalizedFields.email || 'N/A',
      phoneNumber: normalizedFields.phoneNumber || 'N/A',
      customFields: normalizedFields.customFields,
      createdTime: data.created_time || (
        created_time
          ? new Date(Number(created_time) * 1000).toISOString()
          : new Date().toISOString()
      ),
      source: 'meta_live',
      isMock: false
    };

  } catch (error) {
    const errorDetails = error.response
      ? JSON.stringify(error.response.data)
      : error.message;

    console.error(`[MetaService] Meta Graph API request failed: ${errorDetails}`);

    throw error;
  }
}

module.exports = {
  getLeadDetails,
  generateMockLead
};