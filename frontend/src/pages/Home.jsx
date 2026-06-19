import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Hotel, Utensils, CheckSquare, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-76px)] flex flex-col justify-between">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-20 w-full flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-8 mb-24">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full text-indigo-300 text-sm font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Focus on preparation. We handle the journey.</span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight leading-none">
            Plan your Exam Travel
            <span className="block mt-4 gradient-text">Instantly & Automatically</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Stop wasting crucial hours searching for hotels, trains, routes, and food. Just enter your admit card details and get an optimized travel, stay, and dining checklist instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/create"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Plane className="w-5 h-5" />
                <span>Create Travel Plan Now</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center"
                >
                  Existing Account Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl relative overflow-hidden group">
            <div className="bg-indigo-500/10 text-indigo-400 p-3.5 rounded-2xl w-fit mb-6">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">Travel Timeline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Computes departure times, transit durations, and recommends routes tailored to your preferred arrival day.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-3xl relative overflow-hidden group">
            <div className="bg-purple-500/10 text-purple-400 p-3.5 rounded-2xl w-fit mb-6">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Quiet Student Hotels</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Curates close-by, highly rated options optimized with study desks and quiet zones, scaled to your budget.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-3xl relative overflow-hidden group">
            <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-2xl w-fit mb-6">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">Healthy Food Spots</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Suggests vegetarian messes and highly rated, clean restaurants near the exam center so you stay fit.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-3xl relative overflow-hidden group">
            <div className="bg-pink-500/10 text-pink-400 p-3.5 rounded-2xl w-fit mb-6">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Exam Checklist</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generates a personalized list containing Admit Card, Stationery, and ID Proof reminders so nothing is forgotten.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/80 backdrop-blur py-8 px-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ExamPilot. Designed for competitive exam candidates.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
