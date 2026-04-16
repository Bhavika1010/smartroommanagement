import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BookingRow from '../components/BookingRow';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('');
  const [message, setMessage]   = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch {
      setError('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setMessage('Booking cancelled.');
      fetchBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filtered = filter ? bookings.filter(b => b.status === filter) : bookings;

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track all your room booking requests</p>
        </div>
      </div>

      {/* Quick filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { val: '',          label: `All (${bookings.length})` },
          { val: 'pending',   label: `Pending (${counts.pending || 0})` },
          { val: 'approved',  label: `Approved (${counts.approved || 0})` },
          { val: 'rejected',  label: `Rejected (${counts.rejected || 0})` },
          { val: 'cancelled', label: `Cancelled (${counts.cancelled || 0})` },
        ].map(f => (
          <button
            key={f.val}
            className={`btn btn-sm ${filter === f.val ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.val)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrapper"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '2.5rem' }}>📭</p>
          <h3>No bookings found</h3>
          <p>{filter ? `No ${filter} bookings.` : 'You have not made any booking requests yet.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Room</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <BookingRow
                  key={b._id}
                  booking={b}
                  onCancel={handleCancel}
                  isAdmin={false}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
