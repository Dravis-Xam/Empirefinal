import axios from 'axios';
import moment from 'moment';

const API_ID = import.meta.env.VITE_MID;
const API_KEY = import.meta.env.VITE_MKEY;
const PASSKEY = import.meta.env.VITE_MPASSKEY;
const SHORT_CODE = "542542";
const CALLBACK_URL = "http://localhost:5000/api/buy/callback";//must be a secure site

const generateAccessToken = async () => {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  try {
    const encodedCredentials = Buffer.from(`${API_ID}:${API_KEY}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(url, { headers });
    return response.data.access_token;

  } catch (e) {
    console.error(e);
    throw new Error('Failed to get access token');
  }
};

export const runSTK = async (n) => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const token = await generateAccessToken(); 
  const stkPassword = Buffer.from(SHORT_CODE + PASSKEY + timestamp).toString('base64');

  const requestBody = {
    BusinessShortCode: SHORT_CODE,
    Password: stkPassword,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: n.totalAmount,
    PartyA: n.mpesaNumber,
    PartyB: SHORT_CODE,
    PhoneNumber: n.mpesaNumber,
    CallBackURL: CALLBACK_URL,
    AccountReference: "959822",
    TransactionDesc: "Item(s) purchase."
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", requestBody, { headers });
    return response.data;
  } catch (e) {
    console.error(e.response?.data || e.message);
    throw new Error('Failed to initiate STK');
  }
};