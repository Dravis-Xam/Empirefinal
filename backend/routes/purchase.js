import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorise.js';
import { initiateStkPush } from '../utils/stkpush.js';
import { init } from 'pesapaljs-v3';

let orderI = 0 
let pay_details = [];
const CALLBACK_URL='https://empirehubphones.onrender.com/api/buy/cc-callback'
const IPN_URL='https://empirehubphones.onrender.com/api/buy/ipn'

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  console.log("Request body:", req.body);

  const { paymentDetails, items, coordinates, contact, status} = req.body;
  const username = req.user?.username || 'unknown_user';

  orderI = orderI + 1;

  try {
    if (
      !paymentDetails ||
      !items?.devices ||
      !Array.isArray(items.devices) ||
      !coordinates ||
      !contact
    ) {
      return res.status(400).json({ message: 'Incomplete payload' });
    }

    const totalPrice = items.totalPrice ?? (
      items.devices.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
    );

    

    if (paymentDetails.method === "mpesa") {
      const p_res = await initiateStkPush(contact, paymentDetails.details.pay, `ORD${orderI}`);

      status = 'pending delivery';
      if (p_res.ResponseCode === "0") {
        status = 'dispatched'; 
      } else {
        console.log('STK Push Error:', p_res.errorMessage || p_res.ResponseDescription);
      }
    }

    if (paymentDetails.method === 'card') {      
      const pesapal = init({
        key: process.env.PESAPAL_CONSUMER_KEY,
        secret: process.env.PESAPAL_CONSUMER_SECRET,
        debug: process.env.NODE_ENV === "developer",
      });

      let notification_id;

      // 1. Authenticate and register IPN once
      (async () => {
        try {
          pesapal.authenticate();

          const result = await pesapal.register_ipn_url({
            url: IPN_URL,
            ipn_notification_type: "GET",
          });

          notification_id = result.notification_id;
          console.log("Registered IPN ID:", notification_id);
        } catch (err) {
          console.error("Pesapal setup error:", err.message);
        }
      })();

       const { email, name } = req.body;

      try {
        pesapal.authenticate(); // renew token

        const tx_ref = "TX-" + Date.now();

        const order = await pesapal.submit_order({
          id: tx_ref,
          currency: "KES",
          amount: paymentDetails.details.pay,
          description: "Payment from " + name,
          callback_url: CALLBACK_URL,
          notification_id,
          billing_address: {
            email_address: email,
            phone_number: contact,
            username: username
          },
        });

        res.json({ iframe: order.iframe_url, trackingId: order.order_tracking_id });
      } catch (err) {
        console.error("Order submission failed:", err.message);
        res.status(500).json({ error: err.message });
      }
    }

    const order = await Order.create({
      orderId: `ORD${orderI}`,
      username,
      userId: uuidv4(),
      contact,
      coordinates,
      items: {
        devices: items.devices,
        age: items.age || " ",
        totalPrice
      },
      orderedAt: new Date(),
      status,
      paymentDetails
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/cc-callback", (req, res) => {
  const { OrderTrackingId } = req.query;
  console.log("Payment callback received for:", OrderTrackingId);
  res.send("Payment processing... You may close this page.");
});

router.get("/ipn", async (req, res) => {
  const { OrderTrackingId } = req.query;
  try {
    await pesapal.authenticate();
    const status = await pesapal.get_transaction_status({ OrderTrackingId });
    console.log("Payment IPN received:", status);
    res.status(200).send("IPN Received");
  } catch (err) {
    console.error("IPN error:", err.message);
    res.status(500).send("Error");
  }
});

router.post("/validate-charge", async (req, res) => {
  const { otp, flw_ref } = req.body;
  try {
    const resp = await flw.Charge.validate({ otp, flw_ref });
    res.json(resp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/by-transaction/:t_ID', async (req, res) => {
  try {
    const t_id = req.params.t_ID;
    const order = await Order.findOne({ 'paymentDetails.details.t_id': t_id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/status/by-order-id/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put(
  "/update-status/:orderId",
  authenticateToken,
  authorizeRole('customer care'),
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Missing 'status' in request body." });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status } },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found." });
      }

      res.json({
        message: "Order status updated successfully.",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

import fs from 'fs';

router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    const stkCallback = callbackData?.Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ message: 'Invalid callback payload' });
    }

    const resultCode = stkCallback.ResultCode;

    if (resultCode !== 0) {
      console.warn('STK Push failed:', stkCallback.ResultDesc);
      return res.json({
        ResultCode: resultCode,
        ResultDesc: stkCallback.ResultDesc
      });
    }

    const metadata = stkCallback.CallbackMetadata?.Item;
    if (!metadata || !Array.isArray(metadata)) {
      return res.status(400).json({ message: 'Missing CallbackMetadata' });
    }

    const getValue = (name) => {
      const item = metadata.find(i => i.Name === name);
      return item?.Value;
    };

    const amount = getValue('Amount');
    const receipt = getValue('MpesaReceiptNumber');
    const phone = getValue('PhoneNumber');
    const transactionDate = getValue('TransactionDate');
    const checkoutRequestID = stkCallback.CheckoutRequestID;

    fs.appendFileSync('mpesa_callbacks.log', JSON.stringify(req.body, null, 2) + '\n');

    const order = await Order.findOneAndUpdate(
      { "paymentDetails.phone": phone },
      {
        $set: {
          "paymentDetails.t_id": checkoutRequestID,
          "status": "dispatched"
        }
      },
      { new: true }
    );

    if (!order) {
      console.warn('Order not found for contact:', phone);
    } else {
      console.log('Order payment updated:', order.orderId);
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Payment received successfully' });

  } catch (err) {
    console.error('Callback error:', err);
    return res.status(500).json({ message: 'Server error processing callback' });
  }
});

export default router;
