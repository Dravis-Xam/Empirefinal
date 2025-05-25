import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
  },
  user: {
    username: String,
    role: String,
    userId: mongoose.Schema.Types.ObjectId,
  },
  location: {
    pathname: String, 
    component: String, 
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'error',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, 
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model('ErrorLog', errorLogSchema);