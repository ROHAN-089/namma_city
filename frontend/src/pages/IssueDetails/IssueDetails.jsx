import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusUpdater from '../../components/StatusUpdater/StatusUpdater';
import CommentBox from '../../components/CommentBox/CommentBox';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaBuilding, 
  FaArrowLeft, 
  FaExclamationCircle, 
  FaThumbsUp, 
  FaCamera, 
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner 
} from 'react-icons/fa';
import { getIssueById, upvoteIssue, updateIssue, verifyAndCloseIssue } from '../../services/issueService';

const IssueDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [closeFeedback, setCloseFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [closingIssue, setClosingIssue] = useState(false);

  // Fetch issue data
  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const data = await getIssueById(id);
      
      if (data) {
        setIssue(data);
        setUpvotes(data.upvotes?.length || 0);
        setUpvoted(user && data.upvotes?.includes(user._id));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching issue details:', err);
      setError(err.message || 'Failed to load issue details');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get display status from backend status
  const getDisplayStatus = () => {
    if (!issue || !issue.status) return 'Unknown';
    
    // Map backend status to display status
    const statusMap = {
      'reported': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'reopened': 'Open',
      'closed': 'Resolved'
    };
    
    return statusMap[issue.status] || issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
  };
  
  // Map backend status to a user-friendly display version
  const mapStatusForDisplay = (status) => {
    if (!status) return 'Unknown';
    
    const statusMap = {
      'reported': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'reopened': 'Open',
      'closed': 'Resolved'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  // Get status styles (colors, icons) based on status
  const getStatusStyles = (status) => {
    const displayStatus = typeof status === 'string' ? status : getDisplayStatus();
    
    const styles = {
      'Open': {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <span className="mr-1">🔴</span>
      },
      'In Progress': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <span className="mr-1">🟡</span>
      },
      'Resolved': {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <span className="mr-1">🟢</span>
      }
    };
    
    return styles[displayStatus] || styles['Open'];
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    const priorities = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Critical'
    };
    
    return priorities[priority] || 'Not set';
  };

  // Handle upvote click
  const handleUpvote = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/issues/${id}` } });
      return;
    }
    
    try {
      await upvoteIssue(id);
      
      // Optimistic update
      if (upvoted) {
        setUpvotes(prev => prev - 1);
      } else {
        setUpvotes(prev => prev + 1);
      }
      
      setUpvoted(!upvoted);
      
      // Refresh to get the actual server state after a delay
      setTimeout(() => {
        fetchIssueDetails();
      }, 500);
    } catch (err) {
      console.error('Error upvoting issue:', err);
    }
  };

  // Ultra-simple status update function
  const handleStatusUpdate = async (newStatus, comment) => {
    try {
      // Map frontend display names to backend status codes
      const statusMap = {
        'Open': 'reported',
        'In Progress': 'in_progress',
        'Resolved': 'resolved'
      };
      
      // The backend status value
      const backendStatus = statusMap[newStatus];
      if (!backendStatus) {
        console.error('Invalid status:', newStatus);
        return false;
      }
      
      // Create a minimal payload that exactly matches what the backend expects
      const payload = {
        status: backendStatus,
        statusNote: comment || `Status updated to ${newStatus}`
      };
      
      console.log('Status update payload:', payload);
      
      // Make a direct fetch API call with the correct token key from localStorage
      const token = localStorage.getItem('userToken'); // This was the issue - wrong token key
      const response = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      const data = await response.json();
      console.log('Status update succeeded:', data);
      
      // Update the UI
      await fetchIssueDetails();
      
      return true;
    } catch (error) {
      console.error('Status update failed:', error);
      return false;
    }
  };

  // Handle verify and close issue
  const handleVerifyAndClose = async () => {
    if (!user || !issue) {
      setError('User or issue information missing');
      return;
    }
    
    // Only the reporter can verify and close
    if (issue.reportedBy && user._id !== issue.reportedBy._id) {
      setError('Only the issue reporter can verify and close this issue');
      setShowFeedbackModal(false);
      return;
    }
    
    try {
      setClosingIssue(true);
      
      // Add a delay to ensure state updates properly
      const result = await verifyAndCloseIssue(id, closeFeedback);
      console.log('Verification result:', result);
      
      // Close the modal first
      setShowFeedbackModal(false);
      
      // Use a more reliable direct navigation method
      window.location.href = '/issues';
      
      // No need for the navigate() call which seems to be failing
    } catch (error) {
      console.error('Failed to verify and close issue:', error);
      setClosingIssue(false);
      setShowFeedbackModal(false);
      setError(error.message || 'Failed to close issue. Please try again.');
    }
  };
  
  // Feedback Modal Component
  const FeedbackModal = () => {
    // Local state for modal errors
    const [modalError, setModalError] = useState(null);
    
    // Reset error when modal closes
    useEffect(() => {
      if (!showFeedbackModal) {
        setModalError(null);
      }
    }, [showFeedbackModal]);
    
    if (!showFeedbackModal) return null;
    
    // Safe close function
    const handleSafeClose = () => {
      if (closingIssue) return; // Prevent closing while processing
      setShowFeedbackModal(false);
      setCloseFeedback('');
      setModalError(null);
    };
    
    // Wrapper for verify and close with error handling
    const handleSafeVerifyAndClose = async () => {
      try {
        setModalError(null);
        await handleVerifyAndClose();
      } catch (err) {
        setModalError(err.message || 'An unexpected error occurred');
      }
    };
    
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-600">Verify & Close Issue</h3>
            {!closingIssue && (
              <button 
                onClick={handleSafeClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </div>
          
          {modalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              <FaExclamationCircle className="inline-block mr-2" />
              {modalError}
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            You're about to verify that this issue has been resolved and close it. The issue will be removed from the system.
            Would you like to provide any feedback?
          </p>
          
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Optional feedback about the resolution..."
            value={closeFeedback}
            onChange={(e) => setCloseFeedback(e.target.value)}
            disabled={closingIssue}
            maxLength={500}
          ></textarea>
          <div className="text-xs text-gray-500 mb-4">
            {closeFeedback.length}/500 characters
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSafeClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors duration-200"
              disabled={closingIssue}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSafeVerifyAndClose}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={closingIssue}
              type="button"
            >
              {closingIssue ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm & Close'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-blue-600 animate-pulse">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <div className="py-1">
              <FaExclamationCircle className="text-red-500 mr-3" />
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 inline-flex items-center px-3 py-1 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <FaExclamationCircle className="inline mr-2" />
          Issue not found. It may have been removed or you don't have permission to view it.
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaArrowLeft className="mr-2" /> Back to Issues
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 bg-gray-50">
        {/* Back button */}
        <div className="mb-6 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaArrowLeft className="mr-2" /> Back to Issues
          </button>
          
          <div className="text-sm text-gray-500">
            <span className="inline-flex items-center">
              <FaCalendarAlt className="mr-1" /> Last updated: {formatDate(issue.updatedAt || issue.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-blue-100"
            >
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-blue-700 mr-4 mb-2">{issue.title}</h1>
                  {(() => {
                    const displayStatus = getDisplayStatus();
                    const styles = getStatusStyles(displayStatus);
                    return (
                      <div className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${styles.bg} ${styles.text} shadow-sm`}>
                        {styles.icon}
                        {displayStatus}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap text-sm text-gray-600 mb-6">
                  <div className="mr-6 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-1 text-blue-500" />
                    {formatDate(issue.createdAt)}
                  </div>
                  <div className="mr-6 mb-2 flex items-center">
                    <FaUser className="mr-1 text-blue-500" />
                    {issue.reportedBy?.name || 'Anonymous'}
                  </div>
                  {issue.departmentAssigned && (
                    <div className="mr-6 mb-2 flex items-center">
                      <FaBuilding className="mr-1 text-blue-500" />
                      {issue.departmentAssigned}
                    </div>
                  )}
                  <div className="mr-6 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-1 text-blue-500" />
                    {issue.location?.address || 'Location not specified'}
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{issue.description}</p>
                </div>

                {issue.images && issue.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-3 flex items-center">
                      <FaCamera className="mr-2" /> Images
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {issue.images.map((image, index) => (
                        <div key={index} className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Issue ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={handleUpvote}
                    className={`flex items-center px-4 py-2 border rounded-md mr-4 transition-all duration-200 ${
                      upvoted
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaThumbsUp className={`mr-2 ${upvoted ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{upvotes}</span> <span>{upvotes === 1 ? 'Upvote' : 'Upvotes'}</span>
                  </button>
                  
                  {/* Verify and Close button - only shown to the issue reporter when issue is resolved */}
                  {user && issue.reportedBy && 
                  user._id === issue.reportedBy._id && 
                  issue.status === 'resolved' && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 shadow-sm"
                    >
                      <FaCheckCircle className="mr-2" />
                      Verify & Close Issue
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Discussion</h2>
                <CommentBox issueId={issue._id || issue.id} />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-blue-100"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Issue Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-blue-500">Category</h3>
                    <p className="mt-1 text-sm text-blue-800">
                      {issue.category ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-blue-500">Priority</h3>
                    <p className="mt-1 text-sm text-blue-800">{getPriorityLabel(issue.priority)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-blue-500">City</h3>
                    <p className="mt-1 text-sm text-blue-800">{issue.city?.name || issue.city || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-blue-500">Reported On</h3>
                    <p className="mt-1 text-sm text-blue-800">{formatDate(issue.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-blue-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-blue-800">{formatDate(issue.updatedAt || issue.createdAt)}</p>
                  </div>
                  
                  {issue.location && issue.location.coordinates && (
                    <div>
                      <h3 className="text-sm font-medium text-blue-500">Coordinates</h3>
                      <p className="mt-1 text-sm text-blue-800">
                        {issue.location.coordinates[1]}, {issue.location.coordinates[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Department Actions */}
            {user && (user.role === 'department' || user.role === 'admin') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4 border border-blue-100"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                    <FaBuilding className="mr-2" /> Department Actions
                  </h2>
                  
                  {(() => {
                    const styles = getStatusStyles(issue.status);
                    return (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex items-center">
                        <div className={`w-10 h-10 rounded-full ${styles.bg} flex items-center justify-center mr-4 shadow-sm`}>
                          {styles.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Status</p>
                          <p className={`font-semibold ${styles.text}`}>{mapStatusForDisplay(issue.status) || 'Not Set'}</p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="p-4 bg-blue-50 rounded-lg mb-6 border-l-4 border-blue-500">
                    <div className="flex items-start">
                      <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-700">As a department representative, you can update this issue's status below.</p>
                        <p className="text-xs text-blue-600 mt-1">Status changes will be recorded and applied immediately.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-blue-600">Update Status</h3>
                    </div>
                    <div className="p-4">
                      <StatusUpdater 
                        issueId={issue._id || issue.id}
                        currentStatus={issue.status} 
                        onStatusUpdate={handleStatusUpdate} 
                        allowedStatuses={['Open', 'In Progress', 'Resolved']} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal />
    </>
  );
};

export default IssueDetails;
