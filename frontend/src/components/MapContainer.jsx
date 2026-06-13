import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = [15.2993, 74.1240]; // Goa

// Helper component to auto-fit map to markers
const MapBounds = ({ plan }) => {
  const map = useMap();
  useEffect(() => {
    if (plan && plan.length > 0) {
      const validPoints = plan.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [plan, map]);
  return null;
};

export const MapContainer = ({ plan }) => {
  return (
    <LeafletMap center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <MapBounds plan={plan} />
      
      {plan && plan.length > 0 ? (
        plan.map((place, idx) => (
          place.lat && place.lng && (
            <Marker key={idx} position={[place.lat, place.lng]}>
              <Popup>
                <strong>{place.location}</strong> <br />
                {place.notes && <span>{place.notes}<br/></span>}
                {place.desc}
              </Popup>
            </Marker>
          )
        ))
      ) : (
        <Marker position={defaultCenter}>
          <Popup>
            Goa, India <br /> Add some destinations to update the map!
          </Popup>
        </Marker>
      )}
    </LeafletMap>
  );
};
