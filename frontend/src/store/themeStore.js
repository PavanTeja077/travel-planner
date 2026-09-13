import { create } from 'zustand';

export const THEMES = {
  onyx: {
    id: 'onyx',
    name: 'Onyx Luxe (Apple)',
    color: '#0f172a',
    primary: '#0f172a',
    primaryLight: '#f8fafc',
    accent: '#2563eb',
    badge: 'bg-slate-900 text-white',
    button: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20',
    heroGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    accentGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    border: 'border-slate-200',
    activeRing: 'ring-slate-900/20 border-slate-900',
    text: 'text-slate-900',
    glow: 'rgba(15, 23, 42, 0.12)'
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Ocean',
    color: '#2563eb',
    primary: '#2563eb',
    primaryLight: '#eff6ff',
    accent: '#6366f1',
    badge: 'bg-blue-600 text-white',
    button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25',
    heroGradient: 'from-blue-700 via-indigo-600 to-cyan-600',
    accentGradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200',
    activeRing: 'ring-blue-500/20 border-blue-500',
    text: 'text-blue-600',
    glow: 'rgba(37, 99, 235, 0.15)'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Riviera',
    color: '#059669',
    primary: '#059669',
    primaryLight: '#ecfdf5',
    accent: '#10b981',
    badge: 'bg-emerald-600 text-white',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25',
    heroGradient: 'from-emerald-800 via-teal-700 to-emerald-600',
    accentGradient: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-200',
    activeRing: 'ring-emerald-500/20 border-emerald-500',
    text: 'text-emerald-600',
    glow: 'rgba(5, 150, 105, 0.15)'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Bordeaux',
    color: '#e11d48',
    primary: '#e11d48',
    primaryLight: '#fff1f2',
    accent: '#f59e0b',
    badge: 'bg-rose-600 text-white',
    button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25',
    heroGradient: 'from-rose-700 via-pink-600 to-amber-600',
    accentGradient: 'from-rose-600 to-amber-500',
    border: 'border-rose-200',
    activeRing: 'ring-rose-500/20 border-rose-500',
    text: 'text-rose-600',
    glow: 'rgba(225, 29, 72, 0.15)'
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Violet',
    color: '#7c3aed',
    primary: '#7c3aed',
    primaryLight: '#faf5ff',
    accent: '#c026d3',
    badge: 'bg-purple-600 text-white',
    button: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25',
    heroGradient: 'from-purple-800 via-indigo-700 to-fuchsia-600',
    accentGradient: 'from-purple-600 to-fuchsia-600',
    border: 'border-purple-200',
    activeRing: 'ring-purple-500/20 border-purple-500',
    text: 'text-purple-600',
    glow: 'rgba(124, 58, 237, 0.15)'
  }
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wayfinder_theme');
    if (saved && THEMES[saved]) return THEMES[saved];
  }
  return THEMES.onyx;
};

const applyThemeToDom = (theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-glow', theme.glow);
  }
};

export const useThemeStore = create((set) => ({
  currentTheme: (() => {
    const theme = getInitialTheme();
    applyThemeToDom(theme);
    return theme;
  })(),

  setTheme: (themeId) => {
    const newTheme = THEMES[themeId] || THEMES.onyx;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wayfinder_theme', themeId);
    }
    applyThemeToDom(newTheme);
    set({ currentTheme: newTheme });
  }
}));

export default useThemeStore;
