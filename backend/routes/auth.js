import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Client from '../models/client.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await Client.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Client.create({
      username,
      email,
      password: hashedPassword,
      role: "client",
      preferredPaymentOption: 'mpesa',
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  console.log(req.body.username)
  try {
    const { username, password } = req.body;

    const user = await Client.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    //console.log('Signing token with secret:', process.env.SECRET_KEY);
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,         // ✅ only over HTTPS
      sameSite: 'None',     // ✅ required for cross-site
      maxAge: 24 * 7 * 60 * 60 * 1000
    });


    res.status(200).json({ role: user.role, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

router.put('/update-profile', authenticateToken, async (req, res) => {
  const { email, password } = req.body;
  const username = req.user.username;

  try {
    const user = await Client.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingEmail = await Client.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

const recoveryCodes = new Map();

router.get('/send-recovery-code/:email', async (req, res) => {
  const { email } = req.params;
  console.log(email)

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await Client.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const code = crypto.randomBytes(3).toString('hex');
  recoveryCodes.set(email, code);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Recovery Code',
    text: `Your password recovery code is: ${code}`
  });

  res.json({ message: 'Recovery code sent' });
});


router.post('/verify-recovery-code', (req, res) => {
  const { email, code } = req.body;

  if (!recoveryCodes.has(email)) return res.status(400).json({ message: 'No code sent to this email' });
  if (recoveryCodes.get(email) !== code) return res.status(400).json({ message: 'Invalid code' });

  res.json({ message: 'Code verified' });
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await Client.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    recoveryCodes.delete(email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
