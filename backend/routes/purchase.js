import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorise.js';
import { initiateStkPush } from '../utils/stkpush.js';

let orderI = 0 
let pay_details = [];

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

    const p_res = await initiateStkPush(contact, paymentDetails.details.pay, `ORD${orderI}`);

    if (paymentDetails.method === "mpesa") {
      let s = 'pending delivery';
      if (p_res.ResponseCode === "0") {
        s = 'dispatched'; 
      } else {
        console.log('STK Push Error:', p_res.errorMessage || p_res.ResponseDescription);
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
      status: s,
      paymentDetails
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Internal server error' });
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

router.post('/callback', (req, res) => {
  const callbackData = req.body;

  const result_code = callbackData.Body.stkCallback.ResultCode;

  if (result_code !== 0) {
    const error_message = callbackData.Body.stkCallback.ResultDesc;
    const response_data = { ResultCode: result_code, ResultDesc: error_message };
    return res.json(response_data);
  }

  const body = req.body.Body.stkCallback.CallbackMetadata;

  const amountObj = body.Item.find(obj => obj.Name === 'Amount');
  const amount = amountObj.Value

  const codeObj = body.Item.find(obj => obj.Name === 'MpesaReceiptNumber');
  const mpesaCode = codeObj.Value 

  const phoneNumberObj = body.Item.find(obj => obj.Name === 'PhoneNumber');
  const phone = phoneNumberObj.Value

  pay_details.push(mpesaCode,amount, phone);

  // Save the variables to a file or database, etc.
  // ...
  return res.json("success");
});

export default router;
