const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all events (with pagination, filtering, search)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by date range
    if (req.query.dateFrom) {
      query.date = { ...query.date, $gte: new Date(req.query.dateFrom) };
    }
    if (req.query.dateTo) {
      query.date = { ...query.date, $lte: new Date(req.query.dateTo) };
    }

    // Show only upcoming events by default
    if (req.query.upcoming !== 'false') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { ...query.date, $gte: today };
    }

    // Search by title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort options
    let sort = { date: 1 }; // Default: upcoming first
    if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'popular') {
      sort = { 'attendees.length': -1 };
    }

    const events = await Event.find(query)
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, time, location, capacity, category } = req.body;

    const eventData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      capacity: parseInt(capacity),
      category: category || 'other',
      creator: req.user._id,
      image: req.file ? req.file.path : '',
    };

    const event = await Event.create(eventData);
    
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'name email avatar');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner only)
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, time, location, capacity, category } = req.body;

    // Check if new capacity is less than current attendees
    if (capacity && parseInt(capacity) < event.attendees.length) {
      return res.status(400).json({
        message: `Cannot reduce capacity below current attendee count (${event.attendees.length})`,
      });
    }

    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date ? new Date(date) : event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.capacity = capacity ? parseInt(capacity) : event.capacity;
    event.category = category || event.category;

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (event.image) {
        const publicId = event.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`eventify/${publicId}`);
      }
      event.image = req.file.path;
    }

    const updatedEvent = await event.save();
    
    const populatedEvent = await Event.findById(updatedEvent._id)
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar');

    res.json(populatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    if (error.name === 'VersionError') {
      return res.status(409).json({ message: 'Event was modified by another user. Please refresh and try again.' });
    }
    res.status(500).json({ message: 'Server error updating event' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (owner only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete image from Cloudinary if exists
    if (event.image) {
      const publicId = event.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`eventify/${publicId}`);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// @desc    RSVP to an event (with concurrency handling)
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Use findOneAndUpdate with atomic operations for race condition prevention
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        // Ensure user is not already in attendees
        attendees: { $ne: req.user._id },
        // Ensure capacity is not exceeded using $expr for array length comparison
        $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
      },
      {
        // Add user to attendees atomically
        $push: { attendees: req.user._id },
      },
      {
        new: true,
        session,
      }
    )
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar');

    if (!event) {
      await session.abortTransaction();
      session.endSession();

      // Check why the operation failed
      const existingEvent = await Event.findById(req.params.id);
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (existingEvent.attendees.includes(req.user._id)) {
        return res.status(400).json({ message: 'You have already RSVPed to this event' });
      }

      if (existingEvent.attendees.length >= existingEvent.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity' });
      }

      return res.status(400).json({ message: 'Unable to RSVP. Please try again.' });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Successfully RSVPed to event',
      event,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Server error during RSVP' });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
const cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        attendees: req.user._id,
      },
      {
        $pull: { attendees: req.user._id },
      },
      { new: true }
    )
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar');

    if (!event) {
      // Check if event exists
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(400).json({ message: 'You are not RSVPed to this event' });
    }

    res.json({
      message: 'RSVP cancelled successfully',
      event,
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ message: 'Server error cancelling RSVP' });
  }
};

// @desc    Get user's created events
// @route   GET /api/events/user/created
// @access  Private
const getUserCreatedEvents = async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id })
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get user created events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get events user is attending
// @route   GET /api/events/user/attending
// @access  Private
const getUserAttendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id })
      .populate('creator', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get user attending events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  getUserCreatedEvents,
  getUserAttendingEvents,
};
