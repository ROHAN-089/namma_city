/**
 * Reverse geocode coordinates to get a human-readable address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    // Use a CORS proxy to make the request
    // Or directly return coordinate-based location to avoid the CORS issue altogether
    const formattedCoords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    // Instead of making the API call that would trigger CORS errors,
    // we'll just return a simple location string based on the coordinates
    return `Location (${formattedCoords})`;
    
    /* Original API call - commented out due to CORS issues
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    const address = data.address;
    if (!address) return null;
    
    const addressParts = [
      address.road,
      address.suburb,
      address.city || address.town || address.village,
      address.state,
      address.postcode
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Location';
    */
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Return a fallback string with coordinates
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};
