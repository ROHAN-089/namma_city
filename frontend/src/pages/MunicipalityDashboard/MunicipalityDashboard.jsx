import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard/IssueCard';
import { motion } from 'framer-motion';
import { FaClipboardList, FaExclamationCircle, FaSpinner, FaCheckCircle, FaClock, FaChartLine, FaFilter } from 'react-icons/fa';

const MunicipalityDashboard = () => {
  const { user, loading } = useAuth();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

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

  // Fetch issues assigned to this department
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      try {
        setLoadingIssues(true);

        // TODO: Replace with actual API call
        // const response = await axios.get(`/api/departments/${user.departmentId}/issues`);

        // Mock data for demo
        setTimeout(() => {
          const mockIssues = [
            {
              id: '1',
              title: 'Large pothole on Main Street',
              description: 'There is a large pothole in the middle of Main Street near the intersection with Oak Avenue.',
              category: 'pothole',
              status: 'Open',
              priority: 8,
              location: 'Main Street & Oak Avenue, Mumbai',
              imageUrl: 'https://source.unsplash.com/random/800x600/?pothole',
              createdAt: '2023-04-12T10:30:00Z',
              reportedBy: 'Rahul Sharma',
              userId: '101',
              upvotes: 24,
              departmentAssigned: user.departmentName,
              departmentId: user.departmentId,
              city: 'Mumbai'
            },
            {
              id: '2',
              title: 'Road cracks causing accidents',
              description: 'Multiple cracks have formed on the road surface near the hospital entrance. Several two-wheeler accidents have been reported.',
              category: 'road',
              status: 'In Progress',
              priority: 9,
              location: 'Hospital Road, Mumbai',
              imageUrl: 'https://source.unsplash.com/random/800x600/?road+crack',
              createdAt: '2023-04-11T14:45:00Z',
              reportedBy: 'Priya Patel',
              userId: '102',
              upvotes: 31,
              departmentAssigned: user.departmentName,
              departmentId: user.departmentId,
              city: 'Mumbai'
            },
            {
              id: '3',
              title: 'Broken road divider',
              description: 'The concrete road divider is broken at several places, creating hazardous conditions for drivers.',
              category: 'road',
              status: 'In Progress',
              priority: 7,
              location: 'Ring Road, Mumbai',
              imageUrl: 'https://source.unsplash.com/random/800x600/?road+divider',
              createdAt: '2023-04-10T09:15:00Z',
              reportedBy: 'Amit Singh',
              userId: '103',
              upvotes: 18,
              departmentAssigned: user.departmentName,
              departmentId: user.departmentId,
              city: 'Mumbai'
            },
            {
              id: '4',
              title: 'Missing manhole cover',
              description: 'A manhole cover is missing near the bus stop, creating a dangerous situation for pedestrians.',
              category: 'road',
              status: 'Resolved',
              priority: 8,
              location: 'Market Road, Mumbai',
              imageUrl: 'https://source.unsplash.com/random/800x600/?manhole',
              createdAt: '2023-04-08T17:30:00Z',
              reportedBy: 'Sneha Gupta',
              userId: '104',
              upvotes: 27,
              departmentAssigned: user.departmentName,
              departmentId: user.departmentId,
              city: 'Mumbai'
            },
            {
              id: '5',
              title: 'Speed bump needed near school',
              description: 'Vehicles speeding near the school entrance are creating safety concerns for children. A speed bump is urgently needed.',
              category: 'road',
              status: 'Open',
              priority: 6,
              location: 'School Lane, Mumbai',
              imageUrl: 'https://source.unsplash.com/random/800x600/?speed+bump',
              createdAt: '2023-04-07T13:20:00Z',
              reportedBy: 'Vijay Kumar',
              userId: '105',
              upvotes: 15,
              departmentAssigned: user.departmentName,
              departmentId: user.departmentId,
              city: 'Mumbai'
            },
          ];

          setAssignedIssues(mockIssues);

          // Calculate stats
          setStats({
            total: mockIssues.length,
            open: mockIssues.filter(issue => issue.status === 'Open').length,
            inProgress: mockIssues.filter(issue => issue.status === 'In Progress').length,
            resolved: mockIssues.filter(issue => issue.status === 'Resolved').length,
            avgResolutionTime: '3.5 days' // Mock statistic
          });

          setLoadingIssues(false);
        }, 1000);

      } catch (err) {
        console.error('Error fetching assigned issues:', err);
        setLoadingIssues(false);
      }
    };

    if (user && user.departmentId) {
      fetchAssignedIssues();
    }
  }, [user]);

  // Filter and sort issues based on selected options
  const filteredAndSortedIssues = React.useMemo(() => {
    // First filter the issues
    let result = [...assignedIssues];

    if (activeFilter !== 'all') {
      result = result.filter(issue => issue.status.toLowerCase() === activeFilter);
    }

    // Then sort the filtered issues
    switch (sortBy) {
      case 'priority':
        result.sort((a, b) => b.priority - a.priority);
        break;
      case 'upvotes':
        result.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
              Manage and resolve issues assigned to {user.departmentName}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FaClock />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Resolution</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.avgResolutionTime}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Charts Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-gray-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Department Performance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Resolution Time Trend Chart</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Issues by Category Chart</p>
            </div>
          </div>
        </div>

        {/* Issue Management Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <FaClipboardList className="text-gray-700 mr-2 text-xl" />
            <h2 className="text-2xl font-semibold text-gray-800">Assigned Issues</h2>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <div className="flex items-center mb-4">
              <FaFilter className="text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-800">Filters & Sorting</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'open'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveFilter('open')}
                  >
                    Open
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'in progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveFilter('in progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveFilter('resolved')}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                <select
                  className="w-full px-4 py-2.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-colors text-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="priority" className="py-2 px-4 text-gray-700">Priority (Highest First)</option>
                  <option value="upvotes" className="py-2 px-4 text-gray-700">Most Upvoted</option>
                  <option value="latest" className="py-2 px-4 text-gray-700">Most Recent</option>
                  <option value="oldest" className="py-2 px-4 text-gray-700">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div>
            {loadingIssues ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAndSortedIssues.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a5 5 0 100-10 5 5 0 000 10z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No issues found</h3>
                <p className="mt-2 text-gray-600">
                  {activeFilter !== 'all'
                    ? `There are no ${activeFilter} issues at the moment`
                    : 'No issues have been assigned to your department yet'}
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="space-y-6"
              >
                {filteredAndSortedIssues.map((issue) => (
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
    </div>
  );
};

export default MunicipalityDashboard;
