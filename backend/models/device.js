import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const deviceSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  build: {
    type: String,
    required: false,
    unique: true,
  },
  colors: {
    type: [String] //set to receive colors array of strings  - good
  },
  images: {//set to receive image url array of strings  - good
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  details: {
    age: {
      type: String,
    },
    storage: {
      type: Number
    },
    RAM: {
      type: Number
    },
    processorType: {
      type: String
    },
    CAMResolution: {
      type: [String],
      default: [],
    },
    os: {
      type: String
    },
    batteryLife: {
      hours: {
        type: Number,
        min: 0,
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  amountInStock: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

const Device = model('Device', deviceSchema);
export default Device;