import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';

// Types
interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  price: number;
  image_url?: string;
  is_members_only: boolean;
  registered_count: number;
  is_registered: boolean;
}

interface Membership {
  id: number;
  membership_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [membershipInfo, setMembershipInfo] = useState<Membership | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [eventsRes, myEventsRes, membershipRes] = await Promise.all([
          axios.get('/api/events'),
          axios.get('/api/registrations/my-events'),
          axios.get('/api/memberships/my-membership')
        ]);
        
        // Get only upcoming events (within next 30 days) and limit to 3
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        // Filter and sort upcoming events
        const filteredEvents = eventsRes.data
          .filter((event: Event) => new Date(event.event_date) > now && new Date(event.event_date) <= thirtyDaysFromNow)
          .sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3);
        
        setUpcomingEvents(filteredEvents);
        setRegisteredEvents(myEventsRes.data.slice(0, 3)); // Limit to 3 registered events
        
        if (membershipRes.data.has_membership) {
          setMembershipInfo(membershipRes.data.membership);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Function to format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };
  
  // Function to calculate days remaining in membership
  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome, {user?.firstName}!
          </h1>
          <p className="mt-2 text-blue-100 text-lg">
            Stay connected with your alumni community
          </p>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card h-full"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Membership Status
          </h2>
          
          {membershipInfo ? (
            <div>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full inline-block text-sm font-medium mb-3">
                Active
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{membershipInfo.membership_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{format(new Date(membershipInfo.start_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">{format(new Date(membershipInfo.end_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Remaining:</span>
                  <span className="font-medium">{getDaysRemaining(membershipInfo.end_date)}</span>
                </div>
              </div>
              
              {getDaysRemaining(membershipInfo.end_date) <= 30 && (
                <Link to="/membership/renew" className="btn-primary w-full text-center block">
                  Renew Membership
                </Link>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full inline-block text-sm font-medium mb-3">
                Inactive
              </div>
              
              <p className="text-gray-600 mb-4">
                You don't currently have an active membership. Join to access exclusive benefits, including the alumni directory and members-only events.
              </p>
              
              <Link to="/membership" className="btn-primary w-full text-center block">
                Join Now
              </Link>
            </div>
          )}
        </motion.div>
        
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card h-full"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Events
          </h2>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-lg">
                    {event.title}
                    {event.is_members_only && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Members Only
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    <div>
                      <span className="inline-block w-5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {formatDate(event.event_date)}
                    </div>
                    <div>
                      <span className="inline-block w-5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      {event.location}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-medium">${event.price}</span>
                    {event.is_registered ? (
                      <span className="text-green-600 text-sm font-medium">
                        Registered
                      </span>
                    ) : (
                      <Link to={`/events/${event.id}`} className="text-sm text-blue-600 hover:underline">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No upcoming events found.</p>
              <Link to="/events" className="text-blue-600 hover:underline">
                Browse all events
              </Link>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/events" className="text-blue-600 hover:underline flex items-center justify-center">
              View All Events
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
        
        {/* Registered Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card h-full"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            My Registrations
          </h2>
          
          {registeredEvents.length > 0 ? (
            <div className="space-y-4">
              {registeredEvents.map(event => (
                <div key={event.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-lg">
                    {event.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    <div>
                      <span className="inline-block w-5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {formatDate(event.event_date)}
                    </div>
                    <div>
                      <span className="inline-block w-5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      {event.location}
                    </div>
                  </div>
                  <Link to={`/events/${event.id}`} className="text-sm text-blue-600 hover:underline">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
              <Link to="/events" className="text-blue-600 hover:underline">
                Browse events
              </Link>
            </div>
          )}
          
          {registeredEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/my-events" className="text-blue-600 hover:underline flex items-center justify-center">
                View All My Events
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Directory and Profile Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card text-center"
        >
          <div className="text-4xl mb-4 text-blue-500">
            👥
          </div>
          <h2 className="text-xl font-bold mb-2">Alumni Directory</h2>
          <p className="text-gray-600 mb-6">
            Connect with fellow alumni from around the world.
            {!membershipInfo && " Membership required to access the directory."}
          </p>
          {membershipInfo ? (
            <Link to="/directory" className="btn-primary block w-full">
              Browse Directory
            </Link>
          ) : (
            <Link to="/membership" className="btn-primary block w-full">
              Get Membership
            </Link>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card text-center"
        >
          <div className="text-4xl mb-4 text-blue-500">
            👤
          </div>
          <h2 className="text-xl font-bold mb-2">Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Update your personal information, privacy settings, and profile visibility.
          </p>
          <Link to="/profile" className="btn-primary block w-full">
            Edit Profile
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
