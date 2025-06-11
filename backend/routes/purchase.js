import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorise.js';
import { initiateStkPush } from '../utils/stkpush.js';
import PaymentLog from '../models/paymentLogs.js';
import pesapal from '../utils/pesapal.js';

const router = express.Router();

let orderI = Order.countDocuments() + 1;
const CALLBACK_URL=process.env.CALLBACK_URL
const IPN_URL=process.env.IPN_URL

router.post('/', authenticateToken, async (req, res) => {
  const { paymentDetails, items, coordinates, contact } = req.body;
  const username = req.user?.username || 'unknown_user';

  let status = 'pending';

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

    if (paymentDetails.method === 'mpesa') {
      const p_res = await initiateStkPush(contact, paymentDetails.details.pay, `ORD${orderI}`);
      status = p_res.ResponseCode === "0" ? 'dispatched' : 'pending delivery';
    }

    // Skip card payment; it should be handled in /card
    const order = await Order.create({
      orderId: `ORD${orderI++}`,
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

router.post('/card', authenticateToken, async (req, res) => {
  const { amount, name, email, phone } = req.body;
  const username = req.user?.username || null;

  if (username ) return res.status(400).json({message: 'Username cannot be null'})

  // Input validation
  if (!amount || !name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Register IPN URL
    const ipnResult = await register_ipn_url({
      url: IPN_URL,
      ipn_notification_type: "GET",
    });

    const notification_id = ipnResult.ipn_id; // Note: field name is ipn_id in API response
    const merchantReference = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Submit order with enhanced billing details
    const order = await submit_order({
      id: merchantReference,
      currency: "KES",
      amount,
      description: `Payment from ${name} (${username})`,
      callback_url: CALLBACK_URL,
      notification_id,
      billing_address: {
        email_address: email,
        phone_number: phone,
        first_name: name.split(' ')[0] || '',
        last_name: name.split(' ')[1] || '',
        country_code: "KE",
        line_1: phone, // Required field
        city: "Nairobi", // Adjust as needed
        postal_code: "00100" // Adjust as needed
      }
    });

    // Log the initial payment request
    await PaymentLog.create({
      trackingId: order.order_tracking_id,
      status: 'initiated',
      logType: 'request',
      amount: amount,
      customerEmail: email,
      customerPhone: phone
    });

    res.status(200).json({
      iframe: order.redirect_url, // Note: field name is redirect_url in API response
      trackingId: order.order_tracking_id,
      merchantReference: merchantReference,
      message: "Payment initiated successfully"
    });

  } catch (err) {
    console.error("Pesapal Payment error:", err);

    await PaymentLog.create({
      trackingId: 'failed-' + Date.now(),
      status: 'failed',
      logType: 'error',
      rawResponse: { message: err.message },
      amount: amount,
      customerEmail: email,
      customerPhone: phone
    });

    res.status(500).json({ 
      error: "Payment processing failed",
      details: err.message 
    });
  }
});

// Enhanced callback handler
router.get("/cc-callback", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;
  
  console.log(`Payment callback received for: ${OrderTrackingId}`);
  
  try {
    // Log the callback
    await PaymentLog.create({
      trackingId: OrderTrackingId,
      merchantReference: OrderMerchantReference,
      status: 'callback_received',
      logType: 'callback',
      notificationType: OrderNotificationType
    });

    
    //res.redirect(`https://empirefinal-osrw.vercel.app/track-delivery?trackingId=${OrderTrackingId}`);
    
    res.send(`
      <html>
        <body>
          <h1>Payment processing complete</h1>
          <p>You may close this window or <a href="https://empirefinal-osrw.vercel.app">return to our site</a>.</p>
          <script>
            // Optional: Notify parent window
            window.opener.postMessage({ pesapalPaymentComplete: true, trackingId: '${OrderTrackingId}' }, '*');
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Callback logging error:", err);
    res.send("Payment received. Thank you!");
  }
});

// Enhanced IPN handler
router.post("/ipn", async (req, res) => {
  const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } = req.body;

  try {
    // Get transaction status from Pesapal
    const status = await pesapal.get_transaction_status({ OrderTrackingId });

    // Log the IPN
    await PaymentLog.create({
      trackingId: OrderTrackingId,
      merchantReference: OrderMerchantReference,
      status: status.payment_status_description || 'Unknown',
      logType: 'ipn',
      notificationType: OrderNotificationType,
      rawResponse: status
    });

    console.log(`✅ Payment IPN received for ${OrderTrackingId}:`, status);

    // Here you would typically:
    // 1. Update your database with payment status
    // 2. Send email notifications
    // 3. Trigger any post-payment actions

    res.status(200).send("IPN Received");
  } catch (err) {
    console.error("❌ IPN error:", err.message);

    await PaymentLog.create({
      trackingId: OrderTrackingId || 'unknown',
      status: 'ipn_error',
      logType: 'error',
      rawResponse: { message: err.message }
    });

    res.status(200).send("IPN Error handled internally");
  }
});

/*
router.post("/validate-charge", async (req, res) => {
  const { otp, flw_ref } = req.body;
  try {
    const resp = await flw.Charge.validate({ otp, flw_ref });
    res.json(resp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

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
          "paymentDetails.details.t_id": checkoutRequestID,
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
