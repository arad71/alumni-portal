import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

interface EventParams {
  id: string;
  [key: string]: string | undefined;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<EventParams>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [showMembershipPrompt, setShowMembershipPrompt] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data);
        
        // Check if we need to show prompts
        if (response.data.is_members_only) {
          if (!user) {
            setShowLoginPrompt(true);
          } else if (!user.hasMembership) {
            setShowMembershipPrompt(true);
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, user]);
  
  // Handle registration
  const handleRegister = () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}/register`);
      return;
    }
    
    if (event?.is_members_only && !user.hasMembership) {
      navigate('/membership');
      return;
    }
    
    navigate(`/events/${id}/register`);
  };
  
  // Format date
  const formatEventDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy • h:mm a');
    } catch (err) {
      return dateString;
    }
  };
  
  // Get event time remaining
  const getEventTimeRemaining = (dateString: string): string => {
    try {
      const eventDate = new Date(dateString);
      const now = new Date();
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'Event has passed';
      } else if (diffDays === 0) {
        return 'Today!';
      } else if (diffDays === 1) {
        return 'Tomorrow!';
      } else if (diffDays < 7) {
        return `${diffDays} days away`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks away`;
      } else {
        return `${Math.floor(diffDays / 30)} months away`;
      }
    } catch (err) {
      return '';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Event not found'}</p>
          <Link to="/events" className="inline-block mt-4 text-blue-600 hover:underline">
            &larr; Back to Events
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Header */}
      <div className="relative bg-blue-900 text-white py-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover opacity-20"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/events" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </Link>
            
            <div className="flex flex-wrap items-center">
              <div className="w-full lg:w-2/3 pr-0 lg:pr-12">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {getEventTimeRemaining(event.event_date)}
                  </span>
                  {event.is_members_only && (
                    <span className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Members Only
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                  {event.title}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center text-blue-200 mb-6">
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">${event.price.toFixed(2)}</div>
                    <div className="text-blue-200 mb-4">per person</div>
                    
                    {event.is_registered ? (
                      <div className="bg-green-500 text-white rounded-md py-3 px-6 text-center font-medium mb-4">
                        You're Registered! 
                      </div>
                    ) : (
                      <button
                        onClick={handleRegister}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                      >
                        {user ? 'Register Now' : 'Login to Register'}
                      </button>
                    )}
                    
                    {event.capacity && event.registered_count !== undefined && (
                      <div className="mt-4">
                        <div className="text-sm mb-1">
                          {event.registered_count} / {event.capacity} spots filled
                        </div>
                        <div className="w-full h-2 bg-blue-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-400"
                            style={{ width: `${(event.registered_count / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 mb-8"
            >
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </motion.div>
            
            {/* Event Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="mb-4">
                <p className="text-gray-700">{event.location}</p>
              </div>
              
              {/* Map placeholder - in a real app, integrate with Google Maps */}
              <div className="rounded-lg overflow-hidden h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Map would be displayed here</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Directions and additional location details would be provided here.</p>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Registration Card (for mobile) */}
            <div className="block lg:hidden mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">${event.price.toFixed(2)}</div>
                  <div className="text-gray-500 mb-4">per person</div>
                  
                  {event.is_registered ? (
                    <div className="bg-green-500 text-white rounded-md py-3 px-6 text-center font-medium mb-4">
                      You're Registered! 
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
                    >
                      {user ? 'Register Now' : 'Login to Register'}
                    </button>
                  )}
                  
                  {event.capacity && event.registered_count !== undefined && (
                    <div className="mt-4">
                      <div className="text-sm mb-1">
                        {event.registered_count} / {event.capacity} spots filled
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600"
                          style={{ width: `${(event.registered_count / event.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 mb-8"
            >
              <h2 className="text-xl font-bold mb-4">Organizer</h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Alumni Association</div>
                  <div className="text-sm text-gray-500">Events Team</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                The Alumni Association organizes events to connect graduates and create networking opportunities.
              </p>
              <a 
                href="mailto:events@alumniassociation.org" 
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Organizer
              </a>
            </motion.div>
            
            {/* Similar Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold mb-4">Similar Events</h2>
              <div className="space-y-4">
                {/* This would be populated from the API in a real app */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 mr-3 overflow-hidden">
                      <img 
                        src={`/images/event-${item}.jpg`} 
                        alt="Event"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">Similar Event {item}</h3>
                      <p className="text-sm text-gray-500 mb-1">October {10 + item}, 2023</p>
                      <Link 
                        to={`/events/${item}`} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Login/Membership Prompts */}
      {showLoginPrompt && !user && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 z-50">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="font-medium">This is a members-only event.</p>
              <p className="text-blue-200">Sign in to register for this exclusive event.</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                to={`/login?redirect=/events/${id}`}
                className="bg-white text-blue-900 hover:bg-blue-100 px-6 py-2 rounded-md font-medium transition-colors"
              >
                Log In
              </Link>
              <Link 
                to={`/register?redirect=/events/${id}`}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {showMembershipPrompt && user && !user.hasMembership && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 z-50">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="font-medium">This is a members-only event.</p>
              <p className="text-blue-200">Join our membership program to register for this exclusive event.</p>
            </div>
            <Link 
              to="/membership"
              className="bg-white text-blue-900 hover:bg-blue-100 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Learn About Membership
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
