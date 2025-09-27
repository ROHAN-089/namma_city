import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard/IssueCard';
import SLATimer from '../../components/SLATimer/SLATimer';
import { motion } from 'framer-motion';
import { 
  FaClipboardList, 
  FaExclamationCircle, 
  FaSpinner, 
  FaCheckCircle, 
  FaClock, 
  FaChartLine, 
  FaFilter,
  FaExclamationTriangle,
  FaTimesCircle,
  FaBell
} from 'react-icons/fa';
import { getDepartmentIssues } from '../../services/issueService';

const MunicipalityDashboard = () => {
  const { user, loading } = useAuth();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: '0 days'
  });
  const [slaStats, setSlaStats] = useState({
    onTime: 0,
    atRisk: 0,
    breached: 0,
    avgProgress: 0
  });
  const [overdueIssues, setOverdueIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  
  // Fetch issues assigned to this department
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      if (!user || user.role !== 'department') return;
      
      try {
        setLoadingIssues(true);
        
        // Fetch issues using the issueService
        const response = await getDepartmentIssues();
        console.log('Department issues response:', response);
        
        // Update state with real issue data
        if (response && response.issues) {
          setAssignedIssues(response.issues);
          
          // Calculate statistics
          const openIssues = response.issues.filter(issue => 
            issue.status && issue.status.toLowerCase() === 'open').length;
          const inProgressIssues = response.issues.filter(issue => 
            issue.status && issue.status.toLowerCase() === 'in progress').length;
          const resolvedIssues = response.issues.filter(issue => 
            issue.status && issue.status.toLowerCase() === 'resolved').length;
          
          setStats({
            total: response.total || response.issues.length,
            open: openIssues,
            inProgress: inProgressIssues,
            resolved: resolvedIssues,
            avgResolutionTime: '3.2 days' // This would need real calculation based on real data
          });

          // Calculate SLA statistics
          const calculateSLAStats = (issues) => {
            let onTime = 0, atRisk = 0, breached = 0, totalProgress = 0;
            const overdue = [];

            issues.forEach(issue => {
              if (!issue.slaDeadline || !issue.createdAt) return;

              const now = new Date();
              const created = new Date(issue.createdAt);
              const deadline = new Date(issue.slaDeadline);
              
              const totalTime = deadline - created;
              const elapsedTime = now - created;
              const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
              
              totalProgress += progress;

              if (progress >= 100) {
                breached++;
                overdue.push(issue);
              } else if (progress >= 50) {
                atRisk++;
              } else {
                onTime++;
              }
            });

            return {
              onTime,
              atRisk,
              breached,
              avgProgress: issues.length > 0 ? (totalProgress / issues.length) : 0,
              overdue
            };
          };

          const slaData = calculateSLAStats(response.issues);
          setSlaStats({
            onTime: slaData.onTime,
            atRisk: slaData.atRisk,
            breached: slaData.breached,
            avgProgress: slaData.avgProgress
          });
          setOverdueIssues(slaData.overdue);
        } else {
          console.error('No issues data returned from API');
          setAssignedIssues([]);
        }
      } catch (err) {
        console.error('Error fetching assigned issues:', err);
        setAssignedIssues([]);
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchAssignedIssues();
  }, [user]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect if user is not a department representative
  if (user.role !== 'department') {
    return <Navigate to="/dashboard" />;
  }

  // Filter and sort issues based on selected options
  const filteredAndSortedIssues = React.useMemo(() => {
    // First filter the issues
    let result = [...assignedIssues];

    if (activeFilter !== 'all') {
      // Handle SLA-based filters
      if (activeFilter.startsWith('sla-')) {
        result = result.filter(issue => {
          if (!issue.slaDeadline || !issue.createdAt) return false;
          
          const now = new Date();
          const created = new Date(issue.createdAt);
          const deadline = new Date(issue.slaDeadline);
          
          const totalTime = deadline - created;
          const elapsedTime = now - created;
          const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
          
          switch (activeFilter) {
            case 'sla-breached':
              return progress >= 100;
            case 'sla-at-risk':
              return progress >= 50 && progress < 100;
            case 'sla-on-time':
              return progress < 50;
            default:
              return true;
          }
        });
      } else {
        // Handle regular status filters
        result = result.filter(issue => 
          issue.status && issue.status.toLowerCase() === activeFilter.toLowerCase());
      }
    }

    // Then sort the filtered issues
    switch (sortBy) {
      case 'priority':
        result.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case 'upvotes':
        result.sort((a, b) => {
          const aUpvotes = a.upvotes && Array.isArray(a.upvotes) ? a.upvotes.length : 0;
          const bUpvotes = b.upvotes && Array.isArray(b.upvotes) ? b.upvotes.length : 0;
          return bUpvotes - aUpvotes;
        });
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'sla-deadline':
        result.sort((a, b) => {
          const aDeadline = a.slaDeadline ? new Date(a.slaDeadline) : new Date(0);
          const bDeadline = b.slaDeadline ? new Date(b.slaDeadline) : new Date(0);
          return aDeadline - bDeadline;
        });
        break;
      default:
        break;
    }

    return result;
  }, [assignedIssues, activeFilter, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Department Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage and resolve issues assigned to {user.name || user.department || 'your department'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaClipboardList />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Issues</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <FaExclamationCircle />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.open}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaSpinner />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.inProgress}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.resolved}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SLA Alerts Section */}
        {(slaStats.breached > 0 || slaStats.atRisk > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FaBell className="text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-800">SLA Alerts</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Avg Progress: {slaStats.avgProgress.toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* On Time */}
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">On Time</p>
                    <p className="text-lg font-bold text-green-800">{slaStats.onTime}</p>
                  </div>
                </div>

                {/* At Risk */}
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">At Risk</p>
                    <p className="text-lg font-bold text-yellow-800">{slaStats.atRisk}</p>
                  </div>
                </div>

                {/* Breached */}
                <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                    <FaTimesCircle />
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-medium">Breached</p>
                    <p className="text-lg font-bold text-red-800">{slaStats.breached}</p>
                  </div>
                </div>
              </div>

              {/* Overdue Issues */}
              {overdueIssues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Overdue Issues ({overdueIssues.length})
                  </h4>
                  <div className="space-y-2">
                    {overdueIssues.slice(0, 3).map((issue) => (
                      <div key={issue._id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center space-x-2">
                          <FaTimesCircle className="text-red-500 text-sm" />
                          <span className="text-sm text-gray-700">{issue.title}</span>
                        </div>
                        <SLATimer issue={issue} compact={true} />
                      </div>
                    ))}
                    {overdueIssues.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{overdueIssues.length - 3} more overdue issues
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4 md:mb-0">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <FaFilter className="mr-2" /> Filter by Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('open')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'open'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setActiveFilter('in progress')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'in progress'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveFilter('resolved')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'resolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
            </div>
            
            {/* SLA Filters */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2">SLA Status</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter('sla-breached')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeFilter === 'sla-breached'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaTimesCircle className="inline mr-1" />
                  Breached
                </button>
                <button
                  onClick={() => setActiveFilter('sla-at-risk')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeFilter === 'sla-at-risk'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaExclamationTriangle className="inline mr-1" />
                  At Risk
                </button>
                <button
                  onClick={() => setActiveFilter('sla-on-time')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeFilter === 'sla-on-time'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaCheckCircle className="inline mr-1" />
                  On Time
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <FaChartLine className="mr-2" /> Sort by
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Priority</option>
              <option value="upvotes">Upvotes</option>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="sla-deadline">SLA Deadline</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {loadingIssues ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAndSortedIssues.length > 0 ? (
            filteredAndSortedIssues.map((issue) => (
              <IssueCard 
                key={issue._id || issue.id} 
                issue={issue}
                showActions={true}
              />
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <FaClipboardList className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Issues Found</h3>
              <p className="text-gray-500">
                {activeFilter !== 'all'
                  ? `There are no ${activeFilter} issues at the moment.`
                  : 'There are no issues assigned to your department yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;
