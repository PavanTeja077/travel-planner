import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import useUserStore from '../store/userStore';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

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

  const handleNewTrip = async () => {
    try {
      const res = await axios.post('/itineraries', { title: 'Next Adventure' });
      navigate(`/planner/${res.data._id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
    }
  };

  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault(); // Stop click from propagating to Link
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">My Trips</h1>
        <button onClick={handleNewTrip} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="h-5 w-5" />
          New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-slate-700 mb-2">No trips planned yet</h2>
          <p className="text-slate-500 mb-6">Create your first itinerary to start planning!</p>
          <button onClick={handleNewTrip} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block">
            Start a Trip
          </button>
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
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Upcoming</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {trip.groupMembers?.length || 1}</span>
                </div>
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Active
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
