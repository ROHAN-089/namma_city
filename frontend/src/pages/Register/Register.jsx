import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import DepartmentRegisterForm from '../../components/DepartmentRegisterForm/DepartmentRegisterForm';
import { motion } from 'framer-motion';
import { FaUser, FaBuilding } from 'react-icons/fa';

const Register = () => {
  const { user } = useAuth();
  const [registrationType, setRegistrationType] = useState('citizen');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
          <p className="text-gray-600 mt-2">
            Join City Reporter to help improve infrastructure in your community
          </p>
        </div>
        
        {/* Registration Type Selector */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-center">
            <button
              className={`flex items-center px-6 py-3 rounded-l-md mr-10 ${
                registrationType === 'citizen'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setRegistrationType('citizen')}
            >
              <FaUser className="mr-2" />
              <span>Citizen</span>
            </button>
            <button
              className={`flex items-center px-6 py-3 rounded-r-md ${
                registrationType === 'department'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setRegistrationType('department')}
            >
              <FaBuilding className="mr-2" />
              <span>Municipal Department</span>
            </button>
          </div>
        </div>
        
        {registrationType === 'citizen' ? (
          <RegisterForm />
        ) : (
          <DepartmentRegisterForm />
        )}
      </motion.div>
    </div>
  );
};

export default Register;
