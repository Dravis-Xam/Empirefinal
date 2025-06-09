const API_ID = process.env.CUSTOMER_KEY;
const API_KEY = process.env.CUSTOMER_SECRET;
const PASSKEY = process.env.PASSKEY;
const SHORT_CODE = "542542";
const CALLBACK_URL = `https://empirehubphones.onrender.com/api/buy/callback`;
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

const env = process.env.NODE_ENV;
const uri = env === 'developer' ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' : 'https://api.safaricom.co.ke/oauth/v2/generate?grant_type=client_credentials';

const getAccessToken = async () => {
  const uri = process.env.NODE_ENV === 'developer'
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v2/generate?grant_type=client_credentials';

  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${API_ID}:${API_KEY}`).toString('base64'),
    },
  });

  const data = await response.json();
  return data.access_token;
};


export const initiateStkPush = async (phone, amount, orderId) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const password = Buffer.from(SHORT_CODE + PASSKEY + timestamp).toString('base64');

  const res = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      "BusinessShortCode": SHORT_CODE,
      "Password": password,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": phone,               // Customer phone
      "PartyB": SHORT_CODE,          // Your Paybill
      "PhoneNumber": phone,          // Customer again
      "CallBackURL": CALLBACK_URL,   // Backend callback
      "AccountReference": orderId,
      "TransactionDesc": `Payment for order ${orderId}`
    })
  });

  const result = await res.json();
  console.log('STK Push Response:', result);
  return result;
};


