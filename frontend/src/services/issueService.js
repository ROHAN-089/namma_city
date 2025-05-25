import api from './api';

export const getAllIssues = async (cityId = null, filters = {}) => {
  const queryParams = new URLSearchParams();

  // Add cityId to filters if provided
  if (cityId) {
    filters.city = cityId;
  }

  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/issues?${queryString}` : '/issues';

  const response = await api.get(url);
  return response.data;
};

// Get issue by ID
export const getIssueById = async (issueId) => {
  const response = await api.get(`/issues/${issueId}`);
  return response.data;
};

// Create new issue
export const createIssue = async (issueData) => {
  try {
    // Create the complete issue data including all required fields
    const jsonData = {
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      priority: issueData.priority || 'medium',
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(issueData.location.coordinates[0]),
          parseFloat(issueData.location.coordinates[1])
        ],
        address: issueData.location.address
      },
      // Ensure proper city data format - backend expects city name as string
      city: typeof issueData.city === 'string' ? issueData.city : 
            (issueData.city && issueData.city.name ? issueData.city.name : 'Unknown')
    };
    
    console.log('Formatted city data for API:', jsonData.city);

    console.log('Sending issue data:', jsonData);

    const response = await api.post('/issues', jsonData);
    console.log('Issue created successfully:', response.data);

    // If we have images, handle them after successful issue creation
    if (issueData.images?.length > 0) {
      const formData = new FormData();
      issueData.images.forEach(image => {
        formData.append('images', image);
      });

      await api.put(`/issues/${response.data._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error in createIssue service:', error);
    throw error;
  }
};

// Update issue
export const updateIssue = async (issueId, issueData) => {
  // Handle form data for image upload
  const formData = new FormData();

  // Append all issue data
  Object.keys(issueData).forEach(key => {
    if (key === 'location') {
      formData.append('location[type]', 'Point');
      // Use the coordinates directly from the location object
      formData.append('location[coordinates][0]', issueData.location.coordinates[0]); // longitude
      formData.append('location[coordinates][1]', issueData.location.coordinates[1]); // latitude
      formData.append('location[address]', issueData.location.address);
    } else if (key !== 'images') {
      formData.append(key, issueData[key]);
    }
  });

  // Append new images if available
  if (issueData.images && issueData.images.length > 0) {
    issueData.images.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }

  const response = await api.put(`/issues/${issueId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

// Delete issue
export const deleteIssue = async (issueId) => {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data;
};

// Upvote/Remove upvote for an issue
export const upvoteIssue = async (issueId) => {
  const response = await api.post(`/issues/${issueId}/upvote`);
  return response.data;
};

// Downvote/Remove downvote for an issue
export const downvoteIssue = async (issueId) => {
  const response = await api.post(`/issues/${issueId}/downvote`);
  return response.data;
};

// Get issues reported by the current user
export const getUserIssues = async (page = 1, limit = 10) => {
  const response = await api.get(`/issues/user/issues?page=${page}&limit=${limit}`);
  return response.data;
};

// Get issues for department dashboard
export const getDepartmentIssues = async (filters = {}) => {
  // Convert filters to query string
  const queryParams = new URLSearchParams();

  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/issues/department/issues?${queryString}` : '/issues/department/issues';

  const response = await api.get(url);
  return response.data;
};
