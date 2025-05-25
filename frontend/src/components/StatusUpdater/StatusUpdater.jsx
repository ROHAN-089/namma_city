import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const StatusUpdater = ({ issueId, currentStatus, onStatusUpdate, allowedStatuses }) => {
  // Convert backend status to our display status if needed
  const getDisplayStatus = (backendStatus) => {
    const statusMap = {
      'reported': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'reopened': 'Open',
      'closed': 'Resolved'
    };
    return statusMap[backendStatus] || 'Open';
  };
  
  const displayStatus = currentStatus && currentStatus.includes('_') 
    ? getDisplayStatus(currentStatus) 
    : (currentStatus || 'Open');
    
  const [status, setStatus] = useState(displayStatus);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();

  // Always use just these three statuses - these are the only ones we want to support
  const statusOptions = [
    { value: 'Open', label: 'Open', color: 'text-red-500', icon: '🔴' },
    { value: 'In Progress', label: 'In Progress', color: 'text-yellow-500', icon: '🟡' },
    { value: 'Resolved', label: 'Resolved', color: 'text-green-500', icon: '🟢' }
  ];

  const getStatusColorClass = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.color : 'text-gray-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'department') {
      setError('Only department officials can update issue status');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess(false);

      // Prepare update data
      const updateData = {
        issueId,
        status,
        comment: comment.trim() || `Status updated to: ${status}`,
        updatedBy: user.id,
        departmentId: user.departmentId,
        updatedAt: new Date().toISOString()
      };

          // Call the callback function if provided - directly, no simulation
      if (onStatusUpdate) {
        try {
          // Log the exact data we're sending
          console.log(`StatusUpdater: Updating status to ${status}`);
          console.log('StatusUpdater: Comment:', comment.trim() || `Status updated to: ${status}`);
          
          // Call the parent component's update function
          const result = await onStatusUpdate(status, comment.trim() || `Status updated to: ${status}`);
          
          // Check if the update was successful
          if (result === false) {
            setError('Failed to update status. Server returned an error.');
            setIsSubmitting(false);
            return;
          }
          
          // Update UI to show success
          setIsSubmitting(false);
          setSuccess(true);
          setComment('');
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        } catch (error) {
          console.error('Error in status update:', error);
          setError(error.message || 'Failed to update status. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
        setError('Status update callback not provided');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to update status. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'department') {
    return null; // Don't show this component for non-department users
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Update Issue Status</h3>
      
      {error && (
        <div className="flex items-center bg-red-50 text-red-700 p-3 rounded mb-3">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center bg-green-50 text-green-700 p-3 rounded mb-3">
          <FaCheckCircle className="mr-2" />
          <span>Status updated successfully!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
          >
            {statusOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className={option.color}
              >
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add details about this status update..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-center justify-end">
          <span className={`mr-2 ${getStatusColorClass(status)}`}>
            New status: {status}
          </span>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            disabled={isSubmitting || currentStatus === status}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdater;
