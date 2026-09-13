import { useEffect, useState, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ExternalLink, Navigation, Compass, Hotel, Utensils, Train, MapPin, Layers } from 'lucide-react';

// Tile provider configurations (including authentic Google Maps tile layers)
const MAP_STYLES = {
  googleRoadmap: {
    name: 'Google Maps',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  },
  googleHybrid: {
    name: 'Satellite Hybrid',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Satellite'
  },
  googleTerrain: {
    name: 'Google Terrain',
    url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Terrain'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
};

// Custom SVG Icons for different categories
const createCustomIcon = (type, index) => {
  let bgColor = '#10B981'; // emerald for activity
  let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

  if (type === 'transport') {
    bgColor = '#2563EB'; // blue
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m18 22-2-3"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle></svg>`;
  } else if (type === 'hotel') {
    bgColor = '#7C3AED'; // purple
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6.57"></path><path d="M12 11h.01"></path><path d="M12 7h.01"></path><path d="M14 15.43V22"></path><path d="M15 16a5 5 0 0 0-6 0"></path><path d="M16 11h.01"></path><path d="M16 7h.01"></path><path d="M8 11h.01"></path><path d="M8 7h.01"></path><rect x="4" y="2" width="16" height="20" rx="2"></rect></svg>`;
  } else if (type === 'food') {
    bgColor = '#EA580C'; // orange
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"></path><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path><path d="m2.1 21.8 6.4-6.3"></path><path d="m19 5-7 7"></path></svg>`;
  }

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
    ">
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${iconSvg}
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        background: #1E293B;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 0px 5px;
        border-radius: 8px;
        border: 1px solid white;
        line-height: 14px;
      ">
        ${index + 1}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 38],
    iconAnchor: [16, 36],
    popupAnchor: [0, -32]
  });
};

const defaultCenter = [15.2993, 74.1240]; // Goa

// Auto-fit map to markers with smooth animation
const MapBounds = ({ plan }) => {
  const map = useMap();
  useEffect(() => {
    if (plan && plan.length > 0) {
      const validPoints = plan.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
      }
    }
  }, [plan, map]);
  return null;
};

export const MapContainer = ({ plan }) => {
  const [currentStyle, setCurrentStyle] = useState('googleRoadmap');
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const activeStyle = MAP_STYLES[currentStyle] || MAP_STYLES.googleRoadmap;

  return (
    <div className="relative w-full h-full">
      {/* Floating Map Style Switcher (Google Maps, Satellite, Terrain, OSM) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden text-xs">
        <div className="flex items-center p-1 gap-1">
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setCurrentStyle(key)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                currentStyle === key 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      <LeafletMap 
        center={defaultCenter} 
        zoom={10} 
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          key={currentStyle}
          url={activeStyle.url}
          subdomains={activeStyle.subdomains}
          attribution={activeStyle.attribution}
          maxZoom={20}
        />
        <MapBounds plan={plan} />
        
        {plan && plan.length > 0 ? (
          plan.map((place, idx) => (
            place.lat && place.lng ? (
              <Marker 
                key={idx} 
                position={[place.lat, place.lng]}
                icon={createCustomIcon(place.type, idx)}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-1 space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {place.type || 'Activity'}
                      </span>
                      {place.time && (
                        <span className="text-[11px] font-medium text-slate-500">
                          {place.time}
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 leading-snug">
                      {place.location}
                    </div>

                    {place.notes && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-1.5 rounded-lg">
                        💡 {place.notes}
                      </div>
                    )}

                    {place.desc && (
                      <div className="text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto">
                        {place.desc}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-100">
                      {place.bookingLink && (
                        <a
                          href={place.bookingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                        >
                          <span>Direct Booking / App Link</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))
        ) : (
          <Marker position={defaultCenter} icon={createCustomIcon('activity', 0)}>
            <Popup>
              <div className="p-1">
                <strong>Goa, India</strong> <br /> 
                Generate an itinerary or add destinations to see them on Google Maps!
              </div>
            </Popup>
          </Marker>
        )}
      </LeafletMap>
    </div>
  );
};
