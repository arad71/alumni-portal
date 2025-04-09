import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

// Types
interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  price: number;
  capacity?: number;
  image_url?: string;
  is_members_only: boolean;
  registered_count?: number;
  is_registered?: boolean;
}

// Filter options
type EventCategory = 'all' | 'networking' | 'social' | 'academic' | 'career';
type EventTimeframe = 'all' | 'upcoming' | 'thisMonth' | 'nextMonth';

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<EventTimeframe>('upcoming');
  const [membersOnlyFilter, setMembersOnlyFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...events];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      // This is a mock implementation - in a real app, you'd filter by actual category
      // Assuming events have a 'category' field or you infer category from title/description
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(categoryFilter) || 
        event.description.toLowerCase().includes(categoryFilter)
      );
    }
    
    // Apply timeframe filter
    const now = new Date();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    if (timeframeFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.event_date) >= now);
    } else if (timeframeFilter === 'thisMonth') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= now && eventDate <= thisMonthEnd;
      });
    } else if (timeframeFilter === 'nextMonth') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
      });
    }
    
    // Apply members-only filter
    if (membersOnlyFilter) {
      filtered = filtered.filter(event => event.is_members_only);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (nearest first)
    filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    
    setFilteredEvents(filtered);
  }, [events, categoryFilter, timeframeFilter, membersOnlyFilter, searchQuery]);
  
  // Format date
  const formatEventDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy • h:mm a');
    } catch (err) {
      return dateString;
    }
  };
  
  // Display specific message if no events match filters
  const getEmptyStateMessage = (): string => {
    if (searchQuery) {
      return `No events found matching "${searchQuery}"`;
    } else if (categoryFilter !== 'all') {
      return `No ${categoryFilter} events found for the selected time period`;
    } else if (membersOnlyFilter) {
      return 'No members-only events found for the selected time period';
    } else {
      return 'No events found for the selected time period';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              Alumni Events
            </h1>
            <p className="text-xl text-blue-100">
              Discover and register for exclusive events designed for our alumni community.
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold mb-4 md:mb-0">Event Filters</h2>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as EventCategory)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="networking">Networking</option>
                <option value="social">Social</option>
                <option value="academic">Academic</option>
                <option value="career">Career</option>
              </select>
            </div>
            
            {/* Timeframe Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value as EventTimeframe)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="thisMonth">This Month</option>
                <option value="nextMonth">Next Month</option>
              </select>
            </div>
            
            {/* Members Only Filter */}
            <div className="flex items-center mt-6 md:mt-0">
              <input
                type="checkbox"
                id="membersOnly"
                checked={membersOnlyFilter}
                onChange={(e) => setMembersOnlyFilter(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="membersOnly" className="ml-2 block text-sm text-gray-700">
                Members-only events
              </label>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredEvents.length === 0 ? 
              'No events found' : 
              `Showing ${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'}`
            }
          </p>
        </div>
        
        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={event.image_url || '/images/event-default.jpg'} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  {event.is_members_only && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 m-2 rounded">
                      Members Only
                    </div>
                  )}
                  {event.is_registered && (
                    <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 m-2 rounded">
                      Registered
                    </div>
                  )}
                </div>
                
                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="mb-4 text-gray-600">
                    <div className="flex items-start mb-2">
                      <svg className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>{formatEventDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ${event.price.toFixed(2)}
                    </span>
                    {event.capacity && event.registered_count && (
                      <span className="text-sm text-gray-500">
                        {event.registered_count}/{event.capacity} spots filled
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Link 
                      to={`/events/${event.id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      {event.is_registered ? 'View Registration' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">{getEmptyStateMessage()}</p>
            <button 
              onClick={() => {
                setCategoryFilter('all');
                setTimeframeFilter('upcoming');
                setMembersOnlyFilter(false);
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Call to Action Section */}
      <div className="bg-gray-50 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Want to Attend Members-Only Events?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Join our alumni membership program to access exclusive events, networking opportunities, and more.
          </p>
          <Link 
            to="/membership" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Learn About Membership
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
