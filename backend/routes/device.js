import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Device from '../models/device.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorise.js';

const router = express.Router();

router.post('/add', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const data  = req.body;
    if (!data || !data.build) {
      return res.status(400).json({ message: 'Missing device data or build property' });
    }

    const existDevice = await Device.exists({ build: data.build }); 

    if (existDevice) {
      return res.status(409).json({ message: 'Device already exists' });
    }

    
    console.log(data); //test
    

    const device = await Device.create({
      id: uuidv4(),
      brand: data.brand,
      model: data.model,
      build: data.build,
      price: data.price,
      details: data.details,
      featured: data.isFeatured,
      comments: data.comments,
      rating: data.rating,
      amountInStock: data.amount,
    });

    console.log(device) //test

    res.status(200).json(device);
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get', async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findOne({ id }).exec();
    if (!device) return res.status(404).json({ message: 'Device not found' });
    res.status(200).json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update/:id', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const  data  = req.body;

    console.log(data); //test

    const { id } = req.params;
    const device = await Device.findOneAndUpdate({ id }, data, { new: true });

    if (!device) return res.status(404).json({ message: 'Device not found' });

    res.status(200).json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/remove/:id', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Device.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.status(200).json({ message: 'Device removed successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/search', async (req, res) => {
  const { q, brand, minPrice, maxPrice, ram } = req.query;

  const query = {};

  if (q) {
    query.$or = [
      { brand: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { build: { $regex: q, $options: 'i' } },
    ];
  }

  if (brand) query.brand = brand;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (ram) {
    query['details.RAM'] = Number(ram);
  }

  try {
    const results = await Device.find(query).limit(50);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err });
  }
});


export default router;
