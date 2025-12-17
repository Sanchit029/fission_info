const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date'],
    },
    time: {
      type: String,
      required: [true, 'Please add an event time'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please add event capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['conference', 'workshop', 'meetup', 'concert', 'sports', 'party', 'other'],
      default: 'other',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Version field for optimistic concurrency control
    __v: {
      type: Number,
      select: true,
    },
  },
  {
    timestamps: true,
    // Enable optimistic concurrency control
    optimisticConcurrency: true,
  }
);

// Index for efficient queries
eventSchema.index({ date: 1, category: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.attendees.length;
});

// Ensure virtuals are included in JSON output
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
