import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './IssuesMap.css';
import { FaExclamationTriangle, FaMapMarkerAlt, FaClock, FaUser } from 'react-icons/fa';

// Fix for default marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons for different categories and priorities
const createCustomIcon = (category, priority) => {
    const colors = {
        roads: '#e74c3c',
        water: '#3498db',
        electricity: '#f1c40f',
        sanitation: '#27ae60',
        public_safety: '#e67e22',
        public_transport: '#9b59b6',
        pollution: '#34495e',
        others: '#95a5a6'
    };

    const prioritySize = {
        urgent: [35, 51],
        high: [30, 44],
        medium: [25, 41],
        low: [20, 32]
    };

    const color = colors[category] || colors.others;
    const size = prioritySize[priority] || prioritySize.medium;

    // Create a custom SVG icon
    const svgIcon = `
    <svg width="${size[0]}" height="${size[1]}" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.6 19.4 0 12.5 0z" 
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      <circle cx="12.5" cy="12.5" r="3" fill="${color}"/>
    </svg>
  `;

    return L.divIcon({
        html: svgIcon,
        className: 'custom-issue-marker',
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]],
        popupAnchor: [0, -size[1]]
    });
};

// Default icon setup
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to fit map bounds to all markers
const FitBounds = ({ issues }) => {
    const map = useMap();

    useEffect(() => {
        if (issues && issues.length > 0) {
            const validIssues = issues.filter(issue =>
                issue.location &&
                issue.location.coordinates &&
                issue.location.coordinates.length === 2 &&
                !isNaN(issue.location.coordinates[0]) &&
                !isNaN(issue.location.coordinates[1])
            );

            if (validIssues.length > 0) {
                const bounds = L.latLngBounds(
                    validIssues.map(issue => [
                        issue.location.coordinates[1], // latitude
                        issue.location.coordinates[0]  // longitude
                    ])
                );

                // Add some padding around the bounds
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    }, [issues, map]);

    return null;
};

const IssuesMap = ({
    issues = [],
    onIssueSelect = null,
    selectedIssue = null,
    height = "400px",
    showControls = true,
    center = [20.5937, 78.9629], // Default center of India
    zoom = 6
}) => {
    const [filteredIssues, setFilteredIssues] = useState(issues);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        let filtered = issues;

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(issue => issue.category === categoryFilter);
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter(issue => issue.priority === priorityFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(issue => issue.status === statusFilter);
        }

        setFilteredIssues(filtered);
    }, [issues, categoryFilter, priorityFilter, statusFilter]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'text-red-600 bg-red-50',
            high: 'text-orange-600 bg-orange-50',
            medium: 'text-yellow-600 bg-yellow-50',
            low: 'text-green-600 bg-green-50'
        };
        return colors[priority] || colors.medium;
    };

    const getStatusColor = (status) => {
        const colors = {
            reported: 'text-blue-600 bg-blue-50',
            in_progress: 'text-purple-600 bg-purple-50',
            resolved: 'text-green-600 bg-green-50',
            closed: 'text-gray-600 bg-gray-50',
            reopened: 'text-red-600 bg-red-50'
        };
        return colors[status] || colors.reported;
    };

    return (
        <div className="w-full">
            {/* Map Controls */}
            {showControls && (
                <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="roads">Roads</option>
                                <option value="water">Water</option>
                                <option value="electricity">Electricity</option>
                                <option value="sanitation">Sanitation</option>
                                <option value="public_safety">Public Safety</option>
                                <option value="public_transport">Public Transport</option>
                                <option value="pollution">Pollution</option>
                                <option value="others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="reported">Reported</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="reopened">Reopened</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> issues
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div className="rounded-lg overflow-hidden shadow-lg" style={{ height }}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    className="leaflet-container"
                >
                    {/* OpenStreetMap Tile Layer */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />

                    {/* Fit bounds to show all markers */}
                    <FitBounds issues={filteredIssues} />

                    {/* Issue Markers */}
                    {filteredIssues.map((issue) => {
                        // Skip issues without valid coordinates
                        if (!issue.location ||
                            !issue.location.coordinates ||
                            issue.location.coordinates.length !== 2 ||
                            isNaN(issue.location.coordinates[0]) ||
                            isNaN(issue.location.coordinates[1])) {
                            return null;
                        }

                        const position = [
                            issue.location.coordinates[1], // latitude
                            issue.location.coordinates[0]  // longitude
                        ];

                        return (
                            <Marker
                                key={issue._id}
                                position={position}
                                icon={createCustomIcon(issue.category, issue.priority)}
                                eventHandlers={{
                                    click: () => onIssueSelect && onIssueSelect(issue)
                                }}
                            >
                                <Popup maxWidth={300} className="custom-popup">
                                    <div className="p-2">
                                        {/* Issue Title */}
                                        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-tight">
                                            {issue.title}
                                        </h3>

                                        {/* Priority and Status Badges */}
                                        <div className="flex gap-2 mb-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                                                {issue.priority?.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                {issue.status?.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                            {issue.description?.length > 100
                                                ? `${issue.description.substring(0, 100)}...`
                                                : issue.description}
                                        </p>

                                        {/* Issue Details */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
                                                <span className="truncate">
                                                    {issue.location?.address || 'Location not specified'}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <FaUser className="w-4 h-4 mr-2 text-blue-500" />
                                                <span>
                                                    {issue.reportedBy?.name || issue.reporter?.name || 'Anonymous'}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <FaClock className="w-4 h-4 mr-2 text-green-500" />
                                                <span>{formatDate(issue.createdAt)}</span>
                                            </div>

                                            {/* AI Enhancement Badge */}
                                            {issue.aiProcessed && (
                                                <div className="flex items-center text-blue-600">
                                                    <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">
                                                        🤖 AI Enhanced
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        {onIssueSelect && (
                                            <button
                                                onClick={() => onIssueSelect(issue)}
                                                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Map Legend */}
            {showControls && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                    <h4 className="font-medium text-gray-800 mb-3">Map Legend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            <span>Roads</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                            <span>Water</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                            <span>Electricity</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                            <span>Sanitation</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                        * Marker size indicates priority: Larger = Higher Priority
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssuesMap;