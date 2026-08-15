'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationStats {
  lat: number;
  lng: number;
}

interface Props {
  locations: LocationStats[];
  height?: number;
}

// Component to auto-fit map bounds to all markers
function MapBounds({ locations }: { locations: LocationStats[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, locations]);

  return null;
}

export default function LocationMapAnalytics({ locations, height = 300 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height }} className="bg-gray-100 rounded-lg animate-pulse" />;

  const center: [number, number] = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [9.0820, 8.6753]; // Default to Nigeria

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, index) => (
          <Marker key={index} position={[loc.lat, loc.lng]}>
            <Popup>
              Location Response {index + 1}<br/>
              {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
            </Popup>
          </Marker>
        ))}
        {locations.length > 0 && <MapBounds locations={locations} />}
      </MapContainer>
    </div>
  );
}
