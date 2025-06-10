import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema({
  trackingId: { type: String, required: true },
  status: { type: String, default: 'unknown' },
  logType: { type: String, enum: ['success', 'error'], default: 'success' },
  rawResponse: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now },
});

const PaymentLog = model('PaymentLog', paymentLogSchema);
export default PaymentLog;