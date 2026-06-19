import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planService } from '../services/api';
import { Calendar, MapPin, Plane, ArrowRight, Trash2, ShieldAlert, Compass } from 'lucide-react';

const PlanDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPlans = async () => {
    try {
      const data = await planService.getPlans();
      setPlans(data.map(item => item.exam_plan));
    } catch (err) {
      setErrorMsg("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this travel plan?")) return;

    try {
      await planService.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete plan.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-76px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="font-heading text-3xl font-bold">My Study Journeys</h2>
          <p className="text-sm text-slate-400">All your active and completed exam travel plans</p>
        </div>
        <Link
          to="/create"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35"
        >
          <Compass className="w-5 h-5" />
          <span>Plan Another Journey</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-8">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid */}
      {plans.length === 0 ? (
        <div className="glass-panel text-center py-20 px-6 rounded-3xl">
          <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-full w-fit mx-auto mb-6">
            <Plane className="w-8 h-8 rotate-45" />
          </div>
          <h3 className="text-xl font-bold mb-2">No travel plans created yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-8 text-sm">
            Enter your competitive exam hall ticket details and we will plan your travel, hotel, and checklists.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-all"
          >
            <span>Create First Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plans/${plan.id}`}
              className="glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col justify-between h-64 border border-slate-800/80 group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 px-3 py-1 rounded-full font-semibold">
                    {plan.exam_name}
                  </span>
                  <button
                    onClick={(e) => handleDelete(plan.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{plan.center_city}</h3>
                
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Exam: {new Date(plan.exam_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="truncate max-w-[200px]">Center: {plan.center_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-4 text-xs">
                <span className="text-slate-400">Via <span className="text-slate-200 font-semibold">{plan.travel_mode}</span></span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-semibold">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanDashboard;
