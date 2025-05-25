import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IssueForm from '../../components/IssueForm/IssueForm';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const ReportIssue = () => {
  const { user, loading } = useAuth();
  
  // Show loading state
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
  
  // Redirect if user is not a citizen
  if (user.role !== 'citizen') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Report a New Issue</h1>
            <p className="text-gray-600 mt-2">
              Help improve your city by reporting infrastructure issues in your area
            </p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Please provide accurate information and location details to help
                  municipal departments address the issue efficiently. Photos help in better assessment.
                </p>
              </div>
            </div>
          </div>
          
          <IssueForm />
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIssue;
