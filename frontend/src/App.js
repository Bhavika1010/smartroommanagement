import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';


import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Rooms        from './pages/Rooms';
import NewBooking   from './pages/NewBooking';
import MyBookings   from './pages/MyBookings';
import AdminRooms   from './pages/AdminRooms';
import AdminBookings from './pages/AdminBookings';

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

        
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <AppLayout><Rooms /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute roles={['student', 'faculty']}>
                <AppLayout><NewBooking /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute roles={['student', 'faculty']}>
                <AppLayout><MyBookings /></AppLayout>
              </ProtectedRoute>
            }
          />

         
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout><AdminRooms /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout><AdminBookings /></AppLayout>
              </ProtectedRoute>
            }
          />

          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
