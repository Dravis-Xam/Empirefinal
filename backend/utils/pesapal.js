import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

const baseApiUrl = isDev ? 'https://cybqa.pesapal.com/pesapalv3' : 'https://pay.pesapal.com/v3';
let authToken = null;
let tokenExpiry = null;

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url, method = 'GET', body = null) {
  // Authenticate first if we don't have a valid token
  if (!authToken || (tokenExpiry && Date.now() > tokenExpiry)) {
    await authenticate();
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Authenticate with Pesapal
async function authenticate() {
  const url = `${baseApiUrl}/api/Auth/RequestToken`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  const data = await response.json();
  authToken = data.token;
  tokenExpiry = Date.now() + (data.expiry_in || 3600) * 1000;
  return data;
}

// Register IPN URL
async function register_ipn_url({ url, ipn_notification_type = 'GET' }) {
  const endpoint = `${baseApiUrl}/api/URLSetup/RegisterIPN`;
  return makeAuthenticatedRequest(endpoint, 'POST', {
    url,
    ipn_notification_type
  });
}

// Submit order
async function submit_order({
  id,
  currency = 'KES',
  amount,
  description,
  callback_url,
  notification_id,
  billing_address,
}) {
  const endpoint = `${baseApiUrl}/api/Transactions/SubmitOrderRequest`;
  
  return makeAuthenticatedRequest(endpoint, 'POST', {
    id,
    currency,
    amount,
    description,
    callback_url,
    notification_id,
    billing_address
  });
}

// Get transaction status
async function get_transaction_status(orderTrackingId) {
  const endpoint = `${baseApiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
  return makeAuthenticatedRequest(endpoint);
}

export default {
  authenticate,
  register_ipn_url,
  submit_order,
  get_transaction_status
};