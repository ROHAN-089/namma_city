import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reverseGeocode } from '../../utils/geocoding';

const IssueCard = ({ issue }) => {
  const { user } = useAuth();

  // Function to handle upvoting an issue
  const handleUpvote = async () => {
    try {
      // API call to upvote the issue would go here
      console.log(`Upvoted issue ${issue.id}`);
    } catch (error) {
      console.error('Error upvoting issue:', error);
    }
  };

  // Get appropriate status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-800 text-white';
      case 'reopened':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format category for display
  const formatCategory = (category) => {
    switch (category) {
      case 'roads':
        return 'Roads';
      case 'water':
        return 'Water Supply';
      case 'electricity':
        return 'Electricity';
      case 'sanitation':
        return 'Sanitation';
      case 'public_safety':
        return 'Public Safety';
      case 'public_transport':
        return 'Public Transport';
      case 'pollution':
        return 'Pollution';
      case 'others':
        return 'Others';
      default:
        return category;
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'reported':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      case 'reopened':
        return 'Reopened';
      default:
        return status;
    }
  };

  // Ensure issue.upvotes is treated as an array
  const upvotes = Array.isArray(issue.upvotes) ? issue.upvotes : [];
  const [locationName, setLocationName] = useState('');

  // Fetch location name when component mounts or location changes
  useEffect(() => {
    const fetchLocationName = async () => {
      if (issue.location?.type === 'Point' && Array.isArray(issue.location.coordinates)) {
        const [lng, lat] = issue.location.coordinates;
        try {
          const name = await reverseGeocode(lat, lng);
          if (name) setLocationName(name);
        } catch (error) {
          console.error('Error fetching location name:', error);
        }
      }
    };

    fetchLocationName();
  }, [issue.location]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
            <Link to={`/issues/${issue._id}`}>{issue.title}</Link>
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
            {formatStatus(issue.status)}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="mr-3">{formatCategory(issue.category)}</span>
          <span>Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

        {issue.imageUrl && (
          <div className="mb-4">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              disabled={!user || upvotes.includes(user._id)}
              className={`flex items-center space-x-1 text-sm ${!user || upvotes.includes(user._id) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>{upvotes.length || 0} Upvotes</span>
            </button>

            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>0 Comments</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Priority: {issue.priority}</span>
            </div>
          </div>
        </div>
      </div>

      {issue.location && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {(() => {
                // Handle different location formats
                if (!issue.location) return 'Location not specified';

                // If location is a string, return it directly
                if (typeof issue.location === 'string') return issue.location;

                // Handle GeoJSON point format
                if (issue.location.type === 'Point' && Array.isArray(issue.location.coordinates)) {
                  const [lng, lat] = issue.location.coordinates;
                  const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                  return (
                    <span className="flex flex-col">
                      {locationName && <span className="font-medium">{locationName}</span>}
                      <span className="text-xs opacity-75">📍 {coords}</span>
                    </span>
                  );
                }


                // Handle object with address property
                if (issue.location.address) {
                  return issue.location.address;
                }

                // Fallback for any other format
                return 'Location available';
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
