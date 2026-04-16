const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, restrictTo } = require('../middleware/auth');

// @route   GET /api/rooms
// @desc    Get all active rooms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, capacity, building } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (building) filter.building = new RegExp(building, 'i');
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };

    const rooms = await Room.find(filter).sort({ building: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms.' });
  }
});

// @route   GET /api/rooms/all
// @desc    Get all rooms including inactive (admin)
// @access  Admin
router.get('/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const rooms = await Room.find().sort({ building: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms.' });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get a single room
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room.' });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Admin
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { name, roomNumber, building, floor, capacity, type, amenities, description } = req.body;

    if (!name || !roomNumber || !building || floor === undefined || !capacity || !type) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Check duplicates
    const existing = await Room.findOne({
      $or: [{ name }, { roomNumber }]
    });
    if (existing) {
      return res.status(400).json({ message: 'Room name or number already exists.' });
    }

    const room = await Room.create({
      name, roomNumber, building, floor, capacity, type,
      amenities: amenities || [],
      description: description || ''
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room.' });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update a room
// @access  Admin
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const { name, roomNumber, building, floor, capacity, type, amenities, description, isActive } = req.body;

    // Check for duplicate name/number (excluding current)
    if (name !== room.name || roomNumber !== room.roomNumber) {
      const existing = await Room.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name }, { roomNumber }]
      });
      if (existing) {
        return res.status(400).json({ message: 'Room name or number already exists.' });
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { name, roomNumber, building, floor, capacity, type, amenities, description, isActive },
      { new: true, runValidators: true }
    );

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room.' });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room (soft delete)
// @access  Admin
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room.' });
  }
});

module.exports = router;
