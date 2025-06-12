import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

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
}

const formatEventDate = (dateString: string) =>
  format(new Date(dateString), 'EEEE, MMMM d, yyyy • h:mm a');

const getEventTimeRemaining = (dateString: string) => {
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Event has passed';
  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow!';
  if (diffDays < 7) return `${diffDays} days away`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks away`;
  return `${Math.floor(diffDays / 30)} months away`;
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<EventParams>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetch event details
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError('Failed to load event details. Please try again later.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Registration Handler
  const handleRegister = async () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }
    if (event?.is_members_only && !user.hasMembership) {
      navigate('/membership');
      return;
    }
    setRegistering(true);
    setRegError(null);
    try {
      await axios.post(`/api/events/${id}/register`);
      setRegSuccess(true);
      // Optimistically update UI
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_registered: true,
              registered_count: prev.registered_count ? prev.registered_count + 1 : 1,
            }
          : null
      );
    } catch (err: any) {
      setRegError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <span className="loader-circle border-blue-600 h-14 w-14 border-4 border-t-transparent animate-spin rounded-full"></span>
      </div>
    );

  if (error || !event)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Oops!</h1>
          <p className="mb-4">{error || 'Event not found.'}</p>
          <Link
            to="/events"
            className="text-blue-600 font-semibold underline hover:text-blue-800"
          >
            &larr; Back to Events
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-14 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-4 gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-700 px-3 py-1 rounded-full font-semibold shadow">{getEventTimeRemaining(event.event_date)}</span>
              {event.is_members_only && (
                <span className="bg-indigo-600 px-3 py-1 rounded-full font-semibold shadow">Members Only</span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3">{event.title}</h1>
            <div className="flex flex-wrap items-center text-blue-200 text-lg gap-5 mb-2">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formatEventDate(event.event_date)}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {event.location}
              </span>
            </div>
            <Link to="/events" className="underline text-blue-200 hover:text-white">&larr; Back to Events</Link>
          </div>
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-56 h-56 object-cover rounded-2xl border-4 border-blue-200 shadow-xl"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        {/* Event Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-3 text-blue-900">About This Event</h2>
            <div className="prose text-gray-700">{event.description}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-800">Location</h3>
            <div className="mb-4">{event.location}</div>
            <div className="h-52 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">Map will be displayed here</div>
          </div>
        </div>

        {/* Registration Card */}
        <div>
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl shadow-xl p-8 sticky top-24">
            <div className="text-3xl font-bold mb-1">${event.price.toFixed(2)}</div>
            <div className="text-blue-200 mb-4">per person</div>
            {event.is_registered ? (
              <div className="bg-green-500 text-white rounded-md py-2 px-4 text-center font-semibold mb-4">
                You're Registered!
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className={`w-full py-3 rounded-lg font-semibold shadow transition-all mb-3 
                  ${registering ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600'}`}
              >
                {registering ? 'Registering...' : user ? 'Register Now' : 'Login to Register'}
              </button>
            )}
            {regSuccess && <div className="text-green-200 text-sm mb-2">Registration successful!</div>}
            {regError && <div className="text-red-200 text-sm mb-2">{regError}</div>}
            {event.capacity && event.registered_count !== undefined && (
              <div className="mt-4">
                <div className="text-sm mb-1">{event.registered_count} / {event.capacity} spots filled</div>
                <div className="w-full h-2 bg-blue-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{ width: `${(event.registered_count / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
