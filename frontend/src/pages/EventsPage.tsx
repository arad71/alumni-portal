import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

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

type EventCategory = 'all' | 'networking' | 'social' | 'academic' | 'career';
type EventTimeframe = 'all' | 'upcoming' | 'thisMonth' | 'nextMonth';

// Skeleton Loader
const EventCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
      <div className="h-4 bg-gray-100 rounded mb-4 w-2/3" />
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  </div>
);

const fetchEvents = async () => {
  const { data } = await axios.get('/api/events');
  return data;
};

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<EventTimeframe>('upcoming');
  const [membersOnlyFilter, setMembersOnlyFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: events = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<Event[], Error>(['events'], fetchEvents, { refetchOnWindowFocus: false });

  // Filtering logic
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(categoryFilter) ||
          event.description.toLowerCase().includes(categoryFilter)
      );
    }

    // Timeframe
    const now = new Date();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    if (timeframeFilter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.event_date) >= now);
    } else if (timeframeFilter === 'thisMonth') {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= now && eventDate <= thisMonthEnd;
      });
    } else if (timeframeFilter === 'nextMonth') {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
      });
    }

    // Members only
    if (membersOnlyFilter) {
      filtered = filtered.filter((event) => event.is_members_only);
    }

    // Search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    return filtered;
  }, [events, categoryFilter, timeframeFilter, membersOnlyFilter, searchQuery]);

  // Format date
  const formatEventDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'EEEE, MMM d, yyyy • h:mm a');
    } catch {
      return dateString;
    }
  };

  // Empty state message
  const getEmptyStateMessage = (): string => {
    if (searchQuery) return `No events found matching "${searchQuery}"`;
    if (categoryFilter !== 'all') return `No ${categoryFilter} events found for the selected time period`;
    if (membersOnlyFilter) return 'No members-only events found for the selected time period';
    return 'No events found for the selected time period';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Alumni Events</h1>
            <p className="text-xl text-blue-100">Discover and register for exclusive events designed for our alumni community.</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-4 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold">Event Filters</h2>
            <button onClick={refetch} className="ml-auto bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md font-semibold text-sm">
              Refresh Events
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as EventCategory)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Categories</option>
                <option value="networking">Networking</option>
                <option value="social">Social</option>
                <option value="academic">Academic</option>
                <option value="career">Career</option>
              </select>
            </div>
            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value as EventTimeframe)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="thisMonth">This Month</option>
                <option value="nextMonth">Next Month</option>
              </select>
            </div>
            {/* Members Only */}
            <div className="flex items-center mt-2 md:mt-6">
              <input type="checkbox" id="membersOnly" checked={membersOnlyFilter} onChange={(e) => setMembersOnlyFilter(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="membersOnly" className="ml-2 block text-sm text-gray-700">Members-only</label>
              <button onClick={() => {
                setCategoryFilter('all'); setTimeframeFilter('upcoming'); setMembersOnlyFilter(false); setSearchQuery('');
              }} className="ml-4 text-blue-600 hover:text-blue-800 text-xs underline">Clear Filters</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredEvents.length === 0 ? 'No events found' : `Showing ${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'}`}
          </p>
        </div>

        {/* Events List */}
        {isLoading || isFetching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => <EventCardSkeleton key={idx} />)}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex flex-col items-center">
            <p className="text-red-700 mb-2">Failed to load events. {error instanceof Error ? error.message : ''}</p>
            <button onClick={refetch} className="bg-blue-600 text-white px-4 py-2 rounded-md">Retry</button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                <div className="h-48 overflow-hidden relative">
                  <img src={event.image_url || '/images/event-default.jpg'} alt={event.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                  {event.is_members_only && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Members
                    </span>
                  )}
                  {event.is_registered && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Registered
                    </span>
                  )}
                </div>
                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                  <div className="mb-4 text-gray-600">
                    <div className="flex items-start mb-2">
                      <svg className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>{formatEventDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">${event.price.toFixed(2)}</span>
                    {event.capacity && event.registered_count !== undefined && (
                      <span className="text-sm text-gray-500">{event.registered_count}/{event.capacity} filled</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link to={`/events/${event.id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                      {event.is_registered ? 'View Registration' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">{getEmptyStateMessage()}</p>
            <button onClick={() => {
              setCategoryFilter('all');
              setTimeframeFilter('upcoming');
              setMembersOnlyFilter(false);
              setSearchQuery('');
            }} className="text-blue-600 hover:text-blue-800 font-medium">Clear all filters</button>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Want to Attend Members-Only Events?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join our alumni membership program to access exclusive events, networking opportunities, and more.
          </p>
          <Link to="/membership"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors">
            Learn About Membership
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
