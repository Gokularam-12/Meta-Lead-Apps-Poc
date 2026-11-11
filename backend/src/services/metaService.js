const axios = require('axios');

/**
 * Service to handle Meta Graph API interactions and lead data normalization.
 */

// Simulated name & contact pool for mock/test lead generation
const MOCK_PROFILES = [
  { name: 'Alex Johnson', email: 'alex.johnson@example.com', phone: '+1 (555) 234-5678', city: 'San Francisco, CA' },
  { name: 'Sophia Chen', email: 'sophia.chen@innovate.io', phone: '+1 (555) 876-5432', city: 'Seattle, WA' },
  { name: 'Marcus Sterling', email: 'm.sterling@vanguard.co', phone: '+1 (555) 345-6789', city: 'Austin, TX' },
  { name: 'Elena Rostova', email: 'elena.rostova@techcorp.com', phone: '+1 (555) 901-2345', city: 'New York, NY' },
  { name: 'David Kim', email: 'david.kim@startuphub.dev', phone: '+1 (555) 678-1234', city: 'Chicago, IL' }
];

/**
 * Generates a mock lead payload with realistic fields based on leadgen_id.
 * Used when running tests or when META_PAGE_ACCESS_TOKEN is not configured.
 */
function generateMockLead({ leadgen_id, form_id, page_id, created_time }) {
  // Deterministic or pseudo-random selection based on leadgen_id
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
    source: 'meta_test_tool',
    isMock: true
  };
}

/**
 * Normalizes field data received from Meta Graph API response into clean key-value format.
 * Meta Graph API returns field_data as an array:
 * [
 *   { name: "full_name", values: ["John Doe"] },
 *   { name: "email", values: ["john@example.com"] },
 *   { name: "phone_number", values: ["+1234567890"] }
 * ]
 */
function normalizeGraphApiFields(fieldDataArray = []) {
  const result = {
    fullName: '',
    email: '',
    phoneNumber: '',
    customFields: {}
  };

  for (const field of fieldDataArray) {
    const key = (field.name || '').toLowerCase();
    const value = (field.values && field.values.length > 0) ? field.values[0] : '';

    if (['full_name', 'name', 'first_name', 'fullname'].includes(key)) {
      result.fullName = value;
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

/**
 * Retrieves lead details from Meta Graph API.
 * If META_PAGE_ACCESS_TOKEN is missing or Graph API call fails (e.g. test lead with no DB record),
 * seamlessly falls back to normalized placeholder data.
 */
async function getLeadDetails({ leadgen_id, form_id, page_id, created_time }) {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';

  if (!pageAccessToken) {
    console.log(`[MetaService] ⚠️ No META_PAGE_ACCESS_TOKEN found. Using simulated lead data for leadgen_id: ${leadgen_id}`);
    return generateMockLead({ leadgen_id, form_id, page_id, created_time });
  }

  try {
    console.log(`[MetaService] 🌐 Fetching live lead details from Meta Graph API (${apiVersion}/${leadgen_id})...`);
    
    const url = `https://graph.facebook.com/${apiVersion}/${leadgen_id}`;
    const response = await axios.get(url, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,created_time,form_id,field_data,ad_id,ad_name,campaign_id,campaign_name'
      },
      timeout: 8000
    });

    const data = response.data;
    const normalizedFields = normalizeGraphApiFields(data.field_data);

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
      createdTime: data.created_time || (created_time ? new Date(Number(created_time) * 1000).toISOString() : new Date().toISOString()),
      source: 'meta_live',
      isMock: false
    };
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.warn(`[MetaService] ⚠️ Failed to fetch lead details from Graph API (${errorDetails}). Falling back to simulated lead data.`);
    
    // Return graceful fallback so real-time webhook flow never breaks
    return generateMockLead({ leadgen_id, form_id, page_id, created_time });
  }
}

module.exports = {
  getLeadDetails,
  generateMockLead
};
