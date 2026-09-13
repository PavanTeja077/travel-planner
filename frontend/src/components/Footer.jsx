import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Plane, Hotel, Utensils, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white/70 backdrop-blur-md pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                WayFinder<span className="text-indigo-600">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              The unified intelligence platform for modern explorers. Curating day-by-day agendas, live transit routing, and group expense harmony in one seamless experience.
            </p>

            {/* Social / Trust Badges */}
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified Partners
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                ⚡ Powered by Gemini AI
              </span>
            </div>
          </div>

          {/* Transit Booking Apps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5 text-blue-600" /> Transit & Flights
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.google.com/travel/flights" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Google Flights</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.skyscanner.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Skyscanner</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.irctc.co.in" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>IRCTC Indian Rail</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.thetrainline.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Trainline Europe</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.makemytrip.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>MakeMyTrip</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Hotels & Stays */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Hotel className="h-3.5 w-3.5 text-purple-600" /> Hotels & Stays
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.booking.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Booking.com</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.agoda.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Agoda</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.airbnb.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Airbnb Stays</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.expedia.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Expedia</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.hotels.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Hotels.com</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Activities & Food */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-amber-600" /> Food & Sights
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Google Maps Places</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.tripadvisor.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>TripAdvisor Reviews</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.getyourguide.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>GetYourGuide Tours</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.viator.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Viator Experiences</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.zomato.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 flex items-center justify-between group">
                  <span>Zomato Dining</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WayFinder Inc. All trademarks and partner brand names belong to their respective owners.</p>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-slate-900 transition-colors">Register</Link>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for Explorers
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
