import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, User, LogOut, Menu, X, Sparkles, MapPin, DollarSign, Info } from 'lucide-react';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';
import { ThemePicker } from './ThemePicker';

export const Navbar = () => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const { currentTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'AI Studio', path: '/dashboard', icon: Sparkles },
    { name: 'Expenses', path: user ? '/dashboard' : '/login', icon: DollarSign },
    { name: 'About', path: '/#about', icon: Info },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 max-w-5xl mx-auto w-full transition-all">
      <nav className="bg-white/90 backdrop-blur-xl rounded-full border border-slate-200/90 shadow-lg shadow-slate-200/50 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo (Always Navigates to Dashboard) */}
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            WayFinder<span style={{ color: currentTheme.accent }}>.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-3 text-xs font-semibold text-slate-600">
          <Link 
            to="/dashboard" 
            className={`px-3 py-1.5 rounded-full transition-colors ${
              location.pathname === '/dashboard' 
                ? 'bg-slate-100 text-slate-900 font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard" 
            className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Studio</span>
          </Link>
          <Link 
            to="/" 
            className={`px-3 py-1.5 rounded-full transition-colors ${
              location.pathname === '/' 
                ? 'bg-slate-100 text-slate-900 font-bold' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Features
          </Link>
          <a 
            href="#booking-partners" 
            className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Partners
          </a>
        </div>

        {/* Right Side: Theme Picker & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Color Switcher Button */}
          <ThemePicker compact={true} />

          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-semibold text-slate-700"
              >
                <div 
                  className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-2xs"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {user.name ? user.name[0] : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="text-xs font-bold text-white px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: currentTheme.primary }}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl p-4 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI Itinerary Studio</span>
          </Link>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Info className="h-4 w-4 text-slate-500" />
            <span>Features & Overview</span>
          </Link>
          {user && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>My Profile ({user.name})</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
