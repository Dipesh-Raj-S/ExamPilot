import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { planService } from '../services/api';
import { Calendar, MapPin, Plane, Hotel, Utensils, CheckSquare, ArrowLeft, Star, Heart, Check, Trash2, Train, Zap, Shield, Sparkles } from 'lucide-react';

const PlanSummary = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [transport, setTransport] = useState([]);
  const [aiPlans, setAiPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Checklist local states to make checkboxes interactive
  const [checkedItems, setCheckedItems] = useState({});

  // Filters state
  const [hotelFilter, setHotelFilter] = useState({
    maxDistance: 'all', // all, 1km, 2km, 3km
    maxPrice: 'all',    // all, budget
    minRating: 0,
  });

  const [foodFilter, setFoodFilter] = useState({
    vegOnly: false,
    budgetOnly: false,
  });

  const [activeAiTab, setActiveAiTab] = useState('budget');

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const data = await planService.getPlan(id);
        setPlan(data.exam_plan);
        setHotels(data.hotels || []);
        setRestaurants(data.restaurants || []);
        setTransport(data.transport || []);
        setAiPlans(data.ai_plans || []);
        
        // Initialize checked items
        const checks = {};
        data.exam_plan?.travel_checklist?.forEach((item, index) => {
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
      <div className="flex items-center justify-center min-h-[calc(100vh-76px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (errorMsg || !plan) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h3 className="text-2xl font-bold text-rose-450 mb-4">Error loading plan</h3>
        <p className="text-slate-400 mb-8">{errorMsg || "Plan not found."}</p>
        <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-medium rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Filter Hotels
  const filteredHotels = hotels?.filter((h) => {
    if (hotelFilter.maxDistance === '1km' && h.distance > 1.0) return false;
    if (hotelFilter.maxDistance === '2km' && h.distance > 2.0) return false;
    if (hotelFilter.maxPrice === 'budget' && h.estimated_price > plan.budget * 0.25) return false;
    if (h.rating < hotelFilter.minRating) return false;
    return true;
  }) || [];

  // Filter Restaurants
  const filteredFood = restaurants?.filter((r) => {
    if (foodFilter.vegOnly && !r.is_vegetarian) return false;
    if (foodFilter.budgetOnly && !r.is_budget_friendly) return false;
    return true;
  }) || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeAiPlan = aiPlans.find(p => p.plan_type === activeAiTab);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Back Button */}
      <Link to="/dashboard" className="flex items-center space-x-2 text-slate-400 hover:text-slate-100 text-sm w-fit transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Header Card */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div>
          <span className="text-xs bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 px-3 py-1 rounded-full font-semibold mb-3 inline-block">
            {plan.exam_name} Schedule
          </span>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight mb-2">Center: {plan.center_city}</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mt-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Exam Date: {formatDate(plan.exam_date)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{plan.center_name} ({plan.center_lat?.toFixed(4)}, {plan.center_lng?.toFixed(4)})</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:text-right min-w-[200px]">
          <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Trip Budget Limit</span>
          <span className="text-2xl font-extrabold text-indigo-400">₹{plan.budget}</span>
        </div>
      </div>

      {/* Core Grid layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Travel Card & Packing Checklists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Travel Engine Details */}
          <div className="glass-panel p-6 rounded-3xl relative">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
              <Plane className="w-5 h-5 text-indigo-450" />
              <span>Travel & Transit Engine Plan</span>
            </h3>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-xs text-slate-500 mb-1">Departure Date</span>
                <span className="font-bold text-slate-200">{formatDate(plan.departure_date)}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-xs text-slate-500 mb-1">Arrival Date</span>
                <span className="font-bold text-slate-200">{formatDate(plan.arrival_date)}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-xs text-slate-500 mb-1">Estimated Journey Time</span>
                <span className="font-bold text-slate-200">{plan.travel_duration}</span>
              </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
              <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-300 mb-2">Transit & Route Overview</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-light">{plan.route_overview}</p>
            </div>
          </div>

          {/* Hotels recommendations and filters */}
          {plan.accommodation_required && (
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                  <Hotel className="w-5 h-5 text-purple-400" />
                  <span>Real Hotel Accommodations near Center</span>
                </h3>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    value={hotelFilter.maxDistance}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, maxDistance: e.target.value }))}
                    className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="all">Any Distance</option>
                    <option value="1km">&lt; 1.0 km</option>
                    <option value="2km">&lt; 2.0 km</option>
                  </select>

                  <select
                    value={hotelFilter.maxPrice}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="all">Any Price</option>
                    <option value="budget">Under ₹1500</option>
                  </select>

                  <select
                    value={hotelFilter.minRating}
                    onChange={(e) => setHotelFilter((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                    className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4.5">★ 4.5+ Only</option>
                  </select>
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/40 rounded-2xl text-slate-500 text-sm">
                  No hotels match the active filter options. Try loosening filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHotels.map((h, i) => (
                    <div key={i} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-200 text-base">{h.hotel_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center text-amber-400">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            <span className="font-semibold">{h.rating || 'N/A'}</span>
                          </span>
                          <span>Distance: <span className="text-slate-200">{h.distance} km</span></span>
                          {h.latitude && (
                            <span className="text-slate-500 font-mono text-2xs">[{h.latitude?.toFixed(4)}, {h.longitude?.toFixed(4)}]</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="text-right">
                          <span className="block text-xs text-slate-500">Est. Price / Night</span>
                          <span className="font-extrabold text-indigo-400 text-lg">₹{h.estimated_price}</span>
                        </div>
                        <button className="bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                          Select Stay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Food Joints recommendations and Veg/Non-Veg filter */}
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                <span>Healthy Dining Options</span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodFilter.vegOnly}
                    onChange={(e) => setFoodFilter((prev) => ({ ...prev, vegOnly: e.target.checked }))}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Veg Mess</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {filteredFood.length === 0 ? (
                <div className="text-center py-6 bg-slate-900/40 rounded-2xl text-slate-500 text-xs">
                  No restaurants match this filter criteria.
                </div>
              ) : (
                filteredFood.map((r, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{r.restaurant_name}</h4>
                      <div className="flex items-center space-x-3 text-2xs text-slate-500 mt-1.5">
                        <span className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          <span className="font-semibold">{r.rating || 'N/A'}</span>
                        </span>
                        <span>{r.distance} km from center</span>
                        {r.latitude && (
                          <span className="text-slate-600 font-mono">[{r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}]</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {r.is_vegetarian ? (
                        <span className="text-2xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                          Veg Mess
                        </span>
                      ) : (
                        <span className="text-2xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                          Veg & Non-Veg
                        </span>
                      )}
                      
                      {r.is_budget_friendly && (
                        <span className="text-2xs text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full font-medium">
                          Student Friendly
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transport stations section */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
              <Train className="w-5 h-5 text-sky-400" />
              <span>Nearby Transport Hubs (10km - 20km)</span>
            </h3>

            {transport.length === 0 ? (
              <div className="text-center py-6 bg-slate-900/40 rounded-2xl text-slate-500 text-xs">
                No transport hubs located in search parameters.
              </div>
            ) : (
              <div className="space-y-4">
                {transport.map((t, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{t.station_name}</h4>
                      <div className="flex items-center space-x-3 text-2xs text-slate-500 mt-1.5">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-350 rounded border border-slate-700">{t.transport_type}</span>
                        <span>{t.distance} km from center</span>
                        {t.latitude && (
                          <span className="text-slate-600 font-mono">[{t.latitude?.toFixed(4)}, {t.longitude?.toFixed(4)}]</span>
                        )}
                      </div>
                    </div>
                    <span className="text-2xs text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full font-medium">
                      Transit Link
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Checklist & Food Recommendations */}
        <div className="space-y-8">
          
          {/* Packing Checklist */}
          <div className="glass-panel p-6 rounded-3xl relative">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>Pre-Exam Travel Checklist</span>
            </h3>

            <div className="space-y-3">
              {plan.travel_checklist?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleCheck(index)}
                  className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    checkedItems[index]
                      ? 'bg-emerald-500/5 border-emerald-500/25 text-slate-500 line-through'
                      : 'bg-slate-900/60 border-slate-850 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border flex-shrink-0 mt-0.5 transition-all ${
                      checkedItems[index]
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {checkedItems[index] && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Travel Planner (Tabs & comparison) */}
          <div className="glass-panel p-6 rounded-3xl relative">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-450 animate-pulse" />
              <h3 className="text-lg font-semibold text-slate-200">AI Travel Planner</h3>
            </div>

            {/* Compare Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 mb-6">
              {['budget', 'balanced', 'comfort'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveAiTab(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                    activeAiTab === tab
                      ? 'bg-indigo-650 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeAiPlan ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
                    {activeAiTab === 'budget' && <Shield className="w-4 h-4 text-emerald-400" />}
                    {activeAiTab === 'balanced' && <Zap className="w-4 h-4 text-indigo-400" />}
                    {activeAiTab === 'comfort' && <Sparkles className="w-4 h-4 text-purple-400" />}
                    <span className="text-base">{activeAiPlan.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{activeAiPlan.summary}</p>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Lodging Pick</span>
                    <span className="font-semibold text-slate-200 text-right">{activeAiPlan.hotel_name || "N/A"}</span>
                  </div>
                  {activeAiPlan.hotel_lat && (
                    <div className="text-right text-3xs font-mono text-slate-600 -mt-2">
                      [{activeAiPlan.hotel_lat?.toFixed(4)}, {activeAiPlan.hotel_lng?.toFixed(4)}]
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs border-t border-slate-850/60 pt-3">
                    <span className="text-slate-500">Dining Pick</span>
                    <span className="font-semibold text-slate-200 text-right">{activeAiPlan.restaurant_name || "N/A"}</span>
                  </div>
                  {activeAiPlan.restaurant_lat && (
                    <div className="text-right text-3xs font-mono text-slate-600 -mt-2">
                      [{activeAiPlan.restaurant_lat?.toFixed(4)}, {activeAiPlan.restaurant_lng?.toFixed(4)}]
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs border-t border-slate-850/60 pt-3">
                    <span className="text-slate-500">Transit Terminal</span>
                    <span className="font-semibold text-slate-200 text-right">{activeAiPlan.transport_mode || "N/A"}</span>
                  </div>
                  {activeAiPlan.transport_lat && (
                    <div className="text-right text-3xs font-mono text-slate-600 -mt-2">
                      [{activeAiPlan.transport_lat?.toFixed(4)}, {activeAiPlan.transport_lng?.toFixed(4)}]
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs border-t border-slate-850/60 pt-3">
                    <span className="text-slate-500">Estimated Total Cost</span>
                    <span className="font-bold text-indigo-400">₹{activeAiPlan.estimated_cost}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-350 block">AI Strategic Reasoning</span>
                  <p className="text-2xs text-slate-400 leading-relaxed bg-slate-950/45 p-3.5 rounded-xl border border-slate-900">{activeAiPlan.reasoning}</p>
                </div>

                {activeAiPlan.checklist && activeAiPlan.checklist.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-350 block">AI Plan Recommendations</span>
                    <ul className="space-y-1.5 text-2xs text-slate-400 list-disc list-inside bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                      {activeAiPlan.checklist.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-900/40 rounded-2xl">
                No AI travel plans found for this schedule.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default PlanSummary;
