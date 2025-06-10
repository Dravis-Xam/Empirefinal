import pesapal from 'pesapaljs-v3';
import dotenv from 'dotenv';
dotenv.config();

let instance;

function init() {
  if (!instance) {
    instance = pesapal({
      key: process.env.PESAPAL_CONSUMER_KEY,
      secret: process.env.PESAPAL_CONSUMER_SECRET,
      debug: process.env.NODE_ENV === 'development',
    });
  }
  return instance;
}

async function authenticate() {
  const client = init();
  return await client.authenticate();
}

async function register_ipn_url({ url, ipn_notification_type = 'GET' }) {
  const client = init();
  await authenticate();
  return await client.register_ipn_url({ url, ipn_notification_type });
}

async function submit_order({
  id,
  currency = 'KES',
  amount,
  description,
  callback_url,
  notification_id,
  billing_address,
}) {
  const client = init();
  await authenticate();
  return await client.submit_order({
    id,
    currency,
    amount,
    description,
    callback_url,
    notification_id,
    billing_address,
  });
}

async function get_transaction_status({ OrderTrackingId }) {
  const client = init();
  await authenticate();
  return await client.get_transaction_status({ OrderTrackingId });
}

export default {
  authenticate,
  register_ipn_url,
  submit_order,
  get_transaction_status,
};
