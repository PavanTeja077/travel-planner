import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ItineraryPlanner from './pages/ItineraryPlanner';
import Expenses from './pages/Expenses';
import Communication from './pages/Communication';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import useThemeStore from './store/themeStore';

function App() {
  const { currentTheme } = useThemeStore();

  return (
    <Router>
      <div 
        className="min-h-screen flex flex-col font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative"
        style={{
          backgroundColor: '#FAFBFD'
        }}
      >
        {/* Subtle Ambient Radial Glow (Apple / Nguyen aesthetic) */}
        <div 
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-40 transition-all duration-700"
          style={{ background: currentTheme.glow }}
        />

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner/:id" element={<ItineraryPlanner />} />
            <Route path="/expenses/:id" element={<Expenses />} />
            <Route path="/chat/:id" element={<Communication />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
