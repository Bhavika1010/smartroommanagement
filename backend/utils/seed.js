const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Room = require('../models/Room');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

   
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing data');

    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        phone: '9800000001'
      },
      {
        name: 'Prof. Rajesh Sharma',
        email: 'prof.sharma@college.edu',
        password: 'faculty123',
        role: 'faculty',
        employeeId: 'FAC001',
        department: 'Computer Science',
        phone: '9800000002'
      },
      {
        name: 'Prof. Priya Mehta',
        email: 'prof.mehta@college.edu',
        password: 'faculty123',
        role: 'faculty',
        employeeId: 'FAC002',
        department: 'Electronics',
        phone: '9800000003'
      },
      {
        name: 'Alice Johnson',
        email: 'alice@college.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU2024001',
        department: 'Computer Science',
        phone: '9800000004'
      },
      {
        name: 'Bob Williams',
        email: 'bob@college.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU2024002',
        department: 'Electronics',
        phone: '9800000005'
      },
      {
        name: 'Carol Davis',
        email: 'carol@college.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU2024003',
        department: 'Mechanical',
        phone: '9800000006'
      }
    ];

   
    const createdUsers = await User.insertMany(
      await Promise.all(users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12)
      })))
    );
    console.log(`✅ Created ${createdUsers.length} users`);

   
    const rooms = [
      {
        name: 'Innovation Lab',
        roomNumber: 'A-101',
        building: 'Academic Block A',
        floor: 1,
        capacity: 30,
        type: 'lab',
        amenities: ['Projector', 'Whiteboard', 'AC', 'Computers'],
        description: 'Modern computer lab equipped with 30 high-end workstations.'
      },
      {
        name: 'Seminar Hall 1',
        roomNumber: 'B-201',
        building: 'Academic Block B',
        floor: 2,
        capacity: 80,
        type: 'seminar_hall',
        amenities: ['Projector', 'Sound System', 'AC', 'Podium'],
        description: 'Spacious seminar hall suitable for departmental events and guest lectures.'
      },
      {
        name: 'Conference Room Alpha',
        roomNumber: 'A-301',
        building: 'Academic Block A',
        floor: 3,
        capacity: 20,
        type: 'conference_room',
        amenities: ['Smart TV', 'Whiteboard', 'AC', 'Video Conferencing'],
        description: 'Executive conference room with video conferencing capabilities.'
      },
      {
        name: 'Classroom 105',
        roomNumber: 'C-105',
        building: 'Academic Block C',
        floor: 1,
        capacity: 60,
        type: 'classroom',
        amenities: ['Projector', 'Whiteboard', 'Fan'],
        description: 'Standard classroom for lectures and tutorials.'
      },
      {
        name: 'Electronics Lab',
        roomNumber: 'B-102',
        building: 'Academic Block B',
        floor: 1,
        capacity: 25,
        type: 'lab',
        amenities: ['Oscilloscopes', 'Soldering Stations', 'AC', 'Safety Equipment'],
        description: 'Well-equipped electronics lab with advanced instruments.'
      },
      {
        name: 'Main Auditorium',
        roomNumber: 'AUD-001',
        building: 'Central Campus',
        floor: 0,
        capacity: 500,
        type: 'auditorium',
        amenities: ['Stage', 'Sound System', 'AC', 'Projector', 'Green Room'],
        description: 'Main college auditorium for large events, cultural programs, and convocations.'
      },
      {
        name: 'Classroom 210',
        roomNumber: 'C-210',
        building: 'Academic Block C',
        floor: 2,
        capacity: 45,
        type: 'classroom',
        amenities: ['Projector', 'Whiteboard', 'AC'],
        description: 'Air-conditioned classroom with modern teaching aids.'
      },
      {
        name: 'Research Conference Room',
        roomNumber: 'A-402',
        building: 'Academic Block A',
        floor: 4,
        capacity: 15,
        type: 'conference_room',
        amenities: ['Smart TV', 'Whiteboard', 'AC'],
        description: 'Quiet conference room ideal for research discussions and small meetings.'
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(` Created ${createdRooms.length} rooms`);

    console.log('\n Database seeded successfully!');
    console.log('\n Login Credentials:');
    console.log('  Admin:   admin@college.edu     / admin123');
    console.log('  Faculty: prof.sharma@college.edu / faculty123');
    console.log('  Faculty: prof.mehta@college.edu  / faculty123');
    console.log('  Student: alice@college.edu      / student123');
    console.log('  Student: bob@college.edu        / student123');
    console.log('  Student: carol@college.edu      / student123');

    process.exit(0);
  } catch (error) {
    console.error(' Seed error:', error.message);
    process.exit(1);
  }
};

seed();
