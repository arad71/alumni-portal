import React, { useState } from 'react';
import {
  Bell, Calendar, MessageSquare, Users, User, BookOpen, Settings, LogOut, Search,
} from 'lucide-react';

type Event = { id: number; title: string; date: string; location: string };
type Notification = { id: number; message: string; time: string };
type Chat = { id: number; name: string; preview: string; unread: number };
type Classmate = { id: number; name: string; role: string; avatar?: string };

const upcomingEvents: Event[] = [
  { id: 1, title: 'Annual Alumni Meetup', date: 'April 25, 2025', location: 'Grand Hotel, New York' },
  { id: 2, title: 'Tech Industry Networking', date: 'May 10, 2025', location: 'Virtual Event' },
  { id: 3, title: 'Career Fair', date: 'May 22, 2025', location: 'University Campus' },
];

const notifications: Notification[] = [
  { id: 1, message: 'James Brown commented on your post', time: '2 hours ago' },
  { id: 2, message: 'New job opportunity shared by Lisa Evans', time: '5 hours ago' },
  { id: 3, message: 'Reunion event date has been updated', time: '1 day ago' },
];

const activeChats: Chat[] = [
  { id: 1, name: 'Sarah Johnson', preview: 'Looking forward to seeing you at the event!', unread: 2 },
  { id: 2, name: 'Class of 2022', preview: 'Does anyone have the slides from the last presentation?', unread: 0 },
  { id: 3, name: 'Michael Davis', preview: 'Thanks for connecting me with the team', unread: 1 },
];

const classmateSpotlight: Classmate[] = [
  { id: 1, name: 'Emma Williams', role: 'Software Engineer at Google', avatar: '/api/placeholder/40/40' },
  { id: 2, name: 'Daniel Martinez', role: 'Startup Founder, TechNova', avatar: '/api/placeholder/40/40' },
  { id: 3, name: 'Olivia Chen', role: 'UX Researcher at Microsoft', avatar: '/api/placeholder/40/40' },
];

const quickLinks = [
  { label: 'Job Board' },
  { label: 'Mentorship Program' },
  { label: 'Alumni Newsletter' },
  { label: 'Donate to Scholarship Fund' },
  { label: 'Update Contact Information' },
];

// Sidebar item configuration
const sidebarTabs = [
  { key: 'dashboard', label: 'Dashboard', icon: Users },
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'directory', label: 'Directory', icon: BookOpen },
  { key: 'settings', label: 'Settings', icon: Settings },
];

function Sidebar({
  activeTab, setActiveTab, unreadMessages,
}: { activeTab: string, setActiveTab: (tab: string) => void, unreadMessages: number }) {
  return (
    <aside className="w-64 bg-blue-800 text-white p-5 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Alumni Connect</h1>
        <p className="text-blue-200">Welcome back, Alex!</p>
      </div>
      <nav>
        <ul>
          {sidebarTabs.map(({ key, label, icon: Icon }) => (
            <li key={key} className={`mb-2 p-3 rounded ${activeTab === key ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              <button
                aria-label={label}
                onClick={() => setActiveTab(key)}
                className="flex items-center w-full text-left"
              >
                <Icon className="mr-3" size={20} />
                <span>{label}</span>
                {key === 'messages' && unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-2 text-xs">{unreadMessages}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-5">
        <button className="flex items-center text-blue-200 hover:text-white w-full p-3" aria-label="Logout">
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function DashboardCard({ children, title, icon: Icon }: { children: React.ReactNode, title: string, icon?: React.FC<{className?: string, size?: number}> }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        {Icon && <Icon className="mr-2 text-blue-600" size={20} />}
        {title}
      </h3>
      {children}
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const totalUnread = activeChats.reduce((acc, chat) => acc + chat.unread, 0);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} unreadMessages={totalUnread} />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              aria-label="Search alumni, events, jobs"
              placeholder="Search alumni, events, jobs..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <button className="p-2 relative mr-4" aria-label="Notifications">
              <Bell size={24} className="text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
            <div className="flex items-center">
              <img src="/api/placeholder/40/40" alt="Profile" className="w-10 h-10 rounded-full" loading="lazy" />
              <div className="ml-3">
                <p className="font-medium">Alex Morgan</p>
                <p className="text-sm text-gray-500">Class of 2023</p>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Upcoming Events" icon={Calendar}>
              <ul>
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="mb-4 pb-4 border-b last:border-0">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">View all events</button>
            </DashboardCard>
            <DashboardCard title="Notifications" icon={Bell}>
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} className="mb-4 pb-4 border-b last:border-0">
                    <p>{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">View all notifications</button>
            </DashboardCard>
            <DashboardCard title="Messages" icon={MessageSquare}>
              <ul>
                {activeChats.map((chat) => (
                  <li key={chat.id} className="mb-4 pb-4 border-b last:border-0 flex items-center">
                    <img
                      src="/api/placeholder/40/40"
                      alt={chat.name}
                      className="w-10 h-10 rounded-full mr-3"
                      loading="lazy"
                    />
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
            </DashboardCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-5 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Classmate Spotlight</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classmateSpotlight.map((classmate) => (
                  <div key={classmate.id} className="border rounded-lg p-4 text-center">
                    <img
                      src={classmate.avatar || '/api/placeholder/40/40'}
                      alt={classmate.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                      loading="lazy"
                    />
                    <p className="font-medium">{classmate.name}</p>
                    <p className="text-sm text-gray-500">{classmate.role}</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                  </div>
                ))}
              </div>
            </div>
            <DashboardCard title="Quick Links">
              <ul className="space-y-3">
                {quickLinks.map(({ label }) => (
                  <li key={label}>
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
