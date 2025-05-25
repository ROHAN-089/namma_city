import api from './api';

// Get all comments for an issue
export const getCommentsByIssue = async (issueId) => {
  const response = await api.get(`/comments/issue/${issueId}`);
  return response.data;
};

// Create a new comment
export const createComment = async (commentData) => {
  // Handle form data for image upload
  const formData = new FormData();
  
  // Append comment data
  formData.append('text', commentData.text);
  formData.append('issue', commentData.issue);
  
  if (commentData.parentComment) {
    formData.append('parentComment', commentData.parentComment);
  }
  
  // Append images if available
  if (commentData.images && commentData.images.length > 0) {
    commentData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/comments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Update a comment
export const updateComment = async (commentId, commentData) => {
  // Handle form data for image upload
  const formData = new FormData();
  
  // Append comment text
  formData.append('text', commentData.text);
  
  // Append new images if available
  if (commentData.images && commentData.images.length > 0) {
    commentData.images.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }
  
  const response = await api.put(`/comments/${commentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Like/Unlike a comment
export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};
