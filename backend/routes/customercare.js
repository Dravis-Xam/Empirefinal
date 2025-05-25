import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/authorise.js";
import Order from "../models/order.js";

const router = express.Router();

router.get(
  '/orders/get-latest',
  authenticateToken,
  authorizeRole('customer care'),
  async (req, res) => {
    try {
      const orders = await Order.find({ status: 'pending delivery' });

      if (!orders || orders.length === 0)
        return res.status(404).json({ message: 'No orders currently' });

      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching order: ', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.patch(
  '/status/:orderId',
  authenticateToken,
  authorizeRole('customer care'),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Missing status update' });
      }

      const order = await Order.findOneAndUpdate(
        { orderId },
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({
        message: 'Order status updated',
        orderId: order.orderId,
        newStatus: order.status,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);



router.get('/orders/fallback', authenticateToken, authorizeRole("customer care"), async(req, res) => {
  const mockOrders = [
  {
    orderId: 'ORD-001',
    username: 'ken_ngovi',
    contact: '0700000000',
    coordinates: ['-1.2833', '36.8167'],
    items: {
      devices: [
        { name: 'Phone', price: 45000 },
        { name: 'Tablet', price: 30000 },
        { name: 'Laptop', price: 50000 }
      ],
      age: 'New',
      totalPrice: 125000
    },
    orderedAt: new Date('2025-05-10T09:00:00Z'),
    status: 'pending delivery',
    paymentDetails: {
      method: 'Mpesa',
      details: {
        t_id: 'TX123456',
        pay: 125000,
        currency: 'Ksh'
      }
    }
  },
  {
    orderId: 'ORD-002',
    username: 'martha_tech',
    contact: '0700000000',
    coordinates: ['-0.0236', '37.9062'],
    items: {
      devices: [{ name: 'Smartwatch', price: 9500 }],
      age: 'XUK',
      totalPrice: 9500
    },
    orderedAt: new Date('2025-05-09T12:30:00Z'),
    status: 'Dispatched',
    paymentDetails: {
      method: 'Card',
      details: {
        t_id: 'TX654321',
        pay: 9500,
        currency: 'Ksh'
      }
    }
  },
  {
    orderId: 'ORD-003',
    username: 'alex_maina',
    contact: '0700000000',
    coordinates: ['0.5167', '35.2833'],
    items: {
      devices: [
        { name: 'TV', price: 30000 },
        { name: 'Soundbar', price: 15000 }
      ],
      age: 'PreOwned',
      totalPrice: 45000
    },
    orderedAt: new Date('2025-05-07T15:45:00Z'),
    status: 'In delivery',
    paymentDetails: {
      method: 'Mpesa',
      details: {
        t_id: 'TX789012',
        pay: 45000,
        currency: 'Ksh'
      }
    }
  },
  {
    orderId: 'ORD-004',
    username: 'lucy_dev',
    contact: '0700000000',
    coordinates: ['-1.2921', '36.8219'],
    items: {
      devices: [
        { name: 'Gaming Console', price: 30000 },
        { name: 'Headset', price: 8500 }
      ],
      age: 'PreOwned',
      totalPrice: 38500
    },
    orderedAt: new Date('2025-05-06T11:15:00Z'),
    status: 'Awaiting pickup',
    paymentDetails: {
      method: 'Card',
      details: {
        t_id: 'TX345678',
        pay: 38500,
        currency: 'Ksh'
      }
    }
  },
  {
    orderId: 'ORD-005',
    username: 'tony_admin',
    contact: '0700000000',
    coordinates: ['1.2921', '36.8219'],
    items: {
      devices: [{ name: 'Smart Fridge', price: 89000 }],
      age: 'New',
      totalPrice: 89000
    },
    orderedAt: new Date('2025-05-03T17:00:00Z'),
    status: 'Arrived at destination',
    paymentDetails: {
      method: 'Mpesa',
      details: {
        t_id: 'TX112233',
        pay: 89000,
        currency: 'Ksh'
      }
    }
  },
  ...Array.from({ length: 6 }, (_, i) => {
    const orderNum = 6 + i;
    return {
      orderId: `ORD-00${orderNum}`,
      username: 'winnie_kit',
      contact: '0700000000',
      userId: "66505fc0e8a2a3c2b71e47a2",
      coordinates: ['-0.425', '36.951'],
      items: {
        devices: [
          { name: 'Microwave', price: 7500 },
          { name: 'Blender', price: 8000 }
        ],
        age: 'New',
        totalPrice: 15500
      },
      orderedAt: new Date('2025-04-28T14:20:00Z'),
      status: 'complete',
      paymentDetails: {
        method: 'Card',
        details: {
          t_id: 'TX998877',
          pay: 15500,
          currency: 'Ksh'
        }
      }
    };
  })
];
  res.status(200).json(mockOrders);
})


export default router;