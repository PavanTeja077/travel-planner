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
  AlertCircle,
  Compass,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import useUserStore from '../store/userStore';

const QUICK_DESTINATIONS = [
  { name: 'Goa, India', tag: '🏖️ Goa' },
  { name: 'Paris, France', tag: '🗼 Paris' },
  { name: 'Manali, Himachal', tag: '🏔️ Manali' },
  { name: 'Tokyo, Japan', tag: '⛩️ Tokyo' },
  { name: 'Dubai, UAE', tag: '🏙️ Dubai' },
  { name: 'Bali, Indonesia', tag: '🌴 Bali' }
];

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  // AI Generator Form State (Embedded on Dashboard)
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

  // Trip Edit state
  const [editingTripId, setEditingTripId] = useState(null);
  const [editTitleVal, setEditTitleVal] = useState('');

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
      }, { timeout: 60000 });

      if (res.data && res.data._id) {
        navigate(`/planner/${res.data._id}`);
      } else {
        fetchTrips();
      }
    } catch (err) {
      console.error('AI Create Trip Failed:', err);
      const serverMessage = err.response?.data?.message;
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setAiError('The server took too long to respond. If your backend is waking up from sleep, please try again in a few seconds.');
      } else if (serverMessage) {
        setAiError(serverMessage);
      } else if (err.message) {
        setAiError(err.message);
      } else {
        setAiError('Failed to generate itinerary. Please verify your backend server is running and try again.');
      }
      setIsGeneratingAi(false);
    }
  };

  const handleNewTrip = async () => {
    try {
      const res = await axios.post('/itineraries', { title: 'Next Adventure' });
      navigate(`/planner/${res.data._id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* 1. TOP SECTION: EMBEDDED AI ITINERARY GENERATOR ON MAIN DASHBOARD */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white relative">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> AI Automated Itinerary Planner
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Where to next, {user?.name ? user.name.split(' ')[0] : 'Explorer'}?
            </h1>
            <p className="text-indigo-100 text-sm mt-1.5 leading-relaxed">
              Tell us where you want to go. Our Gemini AI will build your complete day-by-day itinerary with trains/flights, hotel recommendations, local cuisine, and direct booking links in seconds!
            </p>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <Compass className="h-44 w-44 text-white" />
          </div>
        </div>

        {/* Embedded AI Generator Form */}
        <div className="p-6 sm:p-8">
          {aiError && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{aiError}</div>
            </div>
          )}

          {isGeneratingAi ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-14 w-14 text-indigo-600 animate-spin" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-slate-800 text-lg">Curating Your Perfect Adventure...</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Gemini AI is scheduling days, sourcing transit & accommodations, discovering authentic dining, and building direct booking links.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAiCreateTrip} className="space-y-5">
              {/* Quick Destination Chips */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Popular Destinations (Click to auto-fill)
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DESTINATIONS.map((dest, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiDestination(dest.name)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        aiDestination === dest.name
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                      }`}
                    >
                      {dest.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination City / Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Goa, India or Paris, France" 
                      value={aiDestination} 
                      onChange={e => setAiDestination(e.target.value)} 
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" 
                      required 
                    />
                  </div>
                </div>

                {/* Starting From with Auto-Detect */}
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
                    <Navigation className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, Hyderabad, New York" 
                      value={aiStartingFrom} 
                      onChange={e => setAiStartingFrom(e.target.value)} 
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Date, Duration & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Trip Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="date" 
                      value={aiStartDate} 
                      onChange={e => setAiStartDate(e.target.value)} 
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" 
                      required 
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration (Days Staying)
                  </label>
                  <select
                    value={aiDays}
                    onChange={e => setAiDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  >
                    <option value={1}>1 Day (Express Trip)</option>
                    <option value={2}>2 Days (Weekend Trip)</option>
                    <option value={3}>3 Days (Recommended)</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={6}>6 Days</option>
                    <option value={7}>7 Days (Full Week)</option>
                    <option value={10}>10 Days</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Budget Style
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'budget', label: 'Budget 🎒' },
                      { id: 'moderate', label: 'Moderate 🧳' },
                      { id: 'luxury', label: 'Luxury ✨' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAiBudget(item.id)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all text-xs font-semibold ${
                          aiBudget === item.id 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferences & Activities (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Vegetarian food, love beaches, historic forts, nightlife, relaxed schedule..." 
                  value={aiPreferences} 
                  onChange={e => setAiPreferences(e.target.value)} 
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" 
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  ✨ Instant generation with trains/flights, hotels, and direct booking links.
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-102 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Generate Itinerary with AI</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. MY TRIPS SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Saved Trips</h2>
            <p className="text-xs text-slate-500">Manage and explore your existing travel plans.</p>
          </div>
          <button 
            onClick={handleNewTrip} 
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Blank Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 mb-1">No saved trips yet</h3>
            <p className="text-xs text-slate-500 mb-4">Use the AI Planner above to generate your first adventure!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <Link 
                key={trip._id} 
                to={`/planner/${trip._id}`} 
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all relative block"
              >
                <div className="h-28 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 relative flex items-end p-4">
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
                      title="Delete trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center bg-white">
                  <div className="flex gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {trip.startDate 
                        ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Upcoming'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> {trip.groupMembers?.length || 1}
                    </span>
                    {trip.destinations?.length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                        <MapPin className="h-3.5 w-3.5" /> {trip.destinations.length} places
                      </span>
                    )}
                  </div>
                  <div className="bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide">
                    Active
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
