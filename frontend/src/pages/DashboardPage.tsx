import React, { useState } from 'react';
import { Bell, Calendar, MessageSquare, Users, User, BookOpen, Settings, LogOut, Search } from 'lucide-react';

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock data
  const upcomingEvents = [
    { id: 1, title: 'Annual Alumni Meetup', date: 'April 25, 2025', location: 'Grand Hotel, New York' },
    { id: 2, title: 'Tech Industry Networking', date: 'May 10, 2025', location: 'Virtual Event' },
    { id: 3, title: 'Career Fair', date: 'May 22, 2025', location: 'University Campus' }
  ];
  
  const notifications = [
    { id: 1, message: 'James Brown commented on your post', time: '2 hours ago' },
    { id: 2, message: 'New job opportunity shared by Lisa Evans', time: '5 hours ago' },
    { id: 3, message: 'Reunion event date has been updated', time: '1 day ago' }
  ];
  
  const activeChats = [
    { id: 1, name: 'Sarah Johnson', preview: 'Looking forward to seeing you at the event!', unread: 2 },
    { id: 2, name: 'Class of 2022', preview: 'Does anyone have the slides from the last presentation?', unread: 0 },
    { id: 3, name: 'Michael Davis', preview: 'Thanks for connecting me with the team', unread: 1 }
  ];

  const classmateSpotlight = [
    { id: 1, name: 'Emma Williams', role: 'Software Engineer at Google', avatar: '/api/placeholder/40/40' },
    { id: 2, name: 'Daniel Martinez', role: 'Startup Founder, TechNova', avatar: '/api/placeholder/40/40' },
    { id: 3, name: 'Olivia Chen', role: 'UX Researcher at Microsoft', avatar: '/api/placeholder/40/40' }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-5">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Alumni Connect</h1>
          <p className="text-blue-200">Welcome back, Alex!</p>
        </div>
        
        <nav>
          <ul>
            <li className={`mb-2 p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('dashboard')} className="flex items-center w-full text-left">
                <Users className="mr-3" size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={`mb-2 p-3 rounded ${activeTab === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('profile')} className="flex items-center w-full text-left">
                <User className="mr-3" size={20} />
                <span>My Profile</span>
              </button>
            </li>
            <li className={`mb-2 p-3 rounded ${activeTab === 'events' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('events')} className="flex items-center w-full text-left">
                <Calendar className="mr-3" size={20} />
                <span>Events</span>
              </button>
            </li>
            <li className={`mb-2 p-3 rounded ${activeTab === 'messages' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('messages')} className="flex items-center w-full text-left">
                <MessageSquare className="mr-3" size={20} />
                <span>Messages</span>
                <span className="ml-auto bg-red-500 text-white rounded-full px-2 text-xs">3</span>
              </button>
            </li>
            <li className={`mb-2 p-3 rounded ${activeTab === 'directory' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('directory')} className="flex items-center w-full text-left">
                <BookOpen className="mr-3" size={20} />
                <span>Directory</span>
              </button>
            </li>
            <li className={`mb-2 p-3 rounded ${activeTab === 'settings' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button onClick={() => setActiveTab('settings')} className="flex items-center w-full text-left">
                <Settings className="mr-3" size={20} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto pt-5">
          <button className="flex items-center text-blue-200 hover:text-white w-full p-3">
            <LogOut className="mr-3" size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search alumni, events, jobs..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <button className="p-2 relative mr-4">
              <Bell size={24} className="text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <p className="font-medium">Alex Morgan</p>
                <p className="text-sm text-gray-500">Class of 2023</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" size={20} />
                Upcoming Events
              </h3>
              <ul>
                {upcomingEvents.map(event => (
                  <li key={event.id} className="mb-4 pb-4 border-b last:border-0">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">View all events</button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="mr-2 text-blue-600" size={20} />
                Notifications
              </h3>
              <ul>
                {notifications.map(notification => (
                  <li key={notification.id} className="mb-4 pb-4 border-b last:border-0">
                    <p>{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">View all notifications</button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-2 text-blue-600" size={20} />
                Messages
              </h3>
              <ul>
                {activeChats.map(chat => (
                  <li key={chat.id} className="mb-4 pb-4 border-b last:border-0 flex items-center">
                    <img src="/api/placeholder/40/40" alt={chat.name} className="w-10 h-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">{chat.name}</p>
                      <p className="text-sm text-gray-500 truncate">{chat.preview}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs ml-2">{chat.unread}</span>
                    )}
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">Open messages</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-5 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Classmate Spotlight</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classmateSpotlight.map(classmate => (
                  <div key={classmate.id} className="border rounded-lg p-4 text-center">
                    <img src={classmate.avatar} alt={classmate.name} className="w-20 h-20 rounded-full mx-auto mb-3" />
                    <p className="font-medium">{classmate.name}</p>
                    <p className="text-sm text-gray-500">{classmate.role}</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    Job Board
                  </a>
                </li>
                <li>
                  <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    Mentorship Program
                  </a>
                </li>
                <li>
                  <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    Alumni Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    Donate to Scholarship Fund
                  </a>
                </li>
                <li>
                  <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    Update Contact Information
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniDashboard;
