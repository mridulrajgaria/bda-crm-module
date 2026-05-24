const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'demo', 'follow-up', 'note', 'task'],
      required: [true, 'Activity type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200],
    },
    description: {
      type: String,
      maxlength: [2000],
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    outcome: {
      type: String,
      trim: true,
      maxlength: [500],
    },
    duration: {
      type: Number, // minutes
      min: 0,
    },
    nextAction: {
      type: String,
      trim: true,
    },
    nextActionDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, status: 1 });
activitySchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Activity', activitySchema);
