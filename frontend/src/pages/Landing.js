import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdLock, MdAccessTime, MdCheckCircle, MdMeetingRoom,
  MdHistory, MdFlashOn, MdSchool, MdPerson, MdSettings,
} from 'react-icons/md';
import '../styles/Landing.css';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/dashboard'); return null; }

  const features = [
    { icon: <MdLock size={28} color="#f97316" />,        title: 'Role-based Access',      desc: 'Separate dashboards for students, faculty, and administrators with appropriate permissions.' },
    { icon: <MdAccessTime size={28} color="#f97316" />,  title: 'Real-time Availability', desc: 'Check room availability instantly. Our conflict detection prevents double bookings automatically.' },
    { icon: <MdCheckCircle size={28} color="#f97316" />, title: 'Approval Workflow',       desc: 'Admins review, approve, or reject booking requests with notes. Full transparency for requesters.' },
    { icon: <MdMeetingRoom size={28} color="#f97316" />, title: 'Room Management',         desc: 'Add, edit, or deactivate rooms. Track capacity, amenities, floor, and building details.' },
    { icon: <MdHistory size={28} color="#f97316" />,     title: 'Booking History',         desc: 'View your complete booking history with status tracking and admin feedback.' },
    { icon: <MdFlashOn size={28} color="#f97316" />,     title: 'Conflict Detection',      desc: 'System auto-detects scheduling conflicts before requests reach admin review.' },
  ];

  const roles = [
    { role: 'Student', icon: <MdSchool size={36} color="#16a34a" />,   color: 'green', perks: ['Browse all rooms', 'Request bookings', 'Track request status', 'Cancel own bookings'] },
    { role: 'Faculty', icon: <MdPerson size={36} color="#2563eb" />,   color: 'blue',  perks: ['All student features', 'Book for classes & seminars', 'View booking history', 'Priority for academic events'] },
    { role: 'Admin',   icon: <MdSettings size={36} color="#f97316" />, color: 'orange', perks: ['Full room CRUD', 'Approve / reject requests', 'View all bookings', 'Conflict resolution'] },
  ];

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">SR</div>
            <span className="landing-logo-text">Smart<span>Room</span></span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">College Room & Event Management</div>
            <h1 className="hero-title">
              Book Rooms.<br />
              <span>Manage Events.</span><br />
              Effortlessly.
            </h1>
            <p className="hero-subtitle">
              A centralized platform for students, faculty, and administrators
              to manage college room bookings with real-time availability
              and conflict detection.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Get Started →
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card vc-1">
              <div className="vc-header">
                <div className="vc-dot green" />
                <span>Seminar Hall 1</span>
              </div>
              <div className="vc-row"><MdAccessTime size={14} /> Today, 2:00 – 4:00 PM</div>
              <div className="vc-row"><MdPerson size={14} /> 45 attendees</div>
              <div className="vc-status approved">Approved</div>
            </div>
            <div className="visual-card vc-2">
              <div className="vc-header">
                <div className="vc-dot orange" />
                <span>Innovation Lab</span>
              </div>
              <div className="vc-row"><MdAccessTime size={14} /> Tomorrow, 10:00 AM</div>
              <div className="vc-row"><MdPerson size={14} /> 20 attendees</div>
              <div className="vc-status pending">Pending</div>
            </div>
            <div className="visual-card vc-3">
              <div className="vc-label">Admin Dashboard</div>
              <div className="vc-stat"><span className="stat-num">12</span> Rooms</div>
              <div className="vc-stat"><span className="stat-num">5</span> Pending</div>
              <div className="vc-stat"><span className="stat-num">38</span> Approved</div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-inner">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-subtitle">Designed for the modern college environment</p>
            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="roles-section">
          <div className="features-inner">
            <h2 className="section-title">Who uses SmartRoom?</h2>
            <div className="roles-grid">
              {roles.map((r, i) => (
                <div key={i} className={`role-card role-${r.color}`}>
                  <div className="role-icon">{r.icon}</div>
                  <h3>{r.role}</h3>
                  <ul>
                    {r.perks.map((p, j) => (
                      <li key={j}>
                        <MdCheckCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} SmartRoom – College Room Management Platform</p>
      </footer>
    </div>
  );
};

export default Landing;