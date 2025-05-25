import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  userId: { type:String, required: true },
  orderId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  contact: { type: String, required: true },
  coordinates: [{
    county: { type: String },
    town: { type: String },
    roomNo: { type: String },
    street: { type: String },
  }],
  items: {
    devices: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
    }],
    age: { type: String, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  orderedAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending delivery" },
  paymentDetails: {
    method: { type: String, required: true },
    details: {
      t_id: { type: String, required: true },
      pay: { type: Number, required: true },
      currency: { type: String, required: true, default: "Ksh" },
    },
  }
}, { timestamps: true });

const Order = model("Order", orderSchema);
export default Order;