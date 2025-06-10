import pesapal from 'pesapaljs-v3';
import dotenv from 'dotenv';
dotenv.config();

const client = pesapal.init({
  key: process.env.PESAPAL_CONSUMER_KEY,
  secret: process.env.PESAPAL_CONSUMER_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

async function authenticate() {
  return await client.authenticate();
}

async function register_ipn_url({ url, ipn_notification_type = 'GET' }) {
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
  await authenticate();
  return await client.get_transaction_status({ OrderTrackingId });
}

export default {
  authenticate,
  register_ipn_url,
  submit_order,
  get_transaction_status,
};