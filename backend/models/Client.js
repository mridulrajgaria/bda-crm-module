const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    industry: {
      type: String,
      trim: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      maxlength: [2000],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    website: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

clientSchema.index({ company: 'text', contactPerson: 'text' });
clientSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Client', clientSchema);
