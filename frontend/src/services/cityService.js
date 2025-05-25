import api from './api';

// Get all cities
export const getAllCities = async () => {
  const response = await api.get('/cities');
  return response.data;
};

// Get city by ID
export const getCityById = async (cityId) => {
  const response = await api.get(`/cities/${cityId}`);
  return response.data;
};

// Create new city
export const createCity = async (cityData) => {
  // Handle form data for image upload
  const formData = new FormData();
  
  // Append all city data
  Object.keys(cityData).forEach(key => {
    if (key === 'centerCoords' && cityData.centerCoords) {
      // Handle coordinates from Leaflet map
      formData.append('coordinates[type]', 'Point');
      formData.append('coordinates[coordinates][0]', cityData.centerCoords.lng);
      formData.append('coordinates[coordinates][1]', cityData.centerCoords.lat);
    } else if (key === 'departments' && Array.isArray(cityData.departments)) {
      cityData.departments.forEach((dept, index) => {
        Object.keys(dept).forEach(deptKey => {
          formData.append(`departments[${index}][${deptKey}]`, dept[deptKey]);
        });
      });
    } else if (key !== 'cityLogo') {  // Changed from cityImage to cityLogo to match the form field
      formData.append(key, cityData[key]);
    }
  });
  
  // Append the city logo if available
  if (cityData.cityLogo) {
    formData.append('cityLogo', cityData.cityLogo);
  }
  
  const response = await api.post('/cities', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Update city
export const updateCity = async (cityId, cityData) => {
  // Handle form data for image upload
  const formData = new FormData();
  
  // Append all city data
  Object.keys(cityData).forEach(key => {
    if (key === 'coordinates') {
      formData.append('coordinates[type]', 'Point');
      formData.append('coordinates[coordinates][0]', cityData.coordinates.lng);
      formData.append('coordinates[coordinates][1]', cityData.coordinates.lat);
    } else if (key === 'departments' && Array.isArray(cityData.departments)) {
      cityData.departments.forEach((dept, index) => {
        Object.keys(dept).forEach(deptKey => {
          formData.append(`departments[${index}][${deptKey}]`, dept[deptKey]);
        });
      });
    } else if (key !== 'cityImage') {
      formData.append(key, cityData[key]);
    }
  });
  
  // Append the city image if available
  if (cityData.cityImage) {
    formData.append('cityImage', cityData.cityImage);
  }
  
  const response = await api.put(`/cities/${cityId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Delete city
export const deleteCity = async (cityId) => {
  const response = await api.delete(`/cities/${cityId}`);
  return response.data;
};

// Get cities near coordinates
export const getNearCities = async (lng, lat, maxDistance = 10000) => {
  const response = await api.get(`/cities/near?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`);
  return response.data;
};

// Add department to city
export const addDepartment = async (cityId, departmentData) => {
  const response = await api.post(`/cities/${cityId}/departments`, departmentData);
  return response.data;
};

// Remove department from city
export const removeDepartment = async (cityId, departmentId) => {
  const response = await api.delete(`/cities/${cityId}/departments/${departmentId}`);
  return response.data;
};
