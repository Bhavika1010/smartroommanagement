import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Modal from '../components/Modal';
import '../styles/AdminRooms.css';

const AMENITY_SUGGESTIONS = [
  'Projector', 'Whiteboard', 'AC', 'Smart TV', 'Computers',
  'Sound System', 'Podium', 'Video Conferencing', 'Stage',
  'Green Room', 'Soldering Stations', 'Oscilloscopes',
];

const ROOM_TYPES = [
  { value: 'classroom',       label: 'Classroom' },
  { value: 'seminar_hall',    label: 'Seminar Hall' },
  { value: 'lab',             label: 'Lab' },
  { value: 'conference_room', label: 'Conference Room' },
  { value: 'auditorium',      label: 'Auditorium' },
];

const emptyForm = {
  name: '', roomNumber: '', building: '', floor: 0,
  capacity: '', type: 'classroom', amenities: [], description: '', isActive: true,
};

const AdminRooms = () => {
  const [searchParams]        = useSearchParams();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [message, setMsg]     = useState('');
  const [modal, setModal]     = useState({ open: false, mode: 'add', room: null });
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [formError, setFE]    = useState('');
  const [amenityInput, setAI] = useState('');
  const [deleteConfirm, setDC]= useState(null);

  useEffect(() => {
    fetchRooms();
    if (searchParams.get('add') === '1') openAdd();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms/all');
      setRooms(res.data);
    } catch { setError('Failed to load rooms.'); }
    finally { setLoading(false); }
  };

  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setMsg(msg);
    setTimeout(() => { setError(''); setMsg(''); }, 3500);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFE('');
    setAI('');
    setModal({ open: true, mode: 'add', room: null });
  };

  const openEdit = (room) => {
    setForm({ ...room, amenities: [...(room.amenities || [])] });
    setFE('');
    setAI('');
    setModal({ open: true, mode: 'edit', room });
  };

  const closeModal = () => setModal({ open: false, mode: 'add', room: null });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setFE('');
  };

  const addAmenity = (val) => {
    const trimmed = (val || amenityInput).trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm(f => ({ ...f, amenities: [...f.amenities, trimmed] }));
    }
    setAI('');
  };

  const removeAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.filter(x => x !== a) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.roomNumber || !form.building || !form.capacity || !form.type) {
      setFE('Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await api.post('/rooms', form);
        flash('Room added successfully!');
      } else {
        await api.put(`/rooms/${modal.room._id}`, form);
        flash('Room updated successfully!');
      }
      closeModal();
      fetchRooms();
    } catch (err) {
      setFE(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      flash('Room deleted.');
      setDC(null);
      fetchRooms();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to delete room.', true);
    }
  };

  const typeLabel = (t) => ROOM_TYPES.find(x => x.value === t)?.label || t;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Rooms</h1>
          <p className="page-subtitle">{rooms.length} room{rooms.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Room</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrapper"><div className="spinner" /></div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <h3>No rooms yet</h3>
          <p>Add your first room to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
            + Add Room
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Location</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Amenities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{room.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--orange-600)' }}>{room.roomNumber}</div>
                  </td>
                  <td>
                    <div>{room.building}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Floor {room.floor}</div>
                  </td>
                  <td>{typeLabel(room.type)}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {room.amenities?.slice(0, 3).map((a, i) => (
                        <span key={i} className="amenity-tag" style={{ fontSize: '0.72rem' }}>{a}</span>
                      ))}
                      {room.amenities?.length > 3 && (
                        <span className="amenity-tag amenity-more" style={{ fontSize: '0.72rem' }}>
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${room.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(room)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDC(room._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.mode === 'add' ? 'Add New Room' : 'Edit Room'}
        size="lg"
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Room Name *</label>
              <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="e.g. Innovation Lab" required />
            </div>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input name="roomNumber" className="form-input" value={form.roomNumber} onChange={handleChange} placeholder="e.g. A-101" required />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Building *</label>
              <input name="building" className="form-input" value={form.building} onChange={handleChange} placeholder="e.g. Academic Block A" required />
            </div>
            <div className="form-group">
              <label className="form-label">Floor *</label>
              <input name="floor" type="number" className="form-input" value={form.floor} onChange={handleChange} min={0} required />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input name="capacity" type="number" className="form-input" value={form.capacity} onChange={handleChange} min={1} placeholder="e.g. 30" required />
            </div>
            <div className="form-group">
              <label className="form-label">Room Type *</label>
              <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Brief description of the room…" />
          </div>
          <div className="form-group">
            <label className="form-label">Amenities</label>
            <div className="amenity-input-row">
              <input
                className="form-input"
                placeholder="Type and press Enter or Add"
                value={amenityInput}
                onChange={e => setAI(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addAmenity()}>
                Add
              </button>
            </div>
            {/* Suggestions */}
            <div className="amenity-suggestions">
              {AMENITY_SUGGESTIONS.filter(s => !form.amenities.includes(s)).map(s => (
                <button key={s} type="button" className="amenity-suggestion-btn" onClick={() => addAmenity(s)}>
                  + {s}
                </button>
              ))}
            </div>
            {form.amenities.length > 0 && (
              <div className="amenity-list">
                {form.amenities.map(a => (
                  <span key={a} className="amenity-chip">
                    {a}
                    <button type="button" className="amenity-remove" onClick={() => removeAmenity(a)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {modal.mode === 'edit' && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                style={{ width: 16, height: 16, accentColor: 'var(--orange-500)' }}
              />
              <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>
                Room is active (visible for booking)
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : modal.mode === 'add' ? 'Add Room' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDC(null)} title="Delete Room" size="sm">
        <p style={{ color: 'var(--gray-600)', marginBottom: 20 }}>
          Are you sure you want to delete this room? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setDC(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Room</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminRooms;
