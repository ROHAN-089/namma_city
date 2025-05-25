import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';

// Fix for default marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set default icon for all markers
if (typeof window !== 'undefined') {
  L.Marker.prototype.options.icon = DefaultIcon;
}

const LocationMarker = ({ position, onPositionChange }) => {
  const [markerPosition, setMarkerPosition] = useState(position || [20.5937, 78.9629]);
  
  useEffect(() => {
    if (position) {
      setMarkerPosition([position.lat, position.lng]);
    }
  }, [position]);

  const map = useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setMarkerPosition([newPos.lat, newPos.lng]);
      if (onPositionChange) {
        onPositionChange(newPos);
      }
    },
  });

  return position === null ? null : (
    <Marker position={markerPosition} draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          setMarkerPosition([newPos.lat, newPos.lng]);
          if (onPositionChange) {
            onPositionChange({ lat: newPos.lat, lng: newPos.lng });
          }
        }
      }}>
      <Popup>Drag me to adjust location</Popup>
    </Marker>
  );
};

const LeafletMap = ({ onLocationSelect, defaultPosition }) => {
  const [position, setPosition] = useState(
    defaultPosition || { lat: 20.5937, lng: 78.9629 }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Using Nominatim for geocoding (free service)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const newPos = { 
            lat: parseFloat(lat), 
            lng: parseFloat(lon),
            address: display_name
          };
          setPosition(newPos);
          if (onLocationSelect) {
            onLocationSelect(newPos, display_name);
          }
          // Update map view
          mapRef.current.flyTo([lat, lon], 12);
        }
      })
      .catch(error => console.error('Error fetching location:', error));
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    setIsLoading(true);
    
    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      const address = data.display_name || `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      onLocationSelect({ lat, lng }, address);
    } catch (error) {
      console.error('Error getting address:', error);
      onLocationSelect({ lat, lng }, `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="h-96 w-full rounded-md overflow-hidden border border-gray-300 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-md shadow-lg">
              <p className="text-gray-700">Loading map data...</p>
            </div>
          </div>
        )}
        
        <MapContainer
          center={position}
          zoom={12}
          style={{ 
            height: '100%', 
            width: '100%',
            minHeight: '300px',
            zIndex: 1
          }}
          whenCreated={(mapInstance) => { 
            mapRef.current = mapInstance;
            // Add a small delay to ensure the map is properly initialized
            setTimeout(() => {
              mapInstance.invalidateSize();
            }, 100);
          }}
          onClick={handleMapClick}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Selected Location</p>
                <p>Lat: {position[0].toFixed(6)}</p>
                <p>Lng: {position[1].toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        <p>Click on the map to select a location or search for an address.</p>
      </div>
    </div>
  );
};

export default LeafletMap;
