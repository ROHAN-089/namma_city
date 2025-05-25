import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaCity, FaUsers, FaPhone, FaEnvelope, FaKey, FaIdCard, FaFileUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { indianCities } from '../../data/indianCities';

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
  
  const [idProofFile, setIdProofFile] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [idProofError, setIdProofError] = useState('');
  
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load available cities
  useEffect(() => {
    // Map the indianCities data to include an _id property
    // This makes it compatible with how we're handling city data elsewhere
    const formattedCities = indianCities.map((city, index) => ({
      _id: index.toString(), // Use index as a string for the _id
      name: city.name,
      state: city.state,
      coordinates: {
        lat: city.lat,
        lng: city.lng
      }
    }));
    
    setCities(formattedCities);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle ID proof image upload
  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    setIdProofError('');
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setIdProofError('Please upload a valid file (JPEG, PNG, or PDF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setIdProofError('File size must be less than 5MB');
      return;
    }
    
    setIdProofFile(file);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setIdProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDF files, just show an icon or text
      setIdProofPreview('pdf');
    }
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
    
    if (!idProofFile) {
      setError('Please upload ID proof document');
      return false;
    }

    if (idProofError) {
      setError(idProofError);
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
      
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Add all department data
      formDataToSend.append('name', formData.departmentName);
      // Use departmentType as the department field that the backend expects
      formDataToSend.append('department', formData.departmentType);
      
      // Find the selected city data
      const selectedCity = cities.find(city => city._id === formData.city);
      if (selectedCity) {
        // Send the city name with state for better identification
        formDataToSend.append('city', `${selectedCity.name}, ${selectedCity.state}`);
      } else {
        formDataToSend.append('city', formData.city);
      }
      
      formDataToSend.append('contactPerson', formData.contactPerson);
      formDataToSend.append('phoneNumber', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('jurisdiction', formData.jurisdiction);
      formDataToSend.append('role', 'department');
      
      // Add the ID proof file with proper filename
      if (idProofFile) {
        console.log('Appending file:', idProofFile.name, idProofFile.type);
        formDataToSend.append('idProof', idProofFile, idProofFile.name);
      }
      
      // Register the department user with ID proof
      const result = await register(formDataToSend, true); // Second parameter indicates multipart/form-data
      
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
          
          {/* ID Proof Upload Section */}
          <div className="md:col-span-2 mt-4">
            <label htmlFor="idProof" className="text-gray-700 text-sm font-medium mb-2 flex items-center">
              <FaFileUpload className="mr-2" />
              ID Proof Document* (Government issued ID for verification)
            </label>
            
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="idProof"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${idProofError ? 'border-red-300' : 'border-gray-300'}`}
                >
                  {!idProofPreview ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaFileUpload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG or JPEG (Max 5MB)
                      </p>
                    </div>
                  ) : idProofPreview === 'pdf' ? (
                    <div className="flex flex-col items-center justify-center">
                      <FaCheckCircle className="w-10 h-10 text-green-500 mb-3" />
                      <p className="text-sm text-gray-500">PDF document uploaded</p>
                      <p className="text-xs text-gray-400 mt-1">{idProofFile.name}</p>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={idProofPreview}
                        alt="ID Proof"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Image uploaded
                      </div>
                    </div>
                  )}
                  <input
                    id="idProof"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleIdProofChange}
                  />
                </label>
              </div>
              {idProofError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaTimesCircle className="mr-1" />
                  {idProofError}
                </p>
              )}
              {idProofFile && !idProofError && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <FaCheckCircle className="mr-1" />
                  File uploaded successfully!
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Please upload a valid government-issued ID to verify your department's authenticity.
                This will be reviewed by our administrators before account approval.
              </p>
            </div>
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
