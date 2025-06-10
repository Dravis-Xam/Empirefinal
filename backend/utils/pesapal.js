import Pesapal from 'pesapaljs-v3';
import dotenv from 'dotenv';
dotenv.config();

let instance;
let accessToken;

function init() {
  if (!instance) {
    instance = new Pesapal({
      key: process.env.PESAPAL_CONSUMER_KEY,
      secret: process.env.PESAPAL_CONSUMER_SECRET,
      debug: process.env.NODE_ENV === 'developer',
    });
  }
  return instance;
}

async function authenticate() {
  const pesapal = init();
  accessToken = await pesapal.authenticate();
  return accessToken;
}

async function register_ipn_url({ url, ipn_notification_type = 'GET' }) {
  const pesapal = init();
  await authenticate(); 
  const result = await pesapal.register_ipn_url({ url, ipn_notification_type });
  return result;
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
  const pesapal = init();
  await authenticate();
  const order = await pesapal.submit_order({
    id,
    currency,
    amount,
    description,
    callback_url,
    notification_id,
    billing_address,
  });
  return order;
}

async function get_transaction_status({ OrderTrackingId }) {
  const pesapal = init();
  await authenticate();
  return await pesapal.get_transaction_status({ OrderTrackingId });
}

export default {
  authenticate,
  register_ipn_url,
  submit_order,
  get_transaction_status,
};
