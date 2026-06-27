import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Yaoundé center coordinates
const YAOUNDE_CENTER = [3.8480, 11.5021];

export default function MapView({ properties = [] }) {
  return (
    <MapContainer
      center={YAOUNDE_CENTER}
      zoom={13}
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
    >
      {/* OpenStreetMap tiles — free, no API key needed */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Drop a pin for each property that has coordinates */}
      {properties
        .filter(p => p.latitude && p.longitude)
        .map(p => (
          <Marker key={p._id} position={[p.latitude, p.longitude]}>
            <Popup>
              <strong>{p.title}</strong><br />
              {p.quarter}, {p.city}<br />
              <strong>{p.rentPrice.toLocaleString()} FCFA/month</strong><br />
              {p.bedrooms} bed · {p.bathrooms} bath
            </Popup>
          </Marker>
        ))
      }
    </MapContainer>
  );
}