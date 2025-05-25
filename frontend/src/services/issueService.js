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
  // Check if this is a simple status update (no files involved)

  try {
    // Check if we're updating issue status only
    if (issueData.status && !issueData.images) {
      const statusMap = {
        'Open': 'reported',
        'In Progress': 'in_progress', 
        'Resolved': 'resolved'
      };

      // Make sure we're using the correct field names expected by the backend
      const updatePayload = {
        status: statusMap[issueData.status] || 'reported', // Default to 'reported' if not found
        statusNote: issueData.statusNote || issueData.comment || ""
      };
      
      // Log what we're sending to help with debugging
      console.log('Sending status update payload:', updatePayload);
      
      const response = await api.put(`/issues/${issueId}`, updatePayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Issue update response:', response.data);
      return response.data;
    }
    
    // For updates with files, use FormData
    const formData = new FormData();

    // Append all issue data
    Object.keys(issueData).forEach(key => {
      if (key === 'location' && issueData.location && typeof issueData.location === 'object') {
        formData.append('location[type]', 'Point');
        // Make sure the coordinates exist before trying to access them
        if (issueData.location.coordinates) {
          formData.append('location[coordinates][0]', issueData.location.coordinates[0]); // longitude
          formData.append('location[coordinates][1]', issueData.location.coordinates[1]); // latitude
        }
        if (issueData.location.address) {
          formData.append('location[address]', issueData.location.address);
        }
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

    console.log('Sending form data update');
    const response = await api.put(`/issues/${issueId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating issue:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to update issue');
    }
    throw error;
  }
};

// Delete issue
export const deleteIssue = async (issueId) => {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data;
};

// Verify and close a resolved issue (for issue creators)
export const verifyAndCloseIssue = async (issueId, feedback = '') => {
  try {
    console.log(`Verifying and closing issue ${issueId} with feedback: ${feedback}`);
    
    // Since DELETE requests don't always support request bodies in all environments,
    // let's first update the issue with the feedback, then delete it
    if (feedback) {
      await api.put(`/issues/${issueId}/feedback`, {
        feedback: feedback,
        verifiedByReporter: true
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Now delete the issue
    const response = await api.delete(`/issues/${issueId}`);
    
    return { success: true, message: 'Issue closed successfully', data: response.data };
  } catch (error) {
    console.error('Error verifying and closing issue:', error);
    throw new Error(error.response?.data?.message || 'Failed to close issue. Please try again.');
  }
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
  // The correct endpoint based on the backend route
  const url = queryString ? `/issues/department/issues?${queryString}` : '/issues/department/issues';

  try {
    console.log('Fetching department issues from:', url);
    const response = await api.get(url);
    console.log('Department issues fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching department issues:', error);
    throw error;
  }
};
