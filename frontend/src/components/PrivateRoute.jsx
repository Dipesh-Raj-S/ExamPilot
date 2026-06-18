import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-slate-950">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
          <div class="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
