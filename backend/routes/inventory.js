import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/authorise.js";
import Device from "../models/device.js";
import { upload } from "../middleware/imgStorage.js";
import path from 'path';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
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
/** 
router.post('/devices/add', upload.array("images"), authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const {
      deviceId,
      brand,
      model,
      build,
      price,
      details,
      featured,
      comments,
      rating,
      amountInStock,
    } = req.body;

    if (!deviceId || !brand || !model || !build || price == null || amountInStock == null) {
      return res.status(400).json({ message: "Missing required device fields" });
    }

    const newDevice = new Device({
      deviceId,
      brand,
      model,
      build,
      price,
      details,
      featured,
      comments,
      rating,
      amountInStock,
    });

    const savedDevice = await newDevice.save();
    res.status(201).json({ message: "Device added successfully", device: savedDevice });
  } catch (error) {
    console.error("Error adding device:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Device ID or build must be unique" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch('/devices/update/:id', authenticateToken, authorizeRole('inventory manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedDevice = await Device.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedDevice) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device updated successfully", device: updatedDevice });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
router.post("/devices/add", upload.array("images", 10), async (req, res) => {
  try {
    const {
      deviceId,
      brand,
      model,
      build,
      price,
      amountInStock,
      featured,
    } = req.body;

    const details = JSON.parse(req.body.details);

    const imagePaths = req.files.map((file) =>
      path.join("uploads", "devices", file.filename)
    );

    const device = new Device({
      deviceId,
      brand,
      model,
      build,
      price,
      amountInStock,
      featured: featured === "true" || featured === true,
      details: {
        ...details,
        images: imagePaths, 
      },
    });

    await device.save();
    res.status(201).json(device);
  } catch (error) {
    console.error("Error saving device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put("/devices/update/:id", upload.array("images", 5), async (req, res) => {
  try {
    const details = JSON.parse(req.body.details);
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const updateData = {
      ...req.body,
      details,
    };

    if (imagePaths.length > 0) {
      updateData.images = imagePaths;
    }

    const updated = await Device.findOneAndUpdate(
      { deviceId: req.params.id },
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;