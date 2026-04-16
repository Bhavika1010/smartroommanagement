const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, restrictTo } = require('../middleware/auth');

// Conflict detection helper
const checkConflict = async (roomId, date, startTime, endTime, excludeBookingId = null) => {
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const query = {
    room: roomId,
    date: { $gte: bookingDate, $lt: nextDay },
    status: 'approved',
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query).populate('requestedBy', 'name email');
  return conflict;
};

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ requestedBy: req.user._id })
      .populate('room', 'name roomNumber building type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings.' });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, roomId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (roomId) filter.room = roomId;

    const bookings = await Booking.find(filter)
      .populate('room', 'name roomNumber building type capacity')
      .populate('requestedBy', 'name email role studentId employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings.' });
  }
});

// @route   GET /api/bookings/room/:roomId
// @desc    Get bookings for a specific room (for availability display)
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {
      room: req.params.roomId,
      status: { $in: ['approved', 'pending'] }
    };
    if (date) {
      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(bookingDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: bookingDate, $lt: nextDay };
    }
    const bookings = await Booking.find(filter)
      .populate('requestedBy', 'name')
      .select('title startTime endTime status date requestedBy');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room bookings.' });
  }
});

// @route   POST /api/bookings
// @desc    Create a booking request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, title, description, date, startTime, endTime, attendees } = req.body;

    if (!roomId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Validate time range
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot book a room for a past date.' });
    }

    // Check room exists
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ message: 'Room not found or unavailable.' });
    }

    // Check attendees vs capacity
    if (attendees && attendees > room.capacity) {
      return res.status(400).json({
        message: `Attendee count (${attendees}) exceeds room capacity (${room.capacity}).`
      });
    }

    // Conflict detection
    const conflict = await checkConflict(roomId, date, startTime, endTime);
    const hasConflict = !!conflict;

    const booking = await Booking.create({
      room: roomId,
      requestedBy: req.user._id,
      title,
      description: description || '',
      date: bookingDate,
      startTime,
      endTime,
      attendees: attendees || 1,
      hasConflict
    });

    await booking.populate('room', 'name roomNumber building type');

    const responseData = { booking };
    if (hasConflict) {
      responseData.warning = `Note: There is an approved booking for this time slot ("${conflict.title}"). Your request is pending admin review.`;
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Error creating booking.' });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Approve or reject a booking
// @access  Admin
router.patch('/:id/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be reviewed.' });
    }

    // If approving, check for conflicts one more time
    if (status === 'approved') {
      const conflict = await checkConflict(
        booking.room,
        booking.date,
        booking.startTime,
        booking.endTime,
        booking._id
      );
      if (conflict) {
        return res.status(409).json({
          message: `Cannot approve: conflicts with existing approved booking "${conflict.title}" by ${conflict.requestedBy?.name}.`,
          conflict: {
            title: conflict.title,
            startTime: conflict.startTime,
            endTime: conflict.endTime
          }
        });
      }
    }

    booking.status = status;
    booking.adminNote = adminNote || '';
    booking.reviewedBy = req.user._id;
    booking.reviewedAt = new Date();
    await booking.save();

    await booking.populate('room', 'name roomNumber building type');
    await booking.populate('requestedBy', 'name email role');

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status.' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (own bookings only, or admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Only owner or admin can cancel
    if (booking.requestedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    if (['rejected', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking is already cancelled or rejected.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking.' });
  }
});

module.exports = router;
