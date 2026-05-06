import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand" onClick={() => setMenuOpen(false)}>
         
          <span className="navbar-brand-name">Smart<span>Room</span></span>
        </NavLink>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-nav${menuOpen ? ' open' : ''}`}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            Rooms
          </NavLink>
          <NavLink to="/bookings/new" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            Book a Room
          </NavLink>
          <NavLink to="/my-bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            My Bookings
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/rooms" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                Manage Rooms
              </NavLink>
              <NavLink to="/admin/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                All Bookings
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name}</span>
            <span className={`user-role-badge role-${user?.role}`}>{user?.role}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
