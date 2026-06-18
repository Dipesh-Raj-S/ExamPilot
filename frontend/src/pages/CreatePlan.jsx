import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/api';
import { Compass, Calendar, MapPin, Landmark, ShieldAlert, ArrowRight, IndianRupee } from 'lucide-react';

const CreatePlan = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    exam_name: '',
    exam_date: '',
    exam_time: '09:00',
    home_city: '',
    center_name: '',
    center_city: '',
    center_address: '',
    travel_mode: 'Train',
    budget: '',
    accommodation_required: true,
    arrival_preference: '1_day_before',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exam_name || !formData.exam_date || !formData.home_city || !formData.center_name || !formData.center_city || !formData.center_address || !formData.budget) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const plan = await planService.createPlan({
        ...formData,
        budget: parseFloat(formData.budget),
      });
      navigate(`/plans/${plan.id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto px-6 py-12 relative overflow-hidden">
      <div class="absolute top-1/4 right-1/10 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="glass-panel p-8 md:p-10 rounded-3xl relative z-10 shadow-xl">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-indigo-500/10 text-indigo-400 p-3 rounded-2xl">
            <Compass class="w-7 h-7" />
          </div>
          <div>
            <h2 class="font-heading text-3xl font-bold">New Travel Plan</h2>
            <p class="text-sm text-slate-400">Generate travel, accommodations, and itinerary instantly</p>
          </div>
        </div>

        {errorMsg && (
          <div class="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-8">
            <ShieldAlert class="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-8">
          {/* Section 1: Exam Details */}
          <div>
            <h3 class="text-base font-semibold text-slate-350 border-b border-slate-900 pb-2 mb-4 flex items-center space-x-2">
              <Calendar class="w-4 h-4 text-indigo-400" />
              <span>1. Exam Details & Schedule</span>
            </h3>

            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Name</label>
                <input
                  type="text"
                  name="exam_name"
                  required
                  placeholder="e.g. JEE Main, NEET UG, CAT"
                  value={formData.exam_name}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Date</label>
                <input
                  type="date"
                  name="exam_date"
                  required
                  value={formData.exam_date}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Reporting Time</label>
                <input
                  type="time"
                  name="exam_time"
                  required
                  value={formData.exam_time}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Locations */}
          <div>
            <h3 class="text-base font-semibold text-slate-350 border-b border-slate-900 pb-2 mb-4 flex items-center space-x-2">
              <MapPin class="w-4 h-4 text-indigo-400" />
              <span>2. Origin & Exam Center Details</span>
            </h3>

            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Home City</label>
                <input
                  type="text"
                  name="home_city"
                  required
                  placeholder="e.g. Pune"
                  value={formData.home_city}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Center City</label>
                <input
                  type="text"
                  name="center_city"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.center_city}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
              <div class="md:col-span-1">
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Center Name</label>
                <input
                  type="text"
                  name="center_name"
                  required
                  placeholder="e.g. IIT Bombay Powai"
                  value={formData.center_name}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Center Address</label>
                <input
                  type="text"
                  name="center_address"
                  required
                  placeholder="e.g. Main Gate Rd, IIT Area, Powai, Mumbai, Maharashtra 400076"
                  value={formData.center_address}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Preferences & Budgets */}
          <div>
            <h3 class="text-base font-semibold text-slate-350 border-b border-slate-900 pb-2 mb-4 flex items-center space-x-2">
              <Landmark class="w-4 h-4 text-indigo-400" />
              <span>3. Journey Preferences & Budget</span>
            </h3>

            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Travel Mode</label>
                <select
                  name="travel_mode"
                  value={formData.travel_mode}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Train">Train</option>
                  <option value="Flight">Flight</option>
                  <option value="Bus">Bus</option>
                  <option value="Car">Car / Cab</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Budget (₹)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <IndianRupee class="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    name="budget"
                    required
                    min="1000"
                    placeholder="e.g. 5000"
                    value={formData.budget}
                    onChange={handleChange}
                    class="w-full pl-9 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Arrival Preference</label>
                <select
                  name="arrival_preference"
                  value={formData.arrival_preference}
                  onChange={handleChange}
                  class="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="same_day">Reach Same Day</option>
                  <option value="1_day_before">Reach 1 Day Before (Recommended)</option>
                  <option value="2_days_before">Reach 2 Days Before</option>
                </select>
              </div>
            </div>

            <div class="mt-6 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h4 class="text-sm font-semibold text-slate-200">Need Accommodation</h4>
                <p class="text-xs text-slate-500">Recommend quiet student-friendly hotels near the exam center</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="accommodation_required"
                  checked={formData.accommodation_required}
                  onChange={handleChange}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <span>{loading ? 'Analyzing & Planning Journey...' : 'Generate Complete Travel Plan'}</span>
            {!loading && <ArrowRight class="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlan;
