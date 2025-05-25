// OpenStreetMap configuration
export const MAP_CONFIG = {
  // OpenStreetMap tile layer URL
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  defaultCenter: [20.5937, 78.9629], // Center of India
  defaultZoom: 5,
  // Nominatim API for geocoding
  nominatimApi: 'https://nominatim.openstreetmap.org'
};

export default MAP_CONFIG;
