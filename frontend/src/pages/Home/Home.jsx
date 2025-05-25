import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard/IssueCard';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaFilter, FaSearch, FaBuilding, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { getAllIssues } from '../../services/issueService';
import { indianCities } from '../../data/indianCities';
import { toast } from 'react-toastify';

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const { user } = useAuth();

  // Categories for filtering (matching backend schema)
  const categories = [
    { id: 'roads', name: 'Roads' },
    { id: 'water', name: 'Water Supply' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'sanitation', name: 'Sanitation' },
    { id: 'public_safety', name: 'Public Safety' },
    { id: 'public_transport', name: 'Public Transport' },
    { id: 'pollution', name: 'Pollution' },
    { id: 'others', name: 'Others' }
  ];

  // Set user's city as selected city when user logs in
  useEffect(() => {
    if (user && user.city && user.city.name) {
      setSelectedCity(user.city.name);
    }
  }, [user]);

  // Load issues and cities data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all issues from the backend without filtering by city
        // We'll filter on the client side based on selectedCity
        const issuesResponse = await getAllIssues();
        const fetchedIssues = issuesResponse.issues || [];
        
        console.log('Fetched issues:', fetchedIssues.length);

        const formattedIssues = fetchedIssues.map(issue => ({
          ...issue,
          id: issue._id || issue.id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          priority: issue.priority,
          location: issue.location,
          imageUrl: issue.images && issue.images.length > 0 ? issue.images[0] : null,
          createdAt: issue.createdAt,
          reportedBy: issue.reportedBy?.name || 'Anonymous',
          userId: issue.reportedBy?._id,
          upvotes: issue.upvotes || [],
          comments: issue.comments || [],
          departmentAssigned: issue.assignedToDepartment?.name || 'Unassigned',
          city: issue.city?.name || 'Unknown City'
        }));

        setIssues(formattedIssues);
        setFilteredIssues(formattedIssues);

        // Use the predefined Indian cities list
        setCities(indianCities.map((city, index) => ({
          id: index.toString(),
          name: city.name,
          state: city.state
        })));

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter and sort issues based on selected filters
  useEffect(() => {
    console.log('Filtering issues, total count:', issues.length);
    console.log('Selected city:', selectedCity);
    
    let result = [...issues];

    // Filter by city
    if (selectedCity) {
      result = result.filter(issue => {
        // Handle different city formats (string name or object with name property)
        const issueCity = typeof issue.city === 'string' ? issue.city : issue.city?.name;
        const matches = issueCity === selectedCity;
        return matches;
      });
      console.log('After city filtering:', result.length);
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(issue => issue.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(issue => {
        const titleMatch = issue.title?.toLowerCase().includes(query) || false;
        const descMatch = issue.description?.toLowerCase().includes(query) || false;

        // Handle location which can be GeoJSON object or string
        let locationMatch = false;
        if (typeof issue.location === 'string') {
          locationMatch = issue.location.toLowerCase().includes(query);
        } else if (issue.location && issue.location.address) {
          locationMatch = issue.location.address.toLowerCase().includes(query);
        }

        return titleMatch || descMatch || locationMatch;
      });
    }

    // Sort issues
    switch (sortBy) {
      case 'priority':
        result.sort((a, b) => b.priority - a.priority);
        break;
      case 'upvotes':
        // Handle upvotes as an array of user IDs from the backend
        result.sort((a, b) => {
          const aUpvotes = Array.isArray(a.upvotes) ? a.upvotes.length : 0;
          const bUpvotes = Array.isArray(b.upvotes) ? b.upvotes.length : 0;
          return bUpvotes - aUpvotes;
        });
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredIssues(result);
  }, [issues, selectedCity, selectedCategory, searchQuery, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedCity('');
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('latest');
    // Force a re-render by re-setting the filtered issues
    setFilteredIssues([...issues]);
    console.log('Filters reset, showing all issues:', issues.length);
  };

  return (
    <div className="bg-gray-50 w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* City Skyline SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 opacity-20">
          <svg viewBox="0 0 1440 120" className="w-full h-full">
            <path 
              d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,106.7C672,107,768,149,864,160C960,171,1056,149,1152,133.3C1248,117,1344,107,1392,101.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="currentColor" 
              className="text-blue-500"
            ></path>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Making Our <span className="text-blue-200">Cities</span> Better, Together
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
                Report local infrastructure issues and help municipal departments resolve them quickly and efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to={user ? "/report-issue" : "/login"}
                  className="px-8 py-4 bg-white text-blue-700 rounded-lg font-bold hover:bg-blue-50 transition-all transform hover:-translate-y-1 hover:shadow-lg"
                >
                  {user ? "Report an Issue" : "Get Started"}
                </Link>
                
                <a
                  href="#features"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:bg-opacity-10 transition-all transform hover:-translate-y-1 hover:shadow-lg inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#features').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </a>
              </div>
              
              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { number: '10K+', label: 'Issues Resolved' },
                  { number: '50+', label: 'Cities Served' },
                  { number: '24/7', label: 'Support' },
                  { number: '99%', label: 'Satisfaction' }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                    className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-xl"
                  >
                    <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Report, track, and resolve local issues in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                title: "Report an Issue",
                description: "Easily report infrastructure problems in your area with our simple form."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Department Review",
                description: "Local authorities review and prioritize the reported issues."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
                title: "Issue Resolved",
                description: "Get notified when the issue is resolved and verify the solution."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Issues</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through the latest issues reported in your city
          </p>
        </div>
        
        {user?.city?.name && (
          <div className="flex justify-center mb-8 gap-4">
            <button 
              onClick={() => {
                // First clear any existing filters
                setSelectedCategory('');
                setSearchQuery('');
                setSortBy('latest');
                
                // Then set the city filter
                setSelectedCity(user.city.name);
                
                // Manually filter the issues for emergency fix
                const cityIssues = issues.filter(issue => {
                  const issueCity = typeof issue.city === 'string' ? issue.city : issue.city?.name;
                  return issueCity === user.city.name;
                });
                
                console.log(`Filtered to ${cityIssues.length} issues in ${user.city.name}`);
                setFilteredIssues(cityIssues);
              }}
              className={`flex items-center px-6 py-3 rounded-lg shadow-sm transition-all ${selectedCity === user.city.name 
                ? 'bg-blue-600 text-white font-medium shadow-md'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'}`}
            >
              <FaMapMarkerAlt className="mr-2" /> 
              <span>Show Issues in {user.city.name}</span>
              {selectedCity === user.city.name && (
                <span className="ml-2 bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
            
            <button 
              onClick={() => {
                resetFilters();
                // Direct emergency fix to ensure issues are displayed
                setTimeout(() => {
                  if (issues.length > 0 && filteredIssues.length === 0) {
                    console.log('Emergency fix: Manually setting filtered issues');
                    setFilteredIssues([...issues]);
                  }
                }, 100);
              }}
              className={`flex items-center px-6 py-3 rounded-lg shadow-sm transition-all ${selectedCity === '' 
                ? 'bg-blue-600 text-white font-medium shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            >
              <FaBuilding className="mr-2" /> 
              <span>Show All Cities</span>
              {selectedCity === '' && (
                <span className="ml-2 bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              {/* Filter Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilter className="inline mr-2" />
                  Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                >
                  Reset All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search issues..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-gray-300 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Other filters can remain here */}

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  <div
                    className={`cursor-pointer p-2.5 rounded-lg transition-colors mb-1 ${selectedCategory === ''
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                      : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    onClick={() => setSelectedCategory('')}
                  >
                    All Categories
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`cursor-pointer p-2.5 rounded-lg transition-colors mb-1 ${selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="space-y-1">
                  {[
                    { id: 'latest', label: 'Latest', icon: '🕒' },
                    { id: 'oldest', label: 'Oldest', icon: '📅' },
                    { id: 'priority', label: 'Priority (Highest First)', icon: '⚡' },
                    { id: 'upvotes', label: 'Most Upvoted', icon: '👍' }
                  ].map((option) => (
                    <div
                      key={option.id}
                      className={`cursor-pointer p-2.5 rounded-lg transition-colors flex items-center ${sortBy === option.id
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      onClick={() => setSortBy(option.id)}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-100"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                  <FaExclamationCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No issues found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  We couldn't find any issues matching your criteria. Try adjusting your search or filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform connects citizens with municipal departments to solve infrastructure issues efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report Issues</h3>
              <p className="text-gray-600">
                Citizens can report infrastructure problems with details, photos, and exact location.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Classification</h3>
              <p className="text-gray-600">
                Our AI automatically classifies issues, assigns priority, and routes to the right department.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Resolve</h3>
              <p className="text-gray-600">
                Municipal departments update status as they work on issues. Citizens can track progress in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
