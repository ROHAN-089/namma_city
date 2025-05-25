import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard/IssueCard';
import { motion } from 'framer-motion';
import { FaMapPin, FaCheckCircle, FaExclamationCircle, FaSpinner, FaPlus, FaSync } from 'react-icons/fa';
import { getUserIssues } from '../../services/issueService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [userIssues, setUserIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const location = useLocation();
  
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

  // Function to fetch user's reported issues
  const fetchUserIssues = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingIssues(true);
      }
      
      // Call the API to get the user's issues
      const response = await getUserIssues();
      const issues = response.issues || [];
      
      setUserIssues(issues);
      
      // Calculate stats
      setStats({
        total: issues.length,
        open: issues.filter(issue => issue.status === 'reported').length,
        inProgress: issues.filter(issue => issue.status === 'in_progress').length,
        resolved: issues.filter(issue => issue.status === 'resolved').length
      });
      
    } catch (err) {
      console.error('Error fetching user issues:', err);
      toast.error('Failed to load issues. Please try again.');
    } finally {
      setLoadingIssues(false);
      setRefreshing(false);
    }
  };
  
  // Fetch issues when component mounts
  useEffect(() => {
    if (user) {
      fetchUserIssues();
    }
  }, [user]);
  
  // Refresh issues when navigating back to the dashboard
  useEffect(() => {
    // If the user came back to dashboard (likely after reporting an issue)
    const justReturned = location.state?.from === 'report-issue';
    
    if (justReturned && user) {
      fetchUserIssues();
    }
  }, [location, user]);

  // Filter issues based on selected filter
  const filteredIssues = userIssues.filter(issue => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return issue.status === 'reported';
    if (activeFilter === 'inProgress') return issue.status === 'in_progress';
    if (activeFilter === 'resolved') return issue.status === 'resolved';
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user.role === 'citizen' ? 'My Dashboard' : 'Department Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'citizen' 
                ? 'Manage and track your reported issues'
                : 'Manage and track assigned issues for your department'}
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
              onClick={() => fetchUserIssues(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors inline-flex items-center"
              disabled={refreshing}
            >
              <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {user.role === 'citizen' && (
              <Link
                to="/report-issue"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                Report New Issue
              </Link>
            )}
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
            {loadingIssues ? (
              <div className="flex flex-col items-center p-4">
                <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
                <p className="text-gray-600">Loading your issues...</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
                  <p className="text-sm text-gray-600">Total Issues</p>
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <FaExclamationCircle className="text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.open}</h3>
                <p className="text-sm text-gray-600">Open Issues</p>
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
                <FaSpinner className="text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.inProgress}</h3>
                <p className="text-sm text-gray-600">In Progress</p>
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
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.resolved}</h3>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap">
            <button
              className={`px-4 py-2 rounded-md mr-2 mb-2 ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Issues
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 mb-2 ${
                activeFilter === 'open'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('open')}
            >
              Open
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 mb-2 ${
                activeFilter === 'inProgress'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('inProgress')}
            >
              In Progress
            </button>
            <button
              className={`px-4 py-2 rounded-md mb-2 ${
                activeFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>
        
        {/* Issues List */}
        <div>
          {loadingIssues ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeFilter === 'all' 
                  ? 'You haven\'t reported any issues yet.'
                  : `You don\'t have any ${activeFilter === 'resolved' ? 'resolved' : activeFilter === 'inProgress' ? 'in progress' : 'open'} issues.`}
              </p>
              {activeFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/report-issue"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Report New Issue
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {filteredIssues.map((issue) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IssueCard issue={issue} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
