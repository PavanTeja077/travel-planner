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
  ArrowRight,
  Plane,
  Hotel,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import axios from 'axios';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';
import { ThemePicker } from '../components/ThemePicker';

const QUICK_DESTINATIONS = [
  { name: 'Goa, India', tag: '🏖️ Goa' },
  { name: 'Paris, France', tag: '🗼 Paris' },
  { name: 'Manali, Himachal', tag: '🏔️ Manali' },
  { name: 'Tokyo, Japan', tag: '⛩️ Tokyo' },
  { name: 'Dubai, UAE', tag: '🏙️ Dubai' },
  { name: 'Bali, Indonesia', tag: '🌴 Bali' }
];

const PLATFORM_HIGHLIGHTS = [
  {
    title: "Autonomous AI Engine",
    badge: "Gemini 3.6 Multimodal",
    desc: "Deploy autonomous trip agents that curate day-by-day agendas, check realistic transit schedules, and recommend authentic local culinary hubs.",
    icon: Sparkles,
    color: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-200/50"
  },
  {
    title: "Google Maps Intelligence",
    badge: "Live GPS Tracking",
    desc: "Interactive spatial maps with real-time location pinpointing, custom categorized pins, terrain/satellite views, and 1-click Google Maps routing.",
    icon: MapPin,
    color: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-200/50"
  },
  {
    title: "Group Financial Harmony",
    badge: "Automated Debt Matrix",
    desc: "Fair, transparent expense splitting in Rupees (₹). Automatically resolves multi-person debts and provides single-click settlement summaries.",
    icon: DollarSign,
    color: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-200/50"
  },
  {
    title: "Direct Booking Apps",
    badge: "Zero Markup Deep-links",
    desc: "Direct integration with global providers: Google Flights, IRCTC Indian Railways, Skyscanner, Booking.com, and Agoda right inside every itinerary.",
    icon: Plane,
    color: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-200/50"
  }
];

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const user = useUserStore(state => state.user);
  const { currentTheme } = useThemeStore();
  const navigate = useNavigate();

  // AI Generator Form State
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
        setAiError('The server took longer to respond. If your backend is waking up, please retry in a few seconds.');
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
    <div className="space-y-12 max-w-5xl mx-auto pb-16">
      
      {/* 1. TOP HEADER & CUSTOM THEME CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
              Personal Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span style={{ color: currentTheme.accent }}>{user?.name ? user.name.split(' ')[0] : 'Explorer'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curate intelligent journeys, sync bookings, and collaborate seamlessly.
          </p>
        </div>

        {/* Theme Customizer Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <ThemePicker compact={false} />
        </div>
      </div>

      {/* 2. EMBEDDED AI TRAVEL STUDIO CARD (Hero Section) */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all">
        {/* Card Header with Theme Gradient */}
        <div 
          className="p-6 sm:p-8 text-white relative transition-all"
          style={{ 
            background: `linear-gradient(135deg, ${currentTheme.primary} 0%, #1e1b4b 60%, ${currentTheme.accent} 100%)` 
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" /> AI Automated Itinerary Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Where will your journey take you?
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed">
              Experience zero-effort trip planning. Our Gemini AI engine schedules daily agendas, routes trains & flights from your city, finds verified stays, and builds direct booking deep-links in seconds.
            </p>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <Compass className="h-44 w-44 text-white" />
          </div>
        </div>

        {/* Generator Form */}
        <div className="p-6 sm:p-8">
          {aiError && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
              <div className="leading-relaxed">{aiError}</div>
            </div>
          )}

          {isGeneratingAi ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-14 w-14 text-indigo-600 animate-spin" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-bold text-slate-900 text-lg">Orchestrating Your Itinerary...</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gemini AI is calculating day-by-day timelines, cross-referencing flights & trains, hand-picking hotels, and generating live Google Maps coordinates.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAiCreateTrip} className="space-y-6">
              
              {/* Quick Destination Chips */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" /> Quick Recommendations
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DESTINATIONS.map((dest, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiDestination(dest.name)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                        aiDestination === dest.name
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white'
                      }`}
                    >
                      {dest.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination City / Region <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Goa, India or Paris, France" 
                      value={aiDestination} 
                      onChange={e => setAiDestination(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all shadow-2xs" 
                      required 
                    />
                  </div>
                </div>

                {/* Starting From with Geolocation Auto-Detect */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Origin (Starting Location)
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
                      <span>{isDetectingLocation ? 'Detecting GPS...' : 'Auto-Detect Current Location'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Navigation className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Hyderabad, Mumbai, New York" 
                      value={aiStartingFrom} 
                      onChange={e => setAiStartingFrom(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all shadow-2xs" 
                    />
                  </div>
                </div>

              </div>

              {/* Date, Duration & Budget Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Trip Start Date */}
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all shadow-2xs" 
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
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                  >
                    <option value={1}>1 Day (Express Day Trip)</option>
                    <option value={2}>2 Days (Weekend Getaway)</option>
                    <option value={3}>3 Days (Standard Explorer)</option>
                    <option value={4}>4 Days (In-Depth Journey)</option>
                    <option value={5}>5 Days (Extended Stay)</option>
                    <option value={6}>6 Days</option>
                    <option value={7}>7 Days (1 Full Week)</option>
                    <option value={10}>10 Days (Grand Vacation)</option>
                  </select>
                </div>

                {/* Budget Style */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Budget Tier
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
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all text-xs font-semibold ${
                          aiBudget === item.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/60'
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
                  Special Preferences, Vibe & Dietary Needs (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Vegetarian cuisine, love sunrise viewpoints, heritage temples, avoiding rush hours..." 
                  value={aiPreferences} 
                  onChange={e => setAiPreferences(e.target.value)} 
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all shadow-2xs" 
                />
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Instant output with verified Google Maps pins & booking deep-links.
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: currentTheme.primary }}
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

      {/* 3. "ABOUT WAYFINDER" LUXURY SHOWCASE SECTION (Inspired by Template Screenshots) */}
      <div className="space-y-6 pt-4" id="about">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="h-3.5 w-3.5 text-indigo-600" /> Intelligent Travel Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Autonomous agents that handle the heavy lifting.
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
            Deploy intelligent agents that route transit, coordinate accommodations across global platforms, calculate fair group splits, and keep everyone in sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLATFORM_HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className={`p-6 rounded-3xl bg-gradient-to-br ${item.color} bg-white border ${item.border} shadow-sm hover:shadow-md transition-all group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: currentTheme.primary }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MY SAVED TRIPS SECTION */}
      <div className="space-y-5 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Saved Itineraries</h2>
            <p className="text-xs text-slate-500">Access and modify your active travel workspaces.</p>
          </div>
          <button 
            onClick={handleNewTrip} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Blank Trip</span>
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8">
            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">No itineraries yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Use our AI Travel Studio above to generate your first complete itinerary with real booking links!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <Link 
                key={trip._id} 
                to={`/planner/${trip._id}`} 
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden transition-all relative block transform hover:-translate-y-1"
              >
                <div 
                  className="h-28 relative flex items-end p-5 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentTheme.primary} 0%, #1e1b4b 70%, ${currentTheme.accent} 100%)` 
                  }}
                >
                  <div className="flex justify-between items-end w-full">
                    {editingTripId === trip._id ? (
                      <input 
                        type="text" 
                        value={editTitleVal} 
                        autoFocus
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) => setEditTitleVal(e.target.value)}
                        onBlur={(e) => handleSaveTitle(e, trip._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(e, trip._id)}
                        className="text-xl font-bold bg-white/20 border-b-2 border-white outline-none focus:ring-0 px-2 py-0.5 w-3/4 text-white placeholder-white/70 rounded"
                      />
                    ) : (
                      <h3 
                        className="text-xl font-bold cursor-text hover:bg-white/10 px-2 py-0.5 rounded transition-colors -ml-1 truncate"
                        title="Click to edit name"
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
                      className="p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                      title="Delete trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex justify-between items-center bg-white">
                  <div className="flex gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {trip.startDate 
                        ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Upcoming'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> {trip.groupMembers?.length || 1} members
                    </span>
                    {trip.destinations?.length > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600" /> {trip.destinations.length} places
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Open Planner &rarr;
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
