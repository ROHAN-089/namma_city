import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaCity, FaUsers, FaPhone, FaEnvelope, FaKey, FaIdCard } from 'react-icons/fa';

const DepartmentRegisterForm = () => {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentType: 'roads', // Default department type
    city: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    jurisdiction: '',
  });
  
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load available cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Get cities from the backend API
        const response = await fetch('http://localhost:5001/api/cities');
        const data = await response.json();
        
        if (response.ok) {
          setCities(data);
        } else {
          console.error('Error fetching cities:', data.message);
          // Fallback to mock data if API fails
          setCities([
            { _id: '1', name: 'Mumbai', state: 'Maharashtra' },
            { _id: '2', name: 'Delhi', state: 'Delhi' },
            { _id: '3', name: 'Bangalore', state: 'Karnataka' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        // Fallback to mock data if API fails
        setCities([
          { _id: '1', name: 'Mumbai', state: 'Maharashtra' },
          { _id: '2', name: 'Delhi', state: 'Delhi' },
          { _id: '3', name: 'Bangalore', state: 'Karnataka' },
        ]);
      }
    };
    
    fetchCities();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.departmentName.trim()) {
      setError('Please provide a department name');
      return false;
    }

    if (!formData.city) {
      setError('Please select a city');
      return false;
    }

    if (!formData.contactPerson.trim()) {
      setError('Please provide a contact person name');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please provide an email address');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Please provide a phone number');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const departmentData = {
        name: formData.departmentName, // Match the backend field names
        departmentType: formData.departmentType,
        city: formData.city,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phone, // Match the backend field name
        email: formData.email,
        password: formData.password,
        jurisdiction: formData.jurisdiction,
        role: 'department'
      };
      
      // Register the department user
      const result = await register(departmentData);
      
      if (result.success) {
        setSuccess(true);
        
        // Redirect to department dashboard after 2 seconds
        setTimeout(() => {
          navigate('/department/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to register department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register Municipal Department</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Department registered successfully! Redirecting to dashboard...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="departmentName" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaBuilding className="mr-2" />
              Department Name*
            </label>
            <input
              id="departmentName"
              name="departmentName"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Public Works Department"
              value={formData.departmentName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="departmentType" className="block text-gray-700 text-sm font-medium mb-2">
              Department Type*
            </label>
            <select
              id="departmentType"
              name="departmentType"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.departmentType}
              onChange={handleChange}
              required
            >
              <option value="roads">Roads</option>
              <option value="water">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
              <option value="parks">Parks & Recreation</option>
              <option value="transport">Public Transport</option>
              <option value="health">Health Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="city" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaCity className="mr-2" />
              City*
            </label>
            <select
              id="city"
              name="city"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.city}
              onChange={handleChange}
              required
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name}{city.state ? `, ${city.state}` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="contactPerson" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaUsers className="mr-2" />
              Contact Person*
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full name of contact person"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaPhone className="mr-2" />
              Phone Number*
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., +91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaEnvelope className="mr-2" />
              Email Address*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="department@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaKey className="mr-2" />
              Password*
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password*
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="jurisdiction" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaIdCard className="mr-2" />
              Jurisdiction (Optional)
            </label>
            <textarea
              id="jurisdiction"
              name="jurisdiction"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the jurisdiction or areas covered by your department..."
              value={formData.jurisdiction}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Department...' : 'Register Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentRegisterForm;
