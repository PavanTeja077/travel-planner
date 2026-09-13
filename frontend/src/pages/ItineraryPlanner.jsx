import { useParams, Link } from 'react-router-dom';
import { MapContainer } from '../components/MapContainer';
import { 
  MapPin, 
  Clock, 
  Trash2, 
  Sparkles, 
  Train, 
  Hotel, 
  Utensils, 
  Compass, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  X, 
  Calendar, 
  Plus,
  LocateFixed,
  Navigation
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ItineraryPlanner = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState([]);
  const [newPlace, setNewPlace] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Group members state
  const [groupMembers, setGroupMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Title & Dates state
  const [title, setTitle] = useState('Trip Planner');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal, setEditTitleVal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI Planner Modal State
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

  const fetchItinerary = async () => {
    try {
      const res = await axios.get(`/itineraries/${id}`);
      if (res.data) {
        if (res.data.title) setTitle(res.data.title);
        if (res.data.destinations) setPlan(res.data.destinations);
        if (res.data.groupMembers) setGroupMembers(res.data.groupMembers);
        if (res.data.startDate) setStartDate(res.data.startDate);
        if (res.data.endDate) setEndDate(res.data.endDate);
      }
    } catch (error) {
      console.error('Failed to fetch itinerary', error);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

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
        console.warn('Geolocation permission denied or error:', err);
        setIsDetectingLocation(false);
        alert('Could not retrieve current location. Please check browser permissions or type your city.');
      },
      { timeout: 8000 }
    );
  };

  const handleTitleSave = async () => {
    if (!editTitleVal.trim() || editTitleVal === title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const res = await axios.put(`/itineraries/${id}`, { title: editTitleVal });
      setTitle(res.data.title);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update title', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      const res = await axios.post(`/itineraries/${id}/members`, {
        email: newMemberEmail
      });
      setGroupMembers(res.data);
      setNewMemberEmail('');
      setShowMemberForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!newPlace || !newTime) return;

    try {
      const res = await axios.post(`/itineraries/${id}/destinations`, {
        location: newPlace,
        time: newTime,
        desc: newDesc
      });
      setPlan(res.data);
      setNewPlace('');
      setNewTime('');
      setNewDesc('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add place', error);
    }
  };

  const handleDeletePlace = async (destId) => {
    if (!window.confirm('Delete this place?')) return;
    try {
      const res = await axios.delete(`/itineraries/${id}/destinations/${destId}`);
      setPlan(res.data);
    } catch (error) {
      console.error('Failed to delete place', error);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiDestination.trim()) {
      setAiError('Please enter a destination.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError('');

    try {
      const res = await axios.post(`/itineraries/${id}/ai-generate`, {
        destination: aiDestination,
        startingFrom: aiStartingFrom,
        days: aiDays,
        startDate: aiStartDate,
        budget: aiBudget,
        preferences: aiPreferences
      });

      if (res.data) {
        if (res.data.destinations) setPlan(res.data.destinations);
        if (res.data.title) setTitle(res.data.title);
        if (res.data.startDate) setStartDate(res.data.startDate);
        if (res.data.endDate) setEndDate(res.data.endDate);
        setShowAiModal(false);
        setAiDestination('');
        setAiStartingFrom('');
        setAiPreferences('');
      }
    } catch (err) {
      console.error('AI Generation Failed:', err);
      setAiError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'transport':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Train className="h-3 w-3" /> Transit & Flights
          </span>
        );
      case 'hotel':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Hotel className="h-3 w-3" /> Hotel & Stay
          </span>
        );
      case 'food':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Utensils className="h-3 w-3" /> Food & Dining
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Compass className="h-3 w-3" /> Sights & Activity
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Sub Navigation */}
      <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4">
        <Link to={`/planner/${id}`} className="font-semibold text-primary-600 border-b-2 border-primary-600 pb-1">Itinerary</Link>
        <Link to={`/expenses/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Expenses</Link>
        <Link to={`/chat/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Chat & Docs</Link>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Panel: Itinerary List */}
        <div className="w-1/2 lg:w-5/12 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col overflow-y-auto">
          
          {/* Group Members Section */}
          <div className="mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="font-semibold text-slate-800 text-sm">Group Members ({groupMembers.length})</h3>
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="text-xs text-primary-600 font-medium hover:underline">
                {showMemberForm ? 'Cancel' : '+ Invite'}
              </button>
            </div>
            {showMemberForm && (
              <form onSubmit={handleAddMember} className="flex gap-2 mb-3">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  value={newMemberEmail} 
                  onChange={e => setNewMemberEmail(e.target.value)} 
                  className="flex-1 text-sm p-2 border border-slate-200 rounded outline-none focus:border-primary-500 bg-white" 
                  required 
                />
                <button type="submit" className="bg-primary-600 text-white text-sm px-3 py-1 rounded font-medium hover:bg-primary-700">Add</button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {groupMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 shadow-2xs">
                  <div className="w-4 h-4 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center uppercase font-bold text-[10px]">{member.name ? member.name[0] : 'U'}</div>
                  {member.name || 'User'}
                </div>
              ))}
            </div>
          </div>

          {/* Title, Dates, and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              {isEditingTitle ? (
                <input 
                  type="text" 
                  value={editTitleVal} 
                  onChange={(e) => setEditTitleVal(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  autoFocus
                  className="text-lg font-bold bg-slate-100 border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 text-slate-800"
                />
              ) : (
                <h2 
                  className="text-lg font-bold cursor-pointer hover:bg-slate-50 rounded px-1.5 py-1 -ml-1 text-slate-800 truncate max-w-[220px]"
                  onClick={() => {
                    setEditTitleVal(title);
                    setIsEditingTitle(true);
                  }}
                  title="Click to edit trip name"
                >
                  {title}
                </h2>
              )}
              {startDate && (
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>
                    {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {endDate && ` – ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-linear-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-full hover:from-purple-700 hover:to-indigo-700 shadow-xs transition-all transform hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                AI Planner
              </button>

              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 text-xs bg-slate-100 px-2.5 py-1.5 rounded-full text-slate-700 font-medium hover:bg-slate-200 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? 'Cancel' : 'Place'}
              </button>
            </div>
          </div>

          {/* Manual Add Place Form */}
          {showAddForm && (
            <form onSubmit={handleAddPlace} className="mb-4 p-3.5 border border-primary-200 bg-primary-50 rounded-xl space-y-2.5">
              <input type="text" placeholder="Location Name" value={newPlace} onChange={e => setNewPlace(e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded outline-none focus:border-primary-500 bg-white" required />
              <input type="text" placeholder="Time (e.g. Day 1 - 10:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded outline-none focus:border-primary-500 bg-white" required />
              <textarea placeholder="Description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded outline-none focus:border-primary-500 bg-white" rows={2} />
              <button type="submit" className="w-full bg-primary-600 text-white text-sm font-medium py-2 rounded hover:bg-primary-700 transition-colors">Add to Itinerary</button>
            </form>
          )}

          {/* Itinerary Items List */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {plan.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-auto">
                <Sparkles className="h-10 w-10 text-indigo-400 mb-3 animate-pulse" />
                <h4 className="font-semibold text-slate-700 mb-1">No destinations yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Use the <strong>AI Planner</strong> to automatically generate a day-by-day trip with hotels, trains/flights, food, and direct booking links!
                </p>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  Generate with AI
                </button>
              </div>
            ) : (
              plan.map((item, idx) => {
                const itemDateStr = item.date 
                  ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : '';

                return (
                  <div key={idx} className="group flex gap-3 p-3.5 border border-slate-100 rounded-xl hover:shadow-md transition-all cursor-pointer bg-slate-50/70 hover:bg-white relative">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      {idx !== plan.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getTypeBadge(item.type)}
                        {item.dayNumber && (
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            Day {item.dayNumber}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {itemDateStr ? `${itemDateStr} • ` : ''}{item.time || item.notes}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-800 text-sm">
                        {item.location}
                      </h3>
                      
                      {item.notes && item.notes !== item.time && (
                        <p className="text-[11px] text-slate-500 bg-slate-100/80 rounded-md px-2 py-1 mt-1">
                          💡 {item.notes}
                        </p>
                      )}

                      {item.desc && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      )}

                      {/* Action buttons: Booking Link & Google Maps Link */}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {item.bookingLink && (
                          <a
                            href={item.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Direct Booking / App Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>Google Maps</span>
                        </a>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeletePlace(item._id)}
                      className="absolute right-2.5 top-2.5 p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Google Map */}
        <div className="flex-1 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm">
           <MapContainer plan={plan} />
        </div>
      </div>

      {/* AI Planner Modal with High z-index to overlay Leaflet */}
      {showAiModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <h3 className="font-bold text-lg">AI Automated Itinerary Planner</h3>
                </div>
                <p className="text-xs text-indigo-100 mt-1">
                  Day-by-day scheduling with trains, hotels, food & direct booking links.
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
                    <h4 className="font-semibold text-slate-800 text-base">Planning Your Perfect Trip...</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Gemini AI is scheduling days, sourcing trains & stays, finding restaurants, and creating Google Maps & booking links. Please wait!
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAiGenerate} id="ai-planner-form" className="space-y-4">
                  {/* Destination */}
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

                  {/* Starting From with Current Location Auto-Detect */}
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
                        placeholder="e.g. Hyderabad, Mumbai, New York" 
                        value={aiStartingFrom} 
                        onChange={e => setAiStartingFrom(e.target.value)} 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>

                  {/* Start Date & Days */}
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
                        <option value={6}>6 Days</option>
                        <option value={7}>7 Days (1 Full Week)</option>
                        <option value={10}>10 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget Style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Budget Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'budget', label: 'Budget 🎒', desc: 'Hostels & Trains' },
                        { id: 'moderate', label: 'Moderate 🧳', desc: 'Standard Hotels' },
                        { id: 'luxury', label: 'Luxury ✨', desc: 'Top Resorts & Dining' },
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

                  {/* Preferences */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferences & Activities
                    </label>
                    <textarea 
                      placeholder="e.g. Vegetarian food, love historic spots, scenic beach sunsets, family friendly..." 
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
                  form="ai-planner-form"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-indigo-200 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  Generate Itinerary
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanner;
