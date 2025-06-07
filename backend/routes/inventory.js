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

router.put(
  "/devices/update/:id",
  authenticateToken,
  authorizeRole('inventory manager'),
  upload.none(),
  async (req, res) => {
    try {
      const {
        brand,
        model,
        build,
        colors,
        images,
        price,
        featured,
        amountInStock,
        details
      } = req.body;

      const updateData = {
        ...(brand && { brand }),
        ...(model && { model }),
        ...(build && { build }),
        ...(colors && { colors }),
        ...(images && { images }),
        ...(price && { price }),
        ...(featured !== undefined && { featured }),
        ...(amountInStock && { amountInStock }),
        ...(details && {
          details: {
            ...(details.age && { age: details.age }),
            ...(details.storage && { storage: details.storage }),
            ...(details.RAM && { RAM: details.RAM }),
            ...(details.processorType && { processorType: details.processorType }),
            ...(details.CAMResolution && { CAMResolution: details.CAMResolution }),
            ...(details.os && { os: details.os }),
            ...(details.batteryLife && {
              batteryLife: {
                ...(details.batteryLife.hours && { hours: details.batteryLife.hours }),
                ...(details.batteryLife.percentage && { percentage: details.batteryLife.percentage })
              }
            })
          }
        })
      };

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

router.post(
  "/devices/add",
  authenticateToken,
  authorizeRole('inventory manager'),
  async (req, res) => {
    try {
      const {
        brand,
        model,
        build,
        colors,
        images,
        price,
        featured,
        amountInStock,
        details: {
          age,
          storage,
          RAM,
          processorType,
          CAMResolution,
          os,
          batteryLife: {
            hours: batteryHours,
            percentage: batteryPercentage
          }
        }
      } = req.body;

      const device = new Device({
        deviceId: uuidv4(),
        brand,
        model,
        build: build || undefined, // Optional field
        colors: colors || [],
        images: images || [],
        price,
        featured: featured || false,
        amountInStock,
        details: {
          age,
          storage,
          RAM,
          processorType,
          CAMResolution: CAMResolution || [],
          os,
          batteryLife: {
            hours: batteryHours,
            percentage: batteryPercentage
          }
        }
      });

      await device.save();
      res.status(201).json(device);
    } catch (error) {
      console.error("Error saving device:", error);
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