import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Navigation, 
  LocateFixed, 
  Loader2, 
  X, 
  AlertCircle,
  Compass
} from 'lucide-react';
import axios from 'axios';
import useUserStore from '../store/userStore';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  // AI Modal on Dashboard
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiDestination, setAiDestination] = useState('');
  const [aiStartingFrom, setAiStartingFrom] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [aiDays, setAiDays] = useState(3);
  const [aiStartDate, setAiStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [aiBudget, setAiBudget] = useState('moderate');
  const [aiPreferences, setAiPreferences] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchTrips = async () => {
    try {
      const res = await axios.get('/itineraries');
      setTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTrips();
  }, [user, navigate]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const addr = res.data?.address;
          const detectedCity = addr?.city || addr?.town || addr?.county || addr?.state || 'Current Location';
          setAiStartingFrom(detectedCity);
        } catch (err) {
          console.error('Reverse geocode failed:', err);
          setAiStartingFrom('Current Location');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        alert('Could not retrieve current location. Please check browser permissions or type your city.');
      },
      { timeout: 8000 }
    );
  };

  const handleNewTrip = async () => {
    try {
      const res = await axios.post('/itineraries', { title: 'Next Adventure' });
      navigate(`/planner/${res.data._id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
    }
  };

  const handleAiCreateTrip = async (e) => {
    e.preventDefault();
    if (!aiDestination.trim()) {
      setAiError('Please enter a destination.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError('');

    try {
      const res = await axios.post('/itineraries/ai-create', {
        destination: aiDestination,
        startingFrom: aiStartingFrom,
        days: aiDays,
        startDate: aiStartDate,
        budget: aiBudget,
        preferences: aiPreferences
      });

      if (res.data && res.data._id) {
        navigate(`/planner/${res.data._id}`);
      } else {
        fetchTrips();
        setShowAiModal(false);
      }
    } catch (err) {
      console.error('AI Create Trip Failed:', err);
      setAiError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this trip and all its expenses?')) return;
    try {
      await axios.delete(`/itineraries/${tripId}`);
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip', error);
    }
  };

  const [editingTripId, setEditingTripId] = useState(null);
  const [editTitleVal, setEditTitleVal] = useState('');

  const handleSaveTitle = async (e, tripId) => {
    e.preventDefault();
    if (!editTitleVal.trim()) {
      setEditingTripId(null);
      return;
    }
    try {
      await axios.put(`/itineraries/${tripId}`, { title: editTitleVal });
      setTrips(trips.map(t => t._id === tripId ? { ...t, title: editTitleVal } : t));
      setEditingTripId(null);
    } catch (error) {
      console.error('Failed to update title', error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Trips</h1>
          <p className="text-sm text-slate-500 mt-0.5">Plan, organize, and explore your upcoming adventures.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAiModal(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all transform hover:scale-105"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            AI Trip Planner
          </button>

          <button 
            onClick={handleNewTrip} 
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Manual Trip
          </button>
        </div>
      </div>

      {/* Featured AI Quick Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="z-10 space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-yellow-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Gemini Powered
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Need travel inspiration?</h2>
          <p className="text-indigo-200 text-sm">
            Let our AI curate day-by-day train/flight schedules, hotel options, local foodie spots, and direct booking links in seconds based on your location!
          </p>
        </div>
        <button
          onClick={() => setShowAiModal(true)}
          className="z-10 bg-white text-indigo-900 font-bold px-5 py-3 rounded-xl hover:bg-indigo-50 shadow-md transition-all shrink-0 flex items-center gap-2 hover:scale-105"
        >
          <Compass className="h-5 w-5 text-indigo-600" />
          Plan with AI Now
        </button>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-slate-700 mb-2">No trips planned yet</h2>
          <p className="text-slate-500 mb-6">Create your first itinerary or let AI generate one for you!</p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => setShowAiModal(true)} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Generate with AI
            </button>
            <button 
              onClick={handleNewTrip} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors inline-block"
            >
              Start Empty Trip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <Link key={trip._id} to={`/planner/${trip._id}`} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all relative block">
              <div className="h-28 bg-gradient-to-r from-primary-500 to-indigo-500 relative flex items-end p-4">
                <div className="flex justify-between items-end w-full text-white">
                  {editingTripId === trip._id ? (
                    <input 
                      type="text" 
                      value={editTitleVal} 
                      autoFocus
                      onClick={(e) => e.preventDefault()}
                      onChange={(e) => setEditTitleVal(e.target.value)}
                      onBlur={(e) => handleSaveTitle(e, trip._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(e, trip._id)}
                      className="text-xl font-bold bg-white/20 border-b-2 border-white outline-none focus:ring-0 px-1 py-0 w-3/4 text-white placeholder-white/70 rounded-none"
                    />
                  ) : (
                    <h3 
                      className="text-xl font-bold cursor-text hover:bg-white/10 px-1 rounded transition-colors -ml-1"
                      title="Click to edit trip name"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditTitleVal(trip.title);
                        setEditingTripId(trip._id);
                      }}
                    >
                      {trip.title}
                    </h3>
                  )}
                  <button 
                    onClick={(e) => handleDeleteTrip(e, trip._id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center bg-white">
                <div className="flex gap-4 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {trip.startDate 
                      ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Upcoming'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" /> {trip.groupMembers?.length || 1}
                  </span>
                  {trip.destinations?.length > 0 && (
                    <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                      <MapPin className="h-3.5 w-3.5" /> {trip.destinations.length} places
                    </span>
                  )}
                </div>
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Active
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* AI Trip Modal on Dashboard */}
      {showAiModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <h3 className="font-bold text-lg">AI Automated Trip Planner</h3>
                </div>
                <p className="text-xs text-indigo-100 mt-1">
                  Generates an entire day-by-day plan with transport, hotels, food & direct booking links.
                </p>
              </div>
              <button 
                onClick={() => !isGeneratingAi && setShowAiModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                disabled={isGeneratingAi}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {aiError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>{aiError}</div>
                </div>
              )}

              {isGeneratingAi ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                    <Sparkles className="h-5 w-5 text-yellow-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-base">Creating Your Trip with Gemini AI...</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Organizing days, finding trains & stays, discovering food spots, and building Google Maps & booking links.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAiCreateTrip} id="dashboard-ai-form" className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Destination <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="e.g. Paris, France or Goa, India" 
                        value={aiDestination} 
                        onChange={e => setAiDestination(e.target.value)} 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Starting From (Source Location)
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <LocateFixed className="h-3 w-3 text-indigo-500" />
                        )}
                        <span>{isDetectingLocation ? 'Detecting...' : 'Use Current Location'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Navigation className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="e.g. Mumbai, New Delhi, London" 
                        value={aiStartingFrom} 
                        onChange={e => setAiStartingFrom(e.target.value)} 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Trip Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                          type="date" 
                          value={aiStartDate} 
                          onChange={e => setAiStartDate(e.target.value)} 
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Duration (Days Staying)
                      </label>
                      <select
                        value={aiDays}
                        onChange={e => setAiDays(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                      >
                        <option value={1}>1 Day (Express)</option>
                        <option value={2}>2 Days (Weekend Trip)</option>
                        <option value={3}>3 Days (Recommended)</option>
                        <option value={4}>4 Days</option>
                        <option value={5}>5 Days</option>
                        <option value={7}>7 Days (Full Week)</option>
                        <option value={10}>10 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Budget Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'budget', label: 'Budget 🎒', desc: 'Hostels & Trains' },
                        { id: 'moderate', label: 'Moderate 🧳', desc: 'Standard Hotels' },
                        { id: 'luxury', label: 'Luxury ✨', desc: 'Top Resorts' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAiBudget(item.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            aiBudget === item.id 
                              ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-semibold text-xs">{item.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferences & Activities
                    </label>
                    <textarea 
                      placeholder="e.g. Street food lover, scenic photography, beach relaxation..." 
                      value={aiPreferences} 
                      onChange={e => setAiPreferences(e.target.value)} 
                      rows={2}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {!isGeneratingAi && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="dashboard-ai-form"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-indigo-200 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  Create & Generate Trip
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
