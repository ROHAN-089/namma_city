import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createIssue } from '../../services/issueService';
import { indianCities } from '../../data/indianCities';
import { toast } from 'react-toastify';
import { FaLocationArrow, FaMapMarkerAlt } from 'react-icons/fa';

const IssueForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'roads', // Default category
    priority: 'medium', // Default priority
    city: '',
    location: {
      type: 'Point',
      address: '',
      coordinates: [0, 0]
    },
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const cities = indianCities;

  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    const invalidFiles = files.filter(file => {
      // Check type
      if (!validTypes.includes(file.type)) return true;

      // Check size (max 5MB)
      if (file.size > 5 * 1024 * 1024) return true;

      return false;
    });

    if (invalidFiles.length > 0) {
      setError('Some files are invalid. Please use JPG, JPEG, PNG, or WebP images under 5MB.');
      return;
    }

    // Create a preview URL for the first image
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }

    // Update form data with all image files
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    setError('');
  };

  // Get current location using browser's geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.info('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Immediately set coordinates to avoid delays
        const basicAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
            address: basicAddress
          }
        }));

        toast.success('Location captured successfully');

        // Try to enhance with actual address in the background
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { signal: controller.signal }
        )
          .then(response => response.json())
          .then(data => {
            clearTimeout(timeoutId);
            if (data && data.display_name) {
              setFormData(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  address: data.display_name
                }
              }));
              toast.info('Address details enhanced');
            }
          })
          .catch(err => {
            clearTimeout(timeoutId);
            console.log('Could not get detailed address, using coordinates instead:', err);
            // We already have the coordinates set, so no need to handle the error
          });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Please enable location services and try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Set default city on component mount
  useEffect(() => {
    if (user?.city) {
      // If user has a city in their profile, try to find a matching city
      // Check if user.city is an object (with name property) or a string
      const cityName = typeof user.city === 'string' ? user.city : (user.city.name || '');
      
      if (cityName) {
        const userCity = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (userCity) {
          setFormData(prev => ({
            ...prev,
            city: userCity.name
          }));
        }
      }
    } else if (cities.length > 0) {
      // Default to first city if no user city is set
      setFormData(prev => ({
        ...prev,
        city: cities[0].name
      }));
    }
  }, [user, cities]);

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please provide a title for the issue');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of the issue');
      return false;
    }

    if (!formData.category) {
      setError('Please select a category');
      return false;
    }

    if (!formData.location.coordinates || !formData.location.coordinates[0] || !formData.location.coordinates[1]) {
      setError('Please specify the location of the issue');
      return false;
    }

    if (!formData.city) {
      setError('Please select a city');
      return false;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image of the issue');
      return false;
    }

    // Clear any previous errors
    setError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Format the data for submission
      const issueData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        // Find the complete city object from the cities array
        city: cities.find(city => city.name === formData.city) || { name: formData.city },
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1])
          ],
          address: formData.location.address
        },
        images: formData.images
      };
      
      console.log('Issue with city data:', issueData.city);

      // Call API to create the issue
      const result = await createIssue(issueData);

      // Show success message
      toast.success('Issue reported successfully!');
      setSuccess(true);

      // Reset form or redirect
      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            from: 'report-issue',
            issueId: result._id
          }
        });
      }, 1500);

    } catch (error) {
      console.error('Error submitting issue:', error);
      let errorMessage = 'Failed to report issue. Please try again.';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report a New Issue</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Issue reported successfully! Redirecting to dashboard...
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
                Issue Title*
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Broken streetlight on Main Street"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                Issue Description*
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide details of the issue..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 text-sm font-medium mb-2">
                Category*
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="roads">Roads</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="public_safety">Public Safety</option>
                <option value="public_transport">Public Transport</option>
                <option value="pollution">Pollution</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2">
                City*
              </label>
              <div className="relative">
                <select
                  id="city"
                  name="city"
                  className="w-full px-4 py-2.5 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-colors text-gray-700"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="" className="text-gray-500">Select a City</option>
                  {cities.map((city, index) => (
                    <option
                      key={`${city.name}-${city.state}-${index}`}
                      value={city.name}
                      className="py-2 px-4 text-gray-700 hover:bg-gray-100"
                    >
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="images" className="block text-gray-700 text-sm font-medium mb-2">
                Upload Images* (Max 5 images, 5MB each)
              </label>
              <input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="w-full max-h-48 object-cover rounded-md"
                  />
                  {formData.images.length > 1 && (
                    <p className="text-sm text-gray-600 mt-1">
                      +{formData.images.length - 1} more {formData.images.length === 2 ? 'image' : 'images'}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-2 mt-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Location*
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaLocationArrow className="mr-2" />
                  Use My Current Location
                </button>

                {formData.location.address && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Selected Location</p>
                        <p className="text-sm text-gray-600 break-words">
                          {formData.location.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {formData.location.coordinates[1].toFixed(6)}, {formData.location.coordinates[0].toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Your location will be used to help authorities locate the issue.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Issue Report'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default IssueForm;
