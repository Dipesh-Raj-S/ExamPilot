import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('exampilot_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('exampilot_token', data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check credentials.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('exampilot_token', data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const googleLogin = async (email, name) => {
    setError(null);
    try {
      const data = await authService.googleLogin(email, name);
      localStorage.setItem('exampilot_token', data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || "Google sign-in failed.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('exampilot_token');
    setUser(null);
  };

  const updateProfile = async (name, password) => {
    setError(null);
    try {
      const data = await authService.updateProfile(name, password);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update profile.";
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
