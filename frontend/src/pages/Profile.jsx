import { UserCircle, Settings, LogOut } from 'lucide-react';

const Profile = () => {
  // Mock User
  const user = {
    name: 'Pavan Teja',
    email: 'pavan@example.com',
    trips: 4
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
      
      <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
        <div className="h-24 w-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
          <UserCircle className="h-16 w-16" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <div className="flex gap-4 pt-4 w-full border-t border-slate-100 mt-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-primary-600">{user.trips}</p>
            <p className="text-sm text-slate-500">Total Trips</p>
          </div>
          <div className="w-px bg-slate-100"></div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-primary-600">₹0</p>
            <p className="text-sm text-slate-500">Pending Dues</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 text-slate-700">
          <Settings className="h-5 w-5 text-slate-400" />
          <span className="font-medium">Account Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-red-600">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
