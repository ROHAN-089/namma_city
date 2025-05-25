import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusUpdater from '../../components/StatusUpdater/StatusUpdater';
import CommentBox from '../../components/CommentBox/CommentBox';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaBuilding, FaArrowLeft, FaExclamationCircle, FaThumbsUp, FaCamera, FaInfoCircle } from 'react-icons/fa';

const IssueDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);

  // Fetch issue data
  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // const response = await axios.get(`/api/issues/${id}`);
        
        // Mock data for demo
        setTimeout(() => {
          const mockIssue = {
            id,
            title: 'Large pothole on Main Street',
            description: 'There is a large pothole in the middle of Main Street near the intersection with Oak Avenue. It has been there for weeks and is growing larger. It has already caused damage to several vehicles. The road is heavily used and this pothole poses a significant safety risk, especially at night when it\'s harder to see.',
            category: 'pothole',
            status: 'In Progress',
            priority: 8,
            location: 'Main Street & Oak Avenue, Mumbai',
            locationCoords: { lat: 19.076, lng: 72.877 },
            imageUrl: 'https://source.unsplash.com/random/800x600/?pothole',
            createdAt: '2023-04-12T10:30:00Z',
            updatedAt: '2023-04-14T14:20:00Z',
            reportedBy: 'Rahul Sharma',
            userId: '101',
            upvotes: 24,
            departmentAssigned: 'Roads Department',
            departmentId: '201',
            city: 'Mumbai',
            statusHistory: [
              {
                status: 'Open',
                timestamp: '2023-04-12T10:30:00Z',
                comment: 'Issue reported'
              },
              {
                status: 'In Progress',
                timestamp: '2023-04-14T14:20:00Z',
                comment: 'Maintenance team assigned to fix the pothole'
              }
            ]
          };
          
          setIssue(mockIssue);
          setUpvotes(mockIssue.upvotes);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching issue details:', err);
        setError('Failed to load issue details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchIssueDetails();
  }, [id]);

  // Handle upvote
  const handleUpvote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // TODO: Replace with actual API call
      // await axios.post(`/api/issues/${id}/upvote`);
      
      // Optimistic update
      if (upvoted) {
        setUpvotes(prev => prev - 1);
      } else {
        setUpvotes(prev => prev + 1);
      }
      setUpvoted(!upvoted);
      
    } catch (err) {
      console.error('Error upvoting issue:', err);
    }
  };

  // Handle status update
  const handleStatusUpdate = (newStatus, comment) => {
    setIssue(prev => ({
      ...prev,
      status: newStatus,
      statusHistory: [
        ...prev.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          comment
        }
      ]
    }));
  };

  // Get appropriate status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-purple-100 text-purple-800';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <FaExclamationCircle className="mx-auto h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Issue not found</h2>
        <p className="mt-2 text-gray-600">The issue you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-block"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Issue Header */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">{issue.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                {issue.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2" />
                Reported on {formatDate(issue.createdAt)}
              </div>
              <div className="flex items-center text-gray-600">
                <FaUser className="mr-2" />
                Reported by {issue.reportedBy}
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                {issue.location}
              </div>
              <div className="flex items-center text-gray-600">
                <FaBuilding className="mr-2" />
                {issue.departmentAssigned || 'Not assigned yet'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Priority: {issue.priority}/10
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Category: {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
              </div>
              <button
                onClick={handleUpvote}
                disabled={!user}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  upvoted
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <FaThumbsUp />
                <span>{upvotes} Upvotes</span>
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-gray-700 whitespace-pre-line">{issue.description}</p>
            </div>
            
            {issue.imageUrl && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <FaCamera className="text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">Issue Image</h3>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Status History */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Status History</h2>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {issue.statusHistory.map((item, index) => (
                  <div key={index} className="relative pl-10">
                    <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 z-10">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{formatDate(item.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-gray-700">{item.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Status Update Form (visible only for department users) */}
          {user && user.role === 'department' && (
            <div className="mb-6">
              <StatusUpdater
                issueId={issue.id}
                currentStatus={issue.status}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          )}
          
          {/* Comments Section */}
          <div>
            <CommentBox issueId={issue.id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IssueDetails;
