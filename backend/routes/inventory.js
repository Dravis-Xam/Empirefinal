import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/authorise.js";
import Device from "../models/device.js";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/all', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const devices = await Device.find();
    if (!devices || devices.length === 0) {
      return res.status(404).json({ message: "No devices found" });
    }
    res.status(200).json({ devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/devices/add",
  authenticateToken,
  authorizeRole('inventory manager'),
  async (req, res) => {
    try {
      const device = new Device({
        ...req.body,
        deviceId: uuidv4(),
      });

      await device.save();
      res.status(201).json(device);
    } catch (error) {
      console.error("Error saving device:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "/devices/update/:id",
  authenticateToken,
  authorizeRole('inventory manager'),
  upload.none(),
  async (req, res) => {
    try {
      const updateData = req.body;
      
      for (const [key, val] of Object.entries(updateData)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try {
            updateData[key] = JSON.parse(val);
          } catch {
            continue;
          }
        }
      }

      const updated = await Device.findOneAndUpdate(
        { deviceId: req.params.id },
        updateData,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Device not found" });
      }

      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

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

export default router;