import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { planService } from '../services/api';
import { Calendar, MapPin, Plane, Hotel, Utensils, CheckSquare, ArrowLeft, Star, Heart, Check, Trash2 } from 'lucide-react';

const PlanSummary = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Checklist local states to make checkboxes interactive
  const [checkedItems, setCheckedItems] = useState({});

  // Filters state
  const [hotelFilter, setHotelFilter] = useState({
    maxDistance: 'all', // all, 1km, 2km
    maxPrice: 'all',    // all, budget
    minRating: 0,
  });

  const [foodFilter, setFoodFilter] = useState({
    vegOnly: false,
    budgetOnly: false,
  });

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const data = await planService.getPlan(id);
        setPlan(data);
        // Initialize checked items
        const checks = {};
        data.travel_checklist?.forEach((item, index) => {
          checks[index] = false;
        });
        setCheckedItems(checks);
      } catch (err) {
        setErrorMsg("Failed to load travel plan details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [id]);

  const toggleCheck = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-[calc(100vh-76px)]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (errorMsg || !plan) {
    return (
      <div class="max-w-3xl mx-auto px-6 py-20 text-center">
        <h3 class="text-2xl font-bold text-rose-450 mb-4">Error loading plan</h3>
        <p class="text-slate-400 mb-8">{errorMsg || "Plan not found."}</p>
        <Link to="/dashboard" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Filter Hotels
  const filteredHotels = plan.hotels?.filter((h) => {
    if (hotelFilter.maxDistance === '1km' && h.distance > 1.0) return false;
    if (hotelFilter.maxDistance === '2km' && h.distance > 2.0) return false;
    if (hotelFilter.maxPrice === 'budget' && h.estimated_price > plan.budget * 0.25) return false;
    if (h.rating < hotelFilter.minRating) return false;
    return true;
  }) || [];

  // Filter Restaurants
  const filteredFood = plan.restaurants?.filter((r) => {
    if (foodFilter.vegOnly && !r.is_vegetarian) return false;
    if (foodFilter.budgetOnly && !r.is_budget_friendly) return false;
    return true;
  }) || [];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div class="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Back Button */}
      <Link to="/dashboard" class="flex items-center space-x-2 text-slate-400 hover:text-slate-100 text-sm w-fit transition-colors mb-4">
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Header Card */}
      <div class="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div>
          <span class="text-xs bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 px-3 py-1 rounded-full font-semibold mb-3 inline-block">
            {plan.exam_name} Schedule
          </span>
          <h2 class="font-heading text-4xl font-extrabold tracking-tight mb-2">Center: {plan.center_city}</h2>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mt-3">
            <span class="flex items-center space-x-1">
              <Calendar class="w-4 h-4 text-indigo-400" />
              <span>Exam Date: {formatDate(plan.exam_date)}</span>
            </span>
            <span class="flex items-center space-x-1">
              <MapPin class="w-4 h-4 text-indigo-400" />
              <span>{plan.center_name}</span>
            </span>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:text-right min-w-[200px]">
          <span class="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Trip Budget Limit</span>
          <span class="text-2xl font-extrabold text-indigo-400">₹{plan.budget}</span>
        </div>
      </div>

      {/* Core Grid layout */}
      <div class="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Travel Card & Packing Checklists */}
        <div class="lg:col-span-2 space-y-8">
          
          {/* Travel Engine Details */}
          <div class="glass-panel p-6 rounded-3xl relative">
            <h3 class="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
              <Plane class="w-5 h-5 text-indigo-450" />
              <span>Travel & Transit Engine Plan</span>
            </h3>

            <div class="grid sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span class="block text-xs text-slate-500 mb-1">Departure Date</span>
                <span class="font-bold text-slate-200">{formatDate(plan.departure_date)}</span>
              </div>
              <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span class="block text-xs text-slate-500 mb-1">Arrival Date</span>
                <span class="font-bold text-slate-200">{formatDate(plan.arrival_date)}</span>
              </div>
              <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span class="block text-xs text-slate-500 mb-1">Estimated Journey Time</span>
                <span class="font-bold text-slate-200">{plan.travel_duration}</span>
              </div>
            </div>

            <div class="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
              <h4 class="text-xs uppercase tracking-wider font-bold text-indigo-300 mb-2">Transit & Route Overview</h4>
              <p class="text-sm text-slate-300 leading-relaxed font-light">{plan.route_overview}</p>
            </div>
          </div>

          {/* Hotels recommendations and filters */}
          {plan.accommodation_required && (
            <div class="glass-panel p-6 rounded-3xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-6">
                <h3 class="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                  <Hotel class="w-5 h-5 text-purple-400" />
                  <span>Hotel Accommodations near Center</span>
                </h3>

                {/* Filters */}
                <div class="flex flex-wrap gap-2 text-xs">
                  <select
                    value={hotelFilter.maxDistance}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, maxDistance: e.target.value }))}
                    class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="all">Any Distance</option>
                    <option value="1km">&lt; 1.0 km</option>
                    <option value="2km">&lt; 2.0 km</option>
                  </select>

                  <select
                    value={hotelFilter.maxPrice}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="all">Any Price</option>
                    <option value="budget">Under ₹1500</option>
                  </select>

                  <select
                    value={hotelFilter.minRating}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                    class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4.5">★ 4.5+ Only</option>
                  </select>
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <div class="text-center py-10 bg-slate-900/40 rounded-2xl text-slate-500 text-sm">
                  No hotels match the active filter options. Try loosening filters.
                </div>
              ) : (
                <div class="space-y-4">
                  {filteredHotels.map((h, i) => (
                    <div key={i} class="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                      <div>
                        <h4 class="font-bold text-slate-200 text-base">{h.hotel_name}</h4>
                        <div class="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                          <span class="flex items-center text-amber-400">
                            <Star class="w-4 h-4 fill-current mr-1" />
                            <span class="font-semibold">{h.rating}</span>
                          </span>
                          <span>Distance: <span class="text-slate-200">{h.distance} km</span></span>
                          <span class="text-emerald-500">Quiet study environment</span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div class="text-right">
                          <span class="block text-xs text-slate-500">Est. Price / Night</span>
                          <span class="font-extrabold text-indigo-400 text-lg">₹{h.estimated_price}</span>
                        </div>
                        <button class="bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                          Select Stay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Checklist & Food Recommendations */}
        <div class="space-y-8">
          
          {/* Packing Checklist */}
          <div class="glass-panel p-6 rounded-3xl relative">
            <h3 class="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
              <CheckSquare class="w-5 h-5 text-indigo-400" />
              <span>Pre-Exam Travel Checklist</span>
            </h3>

            <div class="space-y-3">
              {plan.travel_checklist?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleCheck(index)}
                  class={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    checkedItems[index]
                      ? 'bg-emerald-500/5 border-emerald-500/25 text-slate-500 line-through'
                      : 'bg-slate-900/60 border-slate-850 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div
                    class={`w-5 h-5 rounded-md flex items-center justify-center border flex-shrink-0 mt-0.5 transition-all ${
                      checkedItems[index]
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {checkedItems[index] && <Check class="w-3.5 h-3.5" />}
                  </div>
                  <span class="text-xs leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Food Joints recommendations and Veg/Non-Veg filter */}
          <div class="glass-panel p-6 rounded-3xl">
            <div class="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
              <h3 class="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <Utensils class="w-5 h-5 text-emerald-400" />
                <span>Healthy Dining Options</span>
              </h3>
              
              <div class="flex items-center space-x-2">
                <label class="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodFilter.vegOnly}
                    onChange={(e) => setFoodFilter((prev) => ({ ...prev, vegOnly: e.target.checked }))}
                    class="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Veg Mess</span>
                </label>
              </div>
            </div>

            <div class="space-y-4">
              {filteredFood.length === 0 ? (
                <div class="text-center py-6 bg-slate-900/40 rounded-2xl text-slate-500 text-xs">
                  No restaurants match this filter criteria.
                </div>
              ) : (
                filteredFood.map((r, i) => (
                  <div key={i} class="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 class="font-bold text-slate-200 text-sm">{r.restaurant_name}</h4>
                      <div class="flex items-center space-x-3 text-2xs text-slate-500 mt-1.5">
                        <span class="flex items-center text-amber-500">
                          <Star class="w-3 h-3 fill-current mr-0.5" />
                          <span class="font-semibold">{r.rating}</span>
                        </span>
                        <span>{r.distance} km from center</span>
                      </div>
                    </div>

                    <div class="flex flex-col items-end gap-1.5">
                      {r.is_vegetarian ? (
                        <span class="text-2xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                          Veg Mess
                        </span>
                      ) : (
                        <span class="text-2xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                          Veg & Non-Veg
                        </span>
                      )}
                      
                      {r.is_budget_friendly && (
                        <span class="text-2xs text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full font-medium">
                          Student Friendly
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlanSummary;
