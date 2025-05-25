import express from 'express';
import Coupon from '../models/coupon.js';
import Client from '../models/client.js';
import { authorizeRole } from '../middleware/authorise.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/award-coupon/:username', authenticateToken, authorizeRole('customer care'), async (req, res) => {
  let username = req.params.username;
  username = username?.trim();
  const { offer, expires } = req.body;

  try {
    const user = await Client.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const couponData = {
      couponId: uuid(),
      username,
      offer,
      expires: expires ? new Date(expires) : new Date(),
      used: false
    };

    const newCoupon = new Coupon(couponData);
    await newCoupon.save();

    res.status(201).json({ message: 'Coupon awarded!', coupon: newCoupon });
  } catch (err) {
    console.error('Error awarding coupon:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-coupons/:username', authenticateToken ,  async (req, res) => {
  const { username } = req.params;

  try {
    const coupons = await Coupon.find({ username: new RegExp(`^${username}$`, 'i') });

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({ message: 'No coupons found for this user.' });
    }

    res.status(200).json({ coupons });

  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put(
  '/update-coupon/:username/:couponId',
  authenticateToken,
  authorizeRole('customer care'),
  async (req, res) => {
    const { username, couponId } = req.params;
    const { used } = req.body;

    try {
      const coupon = await Coupon.findOneAndUpdate(
        { username: new RegExp(`^${username}$`, 'i'), couponId: couponId },
        { $set: { used } },
        { new: true }
      );

      if (!coupon) {
        return res.status(404).json({ message: 'No matching coupon found.' });
      }

      res.json({ message: 'Coupon updated successfully.', coupon });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);


export default router;