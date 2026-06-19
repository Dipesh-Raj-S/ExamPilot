import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, LayoutDashboard, User as UserIcon, LogOut, Compass } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Exam<span className="text-indigo-400">Pilot</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/create"
                className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/create') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Plan Travel</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/profile') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              <div className="h-4 w-px bg-slate-800"></div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                  Aspirant: <span className="font-semibold text-slate-200">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors duration-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
