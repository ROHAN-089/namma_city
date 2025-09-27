import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaTimesCircle,
  FaCheckCircle,
  FaArrowUp
} from 'react-icons/fa';

const SLATimer = ({ 
  issue, 
  showProgress = true, 
  showEscalation = true, 
  compact = false,
  onEscalationChange 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progress, setProgress] = useState(0);
  const [escalationLevel, setEscalationLevel] = useState(0);

  // Calculate SLA metrics
  const calculateSLAMetrics = () => {
    if (!issue?.slaDeadline || !issue?.createdAt) return;

    const now = new Date();
    const created = new Date(issue.createdAt);
    const deadline = new Date(issue.slaDeadline);
    
    const totalTime = deadline - created;
    const elapsedTime = now - created;
    const remaining = deadline - now;
    
    const progressPercent = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
    
    // Determine escalation level
    let level = 0;
    if (progressPercent >= 100) level = 3; // SLA breached
    else if (progressPercent >= 80) level = 2; // Urgent
    else if (progressPercent >= 50) level = 1; // Warning
    
    setProgress(progressPercent);
    setEscalationLevel(level);
    setTimeRemaining(remaining > 0 ? remaining : 0);
  };

  // Update timer every minute
  useEffect(() => {
    calculateSLAMetrics();
    
    const interval = setInterval(() => {
      calculateSLAMetrics();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [issue]);

  // Format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'SLA Breached';
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get escalation level info
  const getEscalationInfo = (level) => {
    const levels = {
      0: { 
        label: 'On Track', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: FaCheckCircle,
        description: 'Issue is progressing normally'
      },
      1: { 
        label: 'Warning', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        icon: FaExclamationTriangle,
        description: 'SLA deadline approaching'
      },
      2: { 
        label: 'Urgent', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        icon: FaExclamationCircle,
        description: 'SLA deadline very close'
      },
      3: { 
        label: 'Breached', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: FaTimesCircle,
        description: 'SLA deadline has passed'
      }
    };
    
    return levels[level] || levels[0];
  };

  // Get progress bar color based on escalation level
  const getProgressBarColor = (level) => {
    const colors = {
      0: 'bg-green-500',
      1: 'bg-yellow-500',
      2: 'bg-orange-500',
      3: 'bg-red-500'
    };
    return colors[level] || colors[0];
  };

  const escalationInfo = getEscalationInfo(escalationLevel);
  const EscalationIcon = escalationInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${escalationInfo.bgColor} ${escalationInfo.color}`}>
          <EscalationIcon className="w-3 h-3" />
          <span>{escalationInfo.label}</span>
        </div>
        <span className="text-xs text-gray-600">
          {formatTimeRemaining(timeRemaining)}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaClock className="text-gray-500" />
          <h3 className="font-medium text-gray-800">SLA Status</h3>
        </div>
        
        {showEscalation && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${escalationInfo.bgColor} ${escalationInfo.color}`}>
            <EscalationIcon className="w-3 h-3" />
            <span>{escalationInfo.label}</span>
            {escalationLevel > 0 && (
              <FaArrowUp className="w-2 h-2" />
            )}
          </div>
        )}
      </div>

      {/* Time Remaining */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Time Remaining</span>
          <span className={`text-sm font-medium ${escalationInfo.color}`}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getProgressBarColor(escalationLevel)}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Progress Percentage */}
      {showProgress && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>SLA Progress</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
      )}

      {/* Escalation Description */}
      {showEscalation && escalationLevel > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600"
        >
          {escalationInfo.description}
        </motion.div>
      )}

      {/* SLA Deadline */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>SLA Deadline</span>
          <span>
            {issue?.slaDeadline ? 
              new Date(issue.slaDeadline).toLocaleDateString() : 
              'Not set'
            }
          </span>
        </div>
      </div>

      {/* Escalation History */}
      {showEscalation && issue?.escalationHistory && issue.escalationHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Escalation History</div>
          <div className="space-y-1">
            {issue.escalationHistory.slice(-3).map((escalation, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Level {escalation.level} - {escalation.reason}
                </span>
                <span className="text-gray-400">
                  {new Date(escalation.escalatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SLATimer;
