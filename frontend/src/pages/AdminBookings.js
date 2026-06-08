import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdListAlt } from 'react-icons/md';
import api from '../utils/api';
import BookingRow from '../components/BookingRow';
import Modal from '../components/Modal';

const AdminBookings = () => {
  const [searchParams]          = useSearchParams();
  const initialStatus           = searchParams.get('status') || '';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState(initialStatus);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');
  const [rejectModal, setRM]    = useState({ open: false, id: null });
  const [rejectNote, setNote]   = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const res = await api.get('/bookings', { params });
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'approved' });
      flash('Booking approved!');
      fetchBookings();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to approve.', true);
    }
  };

  const openReject = (id) => {
    setNote('');
    setRM({ open: true, id });
  };

  const handleReject = async () => {
    try {
      await api.patch(`/bookings/${rejectModal.id}/status`, {
        status: 'rejected',
        adminNote: rejectNote,
      });
      flash('Booking rejected.');
      setRM({ open: false, id: null });
      fetchBookings();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to reject.', true);
    }
  };

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const totalCount = bookings.length;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Booking Requests</h1>
          <p className="page-subtitle">Review, approve, or reject room booking requests</p>
        </div>
      </div>

      
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { val: '',          label: `All (${totalCount})` },
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
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <MdListAlt size={52} color="#d1d5db" />
          <h3 style={{ marginTop: 12 }}>No bookings found</h3>
          <p>
            {filter
              ? `No ${filter} bookings at this time.`
              : 'No booking requests have been made yet.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Room</th>
                <th>Requested By</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <BookingRow
                  key={b._id}
                  booking={b}
                  onApprove={handleApprove}
                  onReject={openReject}
                  isAdmin={true}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRM({ open: false, id: null })}
        title="Reject Booking"
        size="sm"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 14 }}>
          Optionally provide a reason for rejection (visible to the requester):
        </p>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="e.g. Room already reserved for maintenance, conflicting event…"
            value={rejectNote}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setRM({ open: false, id: null })}
          >
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleReject}>
            Reject Booking
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBookings;