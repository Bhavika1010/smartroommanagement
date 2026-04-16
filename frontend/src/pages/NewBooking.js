import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/BookingForm.css';

const typeLabels = {
  classroom: 'Classroom', seminar_hall: 'Seminar Hall',
  lab: 'Lab', conference_room: 'Conference Room', auditorium: 'Auditorium',
};

const NewBooking = () => {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const preselectedId = params.get('roomId') || '';

  const [rooms, setRooms]     = useState([]);
  const [form, setForm]       = useState({
    roomId: preselectedId,
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
  });
  const [loading, setLoading]   = useState(false);
  const [roomsLoading, setRL]   = useState(true);
  const [error, setError]       = useState('');
  const [warning, setWarning]   = useState('');
  const [success, setSuccess]   = useState('');
  const [selectedRoom, setSelected] = useState(null);

  useEffect(() => {
    api.get('/rooms').then(res => {
      setRooms(res.data);
      if (preselectedId) {
        const r = res.data.find(r => r._id === preselectedId);
        if (r) setSelected(r);
      }
    }).catch(() => setError('Failed to load rooms.')).finally(() => setRL(false));
  }, [preselectedId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setWarning('');
    if (name === 'roomId') {
      const r = rooms.find(r => r._id === value);
      setSelected(r || null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.roomId || !form.title || !form.date || !form.startTime || !form.endTime) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('End time must be after start time.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/bookings', { ...form, attendees: Number(form.attendees) });
      if (res.data.warning) setWarning(res.data.warning);
      setSuccess('Booking request submitted successfully! You will be notified once reviewed.');
      setTimeout(() => navigate('/my-bookings'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking.');
    } finally {
      setLoading(false);
    }
  };

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Request a Room</h1>
          <p className="page-subtitle">Fill in the details below to submit your booking request</p>
        </div>
      </div>

      <div className="booking-layout">
        {/* Form */}
        <div className="booking-form-card card">
          {error   && <div className="alert alert-error">{error}</div>}
          {warning && <div className="alert alert-warning">⚠ {warning}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Room *</label>
              {roomsLoading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Loading rooms…</div>
              ) : (
                <select name="roomId" className="form-select" value={form.roomId} onChange={handleChange} required>
                  <option value="">— Select a room —</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.roomNumber}) · Cap: {r.capacity} · {typeLabels[r.type]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Event / Purpose Title *</label>
              <input
                name="title"
                className="form-input"
                placeholder="e.g. Project presentation, Guest lecture"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Brief description of the event…"
                value={form.description}
                onChange={handleChange}
                maxLength={300}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  name="date"
                  type="date"
                  className="form-input"
                  value={form.date}
                  min={today}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Attendees</label>
                <input
                  name="attendees"
                  type="number"
                  className="form-input"
                  value={form.attendees}
                  min={1}
                  max={selectedRoom?.capacity || 9999}
                  onChange={handleChange}
                />
                {selectedRoom && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                    Max: {selectedRoom.capacity}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  name="startTime"
                  type="time"
                  className="form-input"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  name="endTime"
                  type="time"
                  className="form-input"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !!success}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Selected room details */}
        <div className="booking-room-info">
          {selectedRoom ? (
            <div className="card">
              <h3 style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 600 }}>Selected Room</h3>
              <div className="bri-name">{selectedRoom.name}</div>
              <div className="bri-number">{selectedRoom.roomNumber}</div>
              <div className="bri-meta">
                <div><span>📍</span> {selectedRoom.building}, Floor {selectedRoom.floor}</div>
                <div><span>👥</span> Capacity: {selectedRoom.capacity}</div>
                <div><span>🏷️</span> {typeLabels[selectedRoom.type]}</div>
              </div>
              {selectedRoom.amenities?.length > 0 && (
                <div className="bri-amenities">
                  {selectedRoom.amenities.map((a, i) => (
                    <span key={i} className="amenity-tag">{a}</span>
                  ))}
                </div>
              )}
              {selectedRoom.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 10 }}>
                  {selectedRoom.description}
                </p>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 20px' }}>
              <p style={{ fontSize: '2rem' }}>🏢</p>
              <p style={{ marginTop: 10, fontSize: '0.9rem' }}>Select a room to see its details</p>
            </div>
          )}

          <div className="card booking-info-box">
            <h4>How it works</h4>
            <ol>
              <li>Fill in the form and submit your request.</li>
              <li>Admin reviews and approves or rejects.</li>
              <li>You'll see the status in "My Bookings".</li>
              <li>Conflict detection runs automatically.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
