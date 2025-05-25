import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorise.js';
import Order from '../models/order.js';
import Client from '../models/client.js';
import ErrorLog from '../models/ErrorStruct.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/get-orders', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) return res.status(404).json({ message: 'No orders yet' });
    if (orders.length === 0) return res.status(404).json({ message: 'No orders yet' });
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-clients', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const clients = await Client.find();
    if (!clients) return res.status(404).json({ message: 'No clients yet' });
    res.status(200).json({ clients });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-clients/:username', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const user = await Client.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Client does not exist' });
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-db/stats', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const projectId = process.env.MONGO_ATLAS_PROJECT_ID;
    const clusterNode = process.env.MONGO_ATLAS_CLUSTER_NODE;

    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${projectId}/processes/${clusterNode}/measurements`;

    const response = await axios.get(url, {
      auth: {
        username: process.env.MONGO_ATLAS_PUBLIC_KEY,
        password: process.env.MONGO_ATLAS_PRIVATE_KEY,
      },
      params: {
        granularity: 'PT1H',
        period: 'PT24H',
        m: [
          'DATABASE_AVERAGE_QUERY_EXECUTION_TIME',
          'DATABASE_MEMORY_USAGE',
          'OPCOUNTER_INSERT',
          'OPCOUNTER_QUERY',
          'OPCOUNTER_COMMAND',
        ],
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error fetching DB stats:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to retrieve DB stats' });
  }
});

router.get('/get-daily-stats', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const signupsToday = await Client.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const ordersMadeToday = await Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const ordersCompletedToday = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'delivered',
    });

    res.status(200).json({
      date: today.toISOString().split('T')[0],
      signupsToday,
      ordersMadeToday,
      ordersCompletedToday,
    });
  } catch (err) {
    console.error('Error fetching daily stats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/errors', async (req, res) => {
  try {
    const savedError = await ErrorStruct.create(req.body);
    res.status(201).json({ message: 'Error logged successfully.' });
  } catch (err) {
    console.error('Failed to log error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/errors/log', authenticateToken, authorizeRole('developer'), async(req, res) => {
  try {
    const errors = await ErrorLog.find().sort({ timestamp: -1 });
    
    if (errors.length === 0) {
      return res.status(200).json({ 
        message: "No errors found",
        errorLogs: [] 
      });
    }

    res.status(200).json({ 
      message: "Errors retrieved successfully",
      errorLogs: errors 
    });
  } catch(error) {
    console.error('Failed to fetch error-data', error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message 
    });
  }
});
/*
router.get('/errors/frequency', authenticateToken, authorizeRole('developer'), async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const frequencyData = await ErrorStruct.aggregate([
      { $match: { timestamp: { $gte: fiveMinutesAgo } } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      errors: frequencyData.map(item => ({
        level: item._id,
        count: item.count
      }))
    });
  } catch (err) {
    console.error('Error fetching frequency data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
*/

export default router;