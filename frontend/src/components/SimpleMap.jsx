import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { indianCities } from '../data/indianCities';

// Fix for default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SimpleMap = ({ onLocationSelect, initialPosition }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to handle city selection
  const handleCitySelect = (city) => {
    if (!city) return;
    
    setSelectedCity(city.name);
    setShowDropdown(false);
    
    if (mapRef.current) {
      // Center map on selected city
      mapRef.current.setView([city.lat, city.lng], 12);
      
      // Remove existing marker if any
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      
      // Add new marker
      markerRef.current = L.marker([city.lat, city.lng]).addTo(mapRef.current);
      
      // Call the callback with coordinates
      if (onLocationSelect) {
        onLocationSelect({ lat: city.lat, lng: city.lng });
      }
    }
  };
  
  // Filter cities based on input
  const handleCitySearch = (query) => {
    setSelectedCity(query);
    if (query.length > 1) {
      const filtered = indianCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map('map').setView(
        [initialPosition?.lat || 20.5937, initialPosition?.lng || 78.9629], 
        5
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add click handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker if any
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(map);
        
        // Call the callback with coordinates
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      });

      mapRef.current = map;
      
      // Add initial marker if initialPosition is provided
      if (initialPosition?.lat && initialPosition?.lng) {
        markerRef.current = L.marker([initialPosition.lat, initialPosition.lng]).addTo(map);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationSelect, initialPosition]);

  return (
    <div>
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => handleCitySearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for an Indian city..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCities.length > 0 ? (
                <ul className="py-1">
                  {filteredCities.map((city) => (
                    <li
                      key={`${city.name}-${city.state}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCitySelect(city)}
                    >
                      <div className="font-medium">{city.name}, {city.state}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div id="map" style={{ height: '400px', width: '100%' }} />
    </div>
  );
};

export default SimpleMap;
