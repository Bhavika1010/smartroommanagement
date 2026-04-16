const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    unique: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
    unique: true
  },
  building: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  type: {
    type: String,
    enum: ['classroom', 'seminar_hall', 'lab', 'conference_room', 'auditorium'],
    required: [true, 'Room type is required']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
