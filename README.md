# Smart Room & Event Management Platform (College-Based)

A full-stack web application for managing college room bookings with role-based access control.

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── config/         # Database connection
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Seed data
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth context
│       ├── pages/       # Page components
│       ├── styles/      # CSS files
│       └── utils/       # API helpers
│   └── package.json
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

---

### 1. Clone / Open Project in VS Code

```bash
cd project
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/room_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

> **MongoDB Atlas Setup:**
> 1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
> 2. Create a free cluster
> 3. Under "Database Access" → create a user with read/write permissions
> 4. Under "Network Access" → add your IP (or `0.0.0.0/0` for all)
> 5. Click "Connect" → "Connect your application" → copy the URI
> 6. Replace `<username>` and `<password>` in `.env`

Seed the database (creates admin, sample users, and rooms):

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔐 Default Login Credentials (after seeding)

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@college.edu       | admin123     |
| Faculty | prof.sharma@college.edu | faculty123   |
| Faculty | prof.mehta@college.edu  | faculty123   |
| Student | alice@college.edu       | student123   |
| Student | bob@college.edu         | student123   |
| Student | carol@college.edu       | student123   |

---

## ✨ Features

### All Users
- Login with JWT authentication
- View all available rooms with details
- Request a room booking (date, start time, end time, purpose)
- View own booking history and status

### Admin
- All user features
- Add, edit, delete rooms
- View all booking requests
- Approve or reject bookings
- Conflict detection (overlapping bookings auto-rejected)

### Conflict Detection
The system automatically prevents overlapping bookings — if a room is already booked (approved) for a given time slot, new requests for that time will be flagged. Pending requests can still be submitted, but admin sees conflicts before approving.

---

## 🛠 Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18, React Router v6, CSS |
| Backend   | Node.js, Express.js            |
| Database  | MongoDB Atlas, Mongoose        |
| Auth      | JWT (jsonwebtoken), bcryptjs   |

---

## 📡 API Endpoints

### Auth
| Method | Route           | Access  | Description  |
|--------|-----------------|---------|--------------|
| POST   | /api/auth/login | Public  | Login        |
| GET    | /api/auth/me    | Private | Get profile  |

### Rooms
| Method | Route            | Access | Description    |
|--------|------------------|--------|----------------|
| GET    | /api/rooms       | All    | List all rooms |
| POST   | /api/rooms       | Admin  | Add room       |
| PUT    | /api/rooms/:id   | Admin  | Update room    |
| DELETE | /api/rooms/:id   | Admin  | Delete room    |

### Bookings
| Method | Route                        | Access | Description        |
|--------|------------------------------|--------|--------------------|
| GET    | /api/bookings/my             | All    | My bookings        |
| GET    | /api/bookings                | Admin  | All bookings       |
| POST   | /api/bookings                | All    | Request booking    |
| PATCH  | /api/bookings/:id/status     | Admin  | Approve/Reject     |
| DELETE | /api/bookings/:id            | Owner  | Cancel booking     |
