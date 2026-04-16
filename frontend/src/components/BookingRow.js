import React from 'react';
import { MdWarning, MdComment } from 'react-icons/md';

const statusLabels = {
  pending:   'Pending',
  approved:  'Approved',
  rejected:  'Rejected',
  cancelled: 'Cancelled',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BookingRow = ({ booking, onCancel, onApprove, onReject, isAdmin }) => {
  const canCancel = ['pending', 'approved'].includes(booking.status);

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{booking.title}</div>
        {booking.description && (
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 2 }}>
            {booking.description.slice(0, 60)}{booking.description.length > 60 ? '…' : ''}
          </div>
        )}
      </td>

      <td>
        <div style={{ fontWeight: 500 }}>{booking.room?.name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{booking.room?.building}</div>
      </td>

      {isAdmin && (
        <td>
          <div style={{ fontWeight: 500 }}>{booking.requestedBy?.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
            {booking.requestedBy?.role} · {booking.requestedBy?.studentId || booking.requestedBy?.employeeId || ''}
          </div>
        </td>
      )}

      <td>
        <div>{formatDate(booking.date)}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
          {booking.startTime} – {booking.endTime}
        </div>
      </td>

      <td>
        <span className={`badge badge-${booking.status}`}>
          {statusLabels[booking.status]}
        </span>
        {booking.hasConflict && booking.status === 'pending' && (
          <span
            className="badge"
            style={{
              background: '#fff3cd',
              color: '#856404',
              marginLeft: 4,
              fontSize: '0.7rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
            title="Has time conflict with another booking"
          >
            <MdWarning size={12} />
            Conflict
          </span>
        )}
      </td>

      <td>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {isAdmin && booking.status === 'pending' && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onApprove(booking._id)}
              >
                Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onReject(booking._id)}
              >
                Reject
              </button>
            </>
          )}
          {!isAdmin && canCancel && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onCancel(booking._id)}
            >
              Cancel
            </button>
          )}
          {booking.adminNote && (
            <span
              title={booking.adminNote}
              style={{
                cursor: 'help',
                color: 'var(--gray-400)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <MdComment size={18} />
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;