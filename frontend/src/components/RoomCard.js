import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoomCard.css';

const typeLabels = {
  classroom:       'Classroom',
  seminar_hall:    'Seminar Hall',
  lab:             'Lab',
  conference_room: 'Conference Room',
  auditorium:      'Auditorium',
};

const typeIcons = {
  classroom:       '🏫',
  seminar_hall:    '🎓',
  lab:             '🔬',
  conference_room: '💼',
  auditorium:      '🎭',
};

const RoomCard = ({ room, showActions = true }) => {
  const navigate = useNavigate();

  return (
    <div className="room-card">
      <div className="room-card-header">
        <span className="room-type-icon">{typeIcons[room.type] || '🏢'}</span>
        <div className="room-card-title-wrap">
          <h3 className="room-name">{room.name}</h3>
          <span className="room-number">{room.roomNumber}</span>
        </div>
        {!room.isActive && (
          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', marginLeft: 'auto' }}>
            Inactive
          </span>
        )}
      </div>

      <div className="room-meta">
        <div className="room-meta-item">
          <span className="meta-icon">📍</span>
          <span>{room.building}, Floor {room.floor}</span>
        </div>
        <div className="room-meta-item">
          <span className="meta-icon">👥</span>
          <span>Capacity: {room.capacity}</span>
        </div>
        <div className="room-meta-item">
          <span className="meta-icon">🏷️</span>
          <span>{typeLabels[room.type] || room.type}</span>
        </div>
      </div>

      {room.amenities && room.amenities.length > 0 && (
        <div className="room-amenities">
          {room.amenities.slice(0, 4).map((a, i) => (
            <span key={i} className="amenity-tag">{a}</span>
          ))}
          {room.amenities.length > 4 && (
            <span className="amenity-tag amenity-more">+{room.amenities.length - 4}</span>
          )}
        </div>
      )}

      {room.description && (
        <p className="room-description">{room.description}</p>
      )}

      {showActions && room.isActive && (
        <div className="room-card-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/bookings/new?roomId=${room._id}`)}
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
