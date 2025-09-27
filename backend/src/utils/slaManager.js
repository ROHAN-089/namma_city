const Issue = require('../models/Issue');
const User = require('../models/User');

/**
 * SLA Manager - Handles SLA calculations, escalations, and notifications
 */

// SLA Configuration
const SLA_CONFIG = {
  URGENT: 24,    // 24 hours
  HIGH: 72,      // 3 days
  MEDIUM: 168,   // 7 days
  LOW: 336       // 14 days
};

// Escalation thresholds
const ESCALATION_THRESHOLDS = {
  WARNING: 50,   // 50% of SLA elapsed
  URGENT: 80,    // 80% of SLA elapsed
  BREACHED: 100  // SLA deadline passed
};

/**
 * Calculate SLA deadline based on priority
 * @param {string} priority - Issue priority
 * @param {Date} createdAt - Issue creation date
 * @returns {Date} SLA deadline
 */
const calculateSLADeadline = (priority, createdAt = new Date()) => {
  const hours = SLA_CONFIG[priority.toUpperCase()] || SLA_CONFIG.MEDIUM;
  return new Date(createdAt.getTime() + (hours * 60 * 60 * 1000));
};

/**
 * Calculate SLA progress percentage
 * @param {Date} createdAt - Issue creation date
 * @param {Date} slaDeadline - SLA deadline
 * @returns {number} Progress percentage (0-100)
 */
const calculateSLAProgress = (createdAt, slaDeadline) => {
  if (!createdAt || !slaDeadline) return 0;
  
  const totalTime = slaDeadline - createdAt;
  const elapsedTime = new Date() - createdAt;
  
  return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
};

/**
 * Get escalation level based on SLA progress
 * @param {number} progress - SLA progress percentage
 * @returns {number} Escalation level (0-3)
 */
const getEscalationLevel = (progress) => {
  if (progress >= ESCALATION_THRESHOLDS.BREACHED) return 3; // SLA breached
  if (progress >= ESCALATION_THRESHOLDS.URGENT) return 2;    // Urgent
  if (progress >= ESCALATION_THRESHOLDS.WARNING) return 1; // Warning
  return 0; // Normal
};

/**
 * Get time remaining until SLA deadline
 * @param {Date} slaDeadline - SLA deadline
 * @returns {number} Time remaining in milliseconds
 */
const getTimeRemaining = (slaDeadline) => {
  if (!slaDeadline) return null;
  
  const remaining = slaDeadline - new Date();
  return remaining > 0 ? remaining : 0;
};

/**
 * Format time remaining into human-readable string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
const formatTimeRemaining = (milliseconds) => {
  if (!milliseconds || milliseconds <= 0) return 'SLA Breached';
  
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Check and escalate issues that need escalation
 * @param {string} departmentId - Department ID to check issues for
 * @returns {Promise<Object>} Escalation results
 */
const checkAndEscalateIssues = async (departmentId = null) => {
  try {
    // Build query for issues that need escalation check
    const query = {
      status: { $in: ['reported', 'in_progress'] },
      lastEscalationCheck: { 
        $lt: new Date(Date.now() - 60 * 60 * 1000) // Check every hour
      }
    };
    
    // Add department filter if provided
    if (departmentId) {
      query.assignedTo = departmentId;
    }
    
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email department')
      .populate('city', 'name');
    
    const escalationResults = {
      totalChecked: issues.length,
      escalated: 0,
      breached: 0,
      warnings: 0,
      details: []
    };
    
    for (const issue of issues) {
      const progress = calculateSLAProgress(issue.createdAt, issue.slaDeadline);
      const newEscalationLevel = getEscalationLevel(progress);
      
      // Only escalate if level increased
      if (newEscalationLevel > issue.escalationLevel) {
        await issue.escalate(
          null, // System escalation
          `Auto-escalated due to SLA progress: ${progress.toFixed(1)}%`,
          'Automatic SLA escalation'
        );
        
        await issue.save();
        
        escalationResults.escalated++;
        
        if (newEscalationLevel === 3) {
          escalationResults.breached++;
        } else if (newEscalationLevel === 1) {
          escalationResults.warnings++;
        }
        
        escalationResults.details.push({
          issueId: issue._id,
          title: issue.title,
          oldLevel: issue.escalationLevel,
          newLevel: newEscalationLevel,
          progress: progress.toFixed(1),
          timeRemaining: formatTimeRemaining(getTimeRemaining(issue.slaDeadline))
        });
      }
    }
    
    return escalationResults;
  } catch (error) {
    console.error('Error in checkAndEscalateIssues:', error);
    throw error;
  }
};

/**
 * Get SLA statistics for a department
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} SLA statistics
 */
const getSLAStatistics = async (departmentId = null) => {
  try {
    const query = { status: { $in: ['reported', 'in_progress'] } };
    
    if (departmentId) {
      query.assignedTo = departmentId;
    }
    
    const issues = await Issue.find(query);
    
    const stats = {
      total: issues.length,
      onTime: 0,
      atRisk: 0,
      breached: 0,
      avgProgress: 0,
      escalationLevels: { 0: 0, 1: 0, 2: 0, 3: 0 }
    };
    
    let totalProgress = 0;
    
    for (const issue of issues) {
      const progress = calculateSLAProgress(issue.createdAt, issue.slaDeadline);
      const escalationLevel = getEscalationLevel(progress);
      
      totalProgress += progress;
      stats.escalationLevels[escalationLevel]++;
      
      if (escalationLevel === 3) {
        stats.breached++;
      } else if (escalationLevel >= 1) {
        stats.atRisk++;
      } else {
        stats.onTime++;
      }
    }
    
    stats.avgProgress = issues.length > 0 ? (totalProgress / issues.length) : 0;
    
    return stats;
  } catch (error) {
    console.error('Error in getSLAStatistics:', error);
    throw error;
  }
};

/**
 * Get overdue issues for a department
 * @param {string} departmentId - Department ID
 * @returns {Promise<Array>} List of overdue issues
 */
const getOverdueIssues = async (departmentId = null) => {
  try {
    const query = {
      status: { $in: ['reported', 'in_progress'] },
      slaDeadline: { $lt: new Date() }
    };
    
    if (departmentId) {
      query.assignedTo = departmentId;
    }
    
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email department')
      .populate('city', 'name')
      .sort({ slaDeadline: 1 }); // Sort by most overdue first
    
    return issues.map(issue => ({
      ...issue.toObject(),
      slaProgress: calculateSLAProgress(issue.createdAt, issue.slaDeadline),
      timeOverdue: new Date() - issue.slaDeadline,
      escalationLevel: getEscalationLevel(calculateSLAProgress(issue.createdAt, issue.slaDeadline))
    }));
  } catch (error) {
    console.error('Error in getOverdueIssues:', error);
    throw error;
  }
};

/**
 * Update SLA deadline when priority changes
 * @param {Object} issue - Issue object
 * @param {string} newPriority - New priority level
 * @returns {Date} New SLA deadline
 */
const updateSLADeadline = (issue, newPriority) => {
  const newDeadline = calculateSLADeadline(newPriority, issue.createdAt);
  
  // Reset escalation level when SLA deadline changes
  issue.escalationLevel = 0;
  issue.slaBreached = false;
  issue.lastEscalationCheck = new Date();
  
  return newDeadline;
};

module.exports = {
  SLA_CONFIG,
  ESCALATION_THRESHOLDS,
  calculateSLADeadline,
  calculateSLAProgress,
  getEscalationLevel,
  getTimeRemaining,
  formatTimeRemaining,
  checkAndEscalateIssues,
  getSLAStatistics,
  getOverdueIssues,
  updateSLADeadline
};
