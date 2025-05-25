import mongoose from "mongoose";

const { Schema, model } = mongoose;

const couponSchema = new Schema({
  couponId: {
    type: String
  },
  username: {
    type: String,
    required: true,
  },
  offer: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    default: Date.now()
  },
  used: {
    type: Boolean
  }
});

const Coupon = model("Coupon", couponSchema);
export default Coupon;
