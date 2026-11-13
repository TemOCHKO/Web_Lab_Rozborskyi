import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthenticationPage from './AuthenticationPage';
import WeatherPage from './WeatherPage';

function isAuthenticated() {
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith('isAuth=true'));
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
            isAuthenticated() ? <Navigate to="/weather" replace /> : <AuthenticationPage />
          }
        />
        <Route path="/weather" element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}