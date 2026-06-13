import { useParams, Link } from 'react-router-dom';
import { MapContainer } from '../components/MapContainer';
import { MapPin, Clock, Navigation, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ItineraryPlanner = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState([]);
  const [newPlace, setNewPlace] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [groupMembers, setGroupMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [title, setTitle] = useState('Trip Planner');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal, setEditTitleVal] = useState('');

  const fetchItinerary = async () => {
    try {
      const res = await axios.get(`/itineraries/${id}`);
      if (res.data) {
        if (res.data.title) setTitle(res.data.title);
        if (res.data.destinations) setPlan(res.data.destinations);
        if (res.data.groupMembers) setGroupMembers(res.data.groupMembers);
      }
    } catch (error) {
      console.error('Failed to fetch itinerary', error);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

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
        <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col overflow-y-auto">
          
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-800">Group Members ({groupMembers.length})</h3>
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="text-xs text-primary-600 font-medium">
                {showMemberForm ? 'Cancel' : '+ Invite'}
              </button>
            </div>
            {showMemberForm && (
              <form onSubmit={handleAddMember} className="flex gap-2 mb-3">
                <input type="email" placeholder="Email address" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} className="flex-1 text-sm p-2 border border-slate-200 rounded outline-none focus:border-primary-500" required />
                <button type="submit" className="bg-primary-600 text-white text-sm px-3 py-1 rounded font-medium hover:bg-primary-700">Add</button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {groupMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600">
                  <div className="w-4 h-4 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center uppercase">{member.name ? member.name[0] : 'U'}</div>
                  {member.name || 'User'}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            {isEditingTitle ? (
              <input 
                type="text" 
                value={editTitleVal} 
                onChange={(e) => setEditTitleVal(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                autoFocus
                className="text-xl font-bold bg-slate-100 border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 flex-1 mr-2 text-slate-800"
              />
            ) : (
              <h2 
                className="text-xl font-bold cursor-pointer hover:bg-slate-50 rounded px-2 py-1 -ml-2"
                onClick={() => {
                  setEditTitleVal(title);
                  setIsEditingTitle(true);
                }}
                title="Click to edit trip name"
              >
                {title}
              </h2>
            )}
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium hover:bg-slate-200 shrink-0"
            >
              {showAddForm ? 'Cancel' : '+ Add Place'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddPlace} className="mb-6 p-4 border border-primary-200 bg-primary-50 rounded-xl space-y-3">
              <input type="text" placeholder="Location Name" value={newPlace} onChange={e => setNewPlace(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500" required />
              <input type="text" placeholder="Time (e.g. 10:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500" required />
              <textarea placeholder="Description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500" />
              <button type="submit" className="w-full bg-primary-600 text-white font-medium py-2 rounded hover:bg-primary-700 transition-colors">Add to Itinerary</button>
            </form>
          )}

          <div className="space-y-4">
            {plan.map((item, idx) => (
              <div key={idx} className="group flex gap-4 p-3 border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-slate-50 relative">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  {idx !== plan.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                </div>
                <div className="flex-1 pr-8">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {item.location}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> {item.notes || item.time}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleDeletePlace(item._id)}
                  className="absolute right-3 top-3 p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-200">
           <MapContainer plan={plan} />
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;
