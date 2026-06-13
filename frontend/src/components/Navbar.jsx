import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut } from 'lucide-react';
import useUserStore from '../store/userStore';

const Navbar = () => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl shadow-sm">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              WayFinder
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 flex items-center gap-1">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
