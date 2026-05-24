const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lead title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
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
    source: {
      type: String,
      enum: ['cold-call', 'email', 'referral', 'social-media', 'website', 'trade-show', 'exhibition', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    value: {
      type: Number,
      default: 0,
      min: [0, 'Value cannot be negative'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    product: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expectedCloseDate: {
      type: Date,
    },
    actualCloseDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    lostReason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ company: 'text', contactPerson: 'text', title: 'text' });
leadSchema.index({ createdAt: -1 });

// Virtual: days since creation
leadSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

leadSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Lead', leadSchema);
