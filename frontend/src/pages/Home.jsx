import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Plane, 
  Hotel, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  Layers, 
  Users, 
  Navigation,
  Globe
} from 'lucide-react';
import useThemeStore from '../store/themeStore';

const FAQ_ITEMS = [
  {
    q: "How does the AI itinerary planner work?",
    a: "WayFinder uses multimodal Gemini AI models with automatic fallbacks to analyze your destination, travel duration, origin, and budget. It curates a day-by-day agenda including flights/trains, hand-picked hotels, famous local restaurants, and sights with precise timings."
  },
  {
    q: "Do the booking links charge extra fees or commissions?",
    a: "No! All booking links connect you directly to trusted platforms like Google Flights, Skyscanner, IRCTC Railways, Booking.com, and Agoda with zero markup."
  },
  {
    q: "Can I customize the theme color of my workspace?",
    a: "Yes! WayFinder includes a real-time Luxury Theme Switcher in the top navigation bar and dashboard. You can choose from Onyx Luxe (Apple Dark), Sapphire Ocean, Emerald Riviera, Sunset Bordeaux, and Cosmic Violet."
  },
  {
    q: "Is WayFinder responsive on mobile phones and tablets?",
    a: "Yes, every component, button, map, and form is engineered with mobile-first responsiveness so you and your group can plan and navigate effortlessly on any device."
  }
];

const Home = () => {
  const { currentTheme } = useThemeStore();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      
      {/* 1. HERO SECTION (Apple / Nguyen Luxe Template) */}
      <section className="relative pt-12 sm:pt-20 pb-12 text-center">
        {/* Soft Ambient Radial Glow (Screenshot 1) */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[350px] sm:h-[450px] rounded-full blur-3xl -z-10 pointer-events-none opacity-60"
          style={{ 
            background: `radial-gradient(circle, ${currentTheme.glow} 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)` 
          }}
        />

        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WayFinder 2.0 • AI-Native Travel Workspace</span>
          </div>

          {/* Master Headline (Apple Style) */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            The Unified Workspace for <span style={{ color: currentTheme.accent }}>Modern Travel.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Route journeys to the right transport, curate day-by-day itineraries, and keep your group expenses in sync — from idea to departure.
          </p>

          {/* Action Pill Buttons (Screenshot 1) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-bold text-sm shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Start Planning with AI</span>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/90 hover:bg-white text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore My Dashboard</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>

          {/* Micro social proof */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Direct Booking Deep-links
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Live Google Maps Tracking
            </span>
          </div>
        </div>

        {/* 2. AGENT INTERACTIVE WORKFLOW GRAPHIC (Inspired by Screenshot 3 & 4) */}
        <div className="mt-16 max-w-4xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 relative overflow-hidden">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                AI Orchestration Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Autonomous agents routing each layer of your trip
              </h3>
            </div>

            {/* Tree Network Visualization */}
            <div className="flex flex-col items-center">
              {/* Root Node */}
              <div 
                className="px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-md flex items-center gap-2 mb-8"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Compass className="h-4 w-4 text-white" />
                <span>WayFinder Central Dispatch</span>
              </div>

              {/* Connecting Lines */}
              <div className="w-full max-w-md h-6 border-t-2 border-dashed border-slate-200 relative mb-4 hidden sm:block">
                <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-slate-400" />
                <div className="absolute -top-1 left-1/3 w-2 h-2 rounded-full bg-slate-400" />
                <div className="absolute -top-1 left-2/3 w-2 h-2 rounded-full bg-slate-400" />
                <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-slate-400" />
              </div>

              {/* Sub-Agent Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    <Plane className="h-4 w-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Transit Agent</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Google Flights & IRCTC</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    <Hotel className="h-4 w-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Hotel Agent</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Booking.com & Agoda</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Spatial Agent</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Google Maps Geocoding</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Finance Agent</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Automated Splitter (₹)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES (Screenshot 5) */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Key Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Crafted for effortless group coordination.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Day-by-Day Precision
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Visual Itinerary Management</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
              Organize travel with structured day-by-day cards. Track timing, assign places, review hotel details, and keep your entire group aligned in real time.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Day 1 • Morning Transit & Hotel Check-in</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Confirmed</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <Users className="h-3.5 w-3.5 text-blue-600" /> Team Harmony
              </div>
              <h3 className="text-xl font-bold text-slate-900">Group Splitter</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Add expenses in Rupees (₹) anytime. The math automatically resolves multi-party debts with zero confusion.
              </p>
            </div>
            <Link to="/dashboard" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
              <span>View Splitter &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS (Screenshot 2) */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
