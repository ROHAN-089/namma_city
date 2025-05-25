import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

const MapComponent = ({ 
  center, 
  zoom, 
  onClick, 
  onLocationSelect, 
  defaultMarkerPosition 
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);

    // Add click listener to the map
    if (onClick) {
      mapInstance.addListener('click', (e) => {
        onClick(e);
      });
    }

    return () => {
      // Cleanup
    };
  }, [center, zoom, onClick]);

  // Setup marker if there's a default position
  useEffect(() => {
    if (!map) return;

    // Create or update marker if we have a position
    if (defaultMarkerPosition) {
      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          position: defaultMarkerPosition,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Listen for dragend event on marker
        markerRef.current.addListener('dragend', () => {
          const position = markerRef.current.getPosition();
          if (onLocationSelect) {
            onLocationSelect({
              lat: position.lat(),
              lng: position.lng(),
            });
          }
        });
      } else {
        markerRef.current.setPosition(defaultMarkerPosition);
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [map, defaultMarkerPosition, onLocationSelect]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

const MapPicker = ({ 
  apiKey, 
  defaultLocation = { lat: 20.5937, lng: 78.9629 }, // Default to center of India
  defaultZoom = 12,
  onLocationSelect
}) => {
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const geocoderRef = useRef(null);

  // Initialize geocoder
  const initGeocoder = useCallback((map) => {
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, []);

  // Handle map click
  const handleMapClick = (e) => {
    const newLocation = { 
      lat: e.latLng.lat(), 
      lng: e.latLng.lng() 
    };
    
    setSelectedLocation(newLocation);
    getAddressFromCoordinates(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect(newLocation, address);
    }
  };

  // Get address from coordinates
  const getAddressFromCoordinates = (location) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        if (onLocationSelect) {
          onLocationSelect(location, results[0].formatted_address);
        }
      }
    });
  };

  // Search for a location
  const handleSearch = () => {
    if (!geocoderRef.current || !searchQuery) return;

    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newLocation = { 
          lat: location.lat(), 
          lng: location.lng() 
        };
        
        setSelectedLocation(newLocation);
        setAddress(results[0].formatted_address);
        
        if (onLocationSelect) {
          onLocationSelect(newLocation, results[0].formatted_address);
        }
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <Wrapper apiKey={apiKey} render={initGeocoder}>
        <MapComponent
          center={selectedLocation}
          zoom={defaultZoom}
          onClick={handleMapClick}
          onLocationSelect={onLocationSelect}
          defaultMarkerPosition={selectedLocation}
        />
      </Wrapper>

      {address && (
        <div className="mt-2">
          <p className="text-sm text-gray-700">Selected location: {address}</p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
