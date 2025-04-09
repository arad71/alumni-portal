import { useState } from 'react';

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const upcomingEvents = [
    { id: 1, title: 'Annual Alumni Meetup', date: 'May 15, 2025', location: 'Main Campus', type: 'Networking' },
    { id: 2, title: 'Career Fair', date: 'June 3, 2025', location: 'Virtual', type: 'Career' },
    { id: 3, title: 'Department Reunion', date: 'July 10, 2025', location: 'East Hall', type: 'Social' }
  ];

  const notifications = [
    { id: 1, message: 'Your membership renewal is due in 15 days', time: '2 hours ago', read: false },
    { id: 2, message: 'New job posting in your field', time: '1 day ago', read: true },
    { id: 3, message: 'Your profile has been viewed by 5 recruiters', time: '3 days ago', read: true }
  ];

  const jobPostings = [
    { id: 1, title: 'Senior Software Engineer', company: 'Tech Innovations Inc.', location: 'Remote', posted: '2 days ago' },
    { id: 2, title: 'Marketing Manager', company: 'Global Brands', location: 'New York, NY', posted: '3 days ago' },
    { id: 3, title: 'Research Associate', company: 'BioScience Labs', location: 'Boston, MA', posted: '1 week ago' }
  ];
  
  const newsArticles = [
    { id: 1, title: 'University Research Breakthrough in Renewable Energy', date: 'Apr 2, 2025', image: '/api/placeholder/60/60' },
    { id: 2, title: 'Alumni Spotlight: Sarah Chen\'s Work in Climate Science', date: 'Mar 28, 2025', image: '/api/placeholder/60/60' },
    { id: 3, title: 'New Academic Building Opening Next Fall', date: 'Mar 15, 2025', image: '/api/placeholder/60/60' }
  ];
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-9-5v9l9 5 9-5v-9z" />
              </svg>
            </div>
            <h1 className="ml-3 text-2xl font-bold">Alumni Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="text-white hover:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center">
              <img className="h-9 w-9 rounded-full" src="/api/placeholder/36/36" alt="Profile" />
              <div className="ml-2">
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-xs opacity-75">Class of 2020</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'events', 'jobs', 'directory', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="bg-white shadow rounded-lg col-span-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Welcome back, Jane!</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Premium Member</span>
            </div>
            <p className="mt-2 text-gray-600">
              Complete your alumni profile to connect with more opportunities.
            </p>
            <div className="mt-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                   style={{ width: '65%' }}>
                65% Complete
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Complete Profile
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                View Profile
              </button>
            </div>
          </div>

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Events Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </a>
                </div>
                <div className="mt-4 space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 rounded-md bg-blue-50 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{event.date}</span>
                          <span className="mx-2">•</span>
                          <span>{event.location}</span>
                        </div>
                        <span className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.type}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <button className="text-sm text-blue-600 hover:text-blue-500">RSVP</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Postings */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Job Opportunities</h2>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </a>
                </div>
                <div className="mt-4 divide-y divide-gray-200">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{job.company}</p>
                        </div>
                        <span className="text-sm text-gray-500">{job.posted}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                      <div className="mt-2">
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`px-6 py-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all notifications
                </button>
              </div>
            </div>

            {/* News Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Latest News</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {newsArticles.map((article) => (
                  <div key={article.id} className="p-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded object-cover" src={article.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{article.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">{article.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  More news
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[
                    { icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", text: "Directory" },
                    { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", text: "Mentoring" },
                    { icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z", text: "Giving" },
                    { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", text: "Resources" }
                  ].map((link, idx) => (
                    <button key={idx} className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-blue-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                      </svg>
                      <span className="mt-2 text-sm font-medium text-gray-900">{link.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              © 2025 University Alumni Association. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy Policy</span>
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms of Service</span>
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlumniDashboard;
