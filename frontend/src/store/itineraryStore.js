import { create } from 'zustand';

const useItineraryStore = create((set) => ({
  itineraries: [],
  currentItinerary: null,
  loading: false,
  error: null,
  setItineraries: (data) => set({ itineraries: data }),
  setCurrentItinerary: (data) => set({ currentItinerary: data }),
  setLoading: (status) => set({ loading: status }),
}));

export default useItineraryStore;
