import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Dashboard.css';

const statusLabels = {
  pending: 'Pending', approved: 'Approved',
  rejected: 'Rejected', cancelled: 'Cancelled',
};

const formatDate = d => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
});

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (user.role === 'admin') {
        const [bookingsRes, roomsRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/rooms/all')
        ]);
        const bookings = bookingsRes.data;
        setStats({
          totalRooms:   roomsRes.data.length,
          activeRooms:  roomsRes.data.filter(r => r.isActive).length,
          pending:      bookings.filter(b => b.status === 'pending').length,
          approved:     bookings.filter(b => b.status === 'approved').length,
          total:        bookings.length,
        });
        setRecent(bookings.slice(0, 6));
      } else {
        const bookingsRes = await api.get('/bookings/my');
        const bookings = bookingsRes.data;
        setStats({
          total:     bookings.length,
          pending:   bookings.filter(b => b.status === 'pending').length,
          approved:  bookings.filter(b => b.status === 'approved').length,
          rejected:  bookings.filter(b => b.status === 'rejected').length,
        });
        setRecent(bookings.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-wrapper">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {user.name.split(' ')[0]}! 👋</h1>
          <p className="dashboard-subtext">
            {user.role === 'admin'
              ? 'Here\'s an overview of the room management system.'
              : `You are logged in as ${user.role}${user.studentId ? ` · ${user.studentId}` : user.employeeId ? ` · ${user.employeeId}` : ''}.`}
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="btn btn-primary" onClick={() => navigate('/bookings/new')}>
            + New Booking
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/rooms')}>
            View Rooms
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {user.role === 'admin' ? (
          <>
            <StatCard icon="🏛️" label="Total Rooms"     value={stats.totalRooms}  color="orange" />
            <StatCard icon="✅" label="Active Rooms"    value={stats.activeRooms} color="green" />
            <StatCard icon="⏳" label="Pending Requests" value={stats.pending}    color="yellow" />
            <StatCard icon="📋" label="Total Bookings"  value={stats.total}       color="blue" />
          </>
        ) : (
          <>
            <StatCard icon="📋" label="Total Requests" value={stats.total}    color="blue" />
            <StatCard icon="⏳" label="Pending"        value={stats.pending}  color="yellow" />
            <StatCard icon="✅" label="Approved"       value={stats.approved} color="green" />
            <StatCard icon="❌" label="Rejected"       value={stats.rejected} color="red" />
          </>
        )}
      </div>

      {/* Recent bookings */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-h2">{user.role === 'admin' ? 'Recent Requests' : 'My Recent Bookings'}</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(user.role === 'admin' ? '/admin/bookings' : '/my-bookings')}
          >
            View All
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="card empty-state">
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>📭</p>
            <h3>No bookings yet</h3>
            <p>Start by requesting a room booking.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/bookings/new')}>
              Book a Room
            </button>
          </div>
        ) : (
          <div className="recent-bookings">
            {recent.map(b => (
              <div key={b._id} className="recent-booking-item">
                <div className="rbi-left">
                  <div className="rbi-title">{b.title}</div>
                  <div className="rbi-meta">
                    {b.room?.name} · {formatDate(b.date)} · {b.startTime}–{b.endTime}
                  </div>
                  {user.role === 'admin' && (
                    <div className="rbi-user">{b.requestedBy?.name} ({b.requestedBy?.role})</div>
                  )}
                </div>
                <span className={`badge badge-${b.status}`}>{statusLabels[b.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin: quick nav */}
      {user.role === 'admin' && (
        <div className="admin-quick-nav">
          <h2 className="section-h2" style={{ marginBottom: 16 }}>Quick Actions</h2>
          <div className="aqn-grid">
            {[
              { icon: '🏛️', title: 'Manage Rooms',      desc: 'Add, edit, or remove rooms', path: '/admin/rooms' },
              { icon: '📋', title: 'All Bookings',      desc: 'Review pending requests',    path: '/admin/bookings' },
              { icon: '➕', title: 'Add New Room',      desc: 'Register a new room',        path: '/admin/rooms?add=1' },
              { icon: '⏳', title: 'Pending Requests',  desc: `${stats.pending} awaiting review`, path: '/admin/bookings?status=pending' },
            ].map((a, i) => (
              <div key={i} className="aqn-card" onClick={() => navigate(a.path)}>
                <span className="aqn-icon">{a.icon}</span>
                <div>
                  <div className="aqn-title">{a.title}</div>
                  <div className="aqn-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default Dashboard;
