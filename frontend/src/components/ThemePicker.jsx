import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import useThemeStore, { THEMES } from '../store/themeStore';

export const ThemePicker = ({ compact = false }) => {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (compact) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 flex items-center justify-center transition-all text-slate-700 hover:text-slate-900 shadow-2xs"
          title="Change Theme Color"
        >
          <div 
            className="w-4 h-4 rounded-full border border-white shadow-2xs" 
            style={{ backgroundColor: currentTheme.color }} 
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-[9999] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-slate-500" /> Theme Accent
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Customize your luxury style</p>
            </div>
            <div className="p-1 space-y-1 mt-1">
              {Object.values(THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentTheme.id === theme.id
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-white/80 shadow-2xs" 
                      style={{ backgroundColor: theme.color }} 
                    />
                    <span>{theme.name}</span>
                  </div>
                  {currentTheme.id === theme.id && (
                    <Check className="h-3.5 w-3.5 text-slate-900" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard embedded panel
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
        <Palette className="h-3.5 w-3.5" /> Accent:
      </div>
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 shadow-2xs">
        {Object.values(THEMES).map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              currentTheme.id === theme.id
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title={`Switch to ${theme.name}`}
          >
            <span 
              className="w-3 h-3 rounded-full border border-white shadow-2xs" 
              style={{ backgroundColor: theme.color }} 
            />
            <span className="hidden sm:inline">{theme.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemePicker;
