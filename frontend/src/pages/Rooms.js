import React, { useState, useEffect, useCallback } from 'react';
import { MdMeetingRoom } from 'react-icons/md';
import api from '../utils/api';
import RoomCard from '../components/RoomCard';

const roomTypes = [
  { value: '',               label: 'All Types' },
  { value: 'classroom',      label: 'Classroom' },
  { value: 'seminar_hall',   label: 'Seminar Hall' },
  { value: 'lab',            label: 'Lab' },
  { value: 'conference_room',label: 'Conference Room' },
  { value: 'auditorium',     label: 'Auditorium' },
];

const Rooms = () => {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('');
  const [capFilter, setCap]   = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (capFilter)  params.capacity = capFilter;
      const res = await api.get('/rooms', { params });
      setRooms(res.data);
    } catch {
      setError('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, capFilter]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filtered = rooms.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase()) ||
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Rooms</h1>
          <p className="page-subtitle">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} available for booking
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Search</label>
            <input
              className="form-input"
              placeholder="Room name, building, number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label className="form-label">Room Type</label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={e => setType(e.target.value)}
            >
              {roomTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 150px' }}>
            <label className="form-label">Min Capacity</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 30"
              min="1"
              value={capFilter}
              onChange={e => setCap(e.target.value)}
            />
          </div>
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => { setSearch(''); setType(''); setCap(''); }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrapper"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MdMeetingRoom size={52} color="#d1d5db" />
          <h3 style={{ marginTop: 12 }}>No rooms found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(room => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;