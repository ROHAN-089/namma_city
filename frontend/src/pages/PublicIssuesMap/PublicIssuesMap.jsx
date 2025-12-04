import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import IssuesMap from '../../components/IssuesMap/IssuesMap';
import { getAllIssues } from '../../services/issueService';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaSync, FaFilter, FaEye } from 'react-icons/fa';

const PublicIssuesMap = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const navigate = useNavigate();

    // Fetch all public issues
    const fetchAllIssues = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await getAllIssues();
            const allIssues = response.data || response.issues || response || [];

            // Filter out issues without valid location data
            const validIssues = allIssues.filter(issue =>
                issue.location &&
                issue.location.coordinates &&
                issue.location.coordinates.length === 2 &&
                !isNaN(issue.location.coordinates[0]) &&
                !isNaN(issue.location.coordinates[1])
            );

            setIssues(validIssues);

            if (validIssues.length === 0) {
                toast.info('No issues with location data found');
            }

        } catch (error) {
            console.error('Error fetching issues:', error);
            toast.error('Failed to load issues. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllIssues();
    }, []);

    const handleIssueSelect = (issue) => {
        setSelectedIssue(issue);
        // Navigate to issue details page
        navigate(`/issues/${issue._id}`);
    };

    const getLocationCenter = () => {
        if (issues.length === 0) {
            return [20.5937, 78.9629]; // Default center of India
        }

        // Calculate center based on all issue locations
        const avgLat = issues.reduce((sum, issue) => sum + issue.location.coordinates[1], 0) / issues.length;
        const avgLng = issues.reduce((sum, issue) => sum + issue.location.coordinates[0], 0) / issues.length;

        return [avgLat, avgLng];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Loading Issues Map...</h2>
                    <p className="text-gray-500 mt-2">Fetching issue locations from the database</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <FaMapMarkerAlt className="mr-3 text-red-500" />
                                Public Issues Map
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Explore civic issues reported across your city on an interactive map
                            </p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    Showing {issues.length} issues with location data
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-4 md:mt-0">
                            <button
                                onClick={() => fetchAllIssues(true)}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors inline-flex items-center shadow-sm"
                                disabled={refreshing}
                            >
                                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Refreshing...' : 'Refresh Map'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Issues</p>
                                <p className="text-2xl font-semibold text-gray-900">{issues.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Urgent Issues</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {issues.filter(i => i.priority === 'urgent').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">In Progress</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {issues.filter(i => i.status === 'in_progress').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Resolved</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {issues.filter(i => i.status === 'resolved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Map */}
                {issues.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <IssuesMap
                            issues={issues}
                            onIssueSelect={handleIssueSelect}
                            selectedIssue={selectedIssue}
                            height="700px"
                            showControls={true}
                            center={getLocationCenter()}
                            zoom={10}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
                    >
                        <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            There are currently no issues with location data to display on the map.
                            Issues need to have valid coordinates to appear here.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => fetchAllIssues(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <FaSync className="mr-2" />
                                Refresh Map
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
                >
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaEye className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">How to use the map</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Click on any marker to view issue details in a popup</li>
                                    <li>Use the filters above the map to narrow down by category, priority, or status</li>
                                    <li>Different marker colors represent different issue categories</li>
                                    <li>Marker size indicates priority level (larger = higher priority)</li>
                                    <li>Zoom and pan to explore different areas of your city</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PublicIssuesMap;