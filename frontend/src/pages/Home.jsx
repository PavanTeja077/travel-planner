import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800 leading-tight">
          Plan Your Next <span className="text-gradient">Adventure</span> Together.
        </h1>
        <p className="text-xl text-slate-600">
          The ultimate group travel planner. Organize itineraries, split expenses in ₹, chat in real-time, and store all your tickets in one place.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link 
          to="/dashboard" 
          className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1"
        >
          Get Started Now
        </Link>
        <Link 
          to="/dashboard"
          className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-full shadow-sm border border-slate-200 transition-all"
        >
          View Demo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16">
        <FeatureCard 
          title="Shared Itinerary" 
          desc="Collaborate with your friends in real-time. Drag and drop places using Google Maps integration." 
        />
        <FeatureCard 
          title="Expense Splitter" 
          desc="Keep track of all shared costs. Automatically calculates who owes who in Rupees (₹)." 
        />
        <FeatureCard 
          title="Cloud Vault" 
          desc="Store all your flight tickets, hotel bookings, and IDs securely using Cloudinary." 
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="glass-card p-6 text-left hover:-translate-y-1 transition-transform cursor-pointer">
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{desc}</p>
  </div>
);

export default Home;
