import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Change navbar styles on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Determine if we should use dark theme (for homepage hero section)
  const isDarkTheme = !isScrolled && !mobileMenuOpen && location.pathname === '/';
  
  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className={`text-2xl font-serif font-bold transition-colors duration-300 hover:opacity-80 ${
              isDarkTheme ? 'text-white' : 'text-blue-600'
            }`}
            aria-label="Alumni Portal Home"
          >
            Alumni Portal
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation">
            <NavLinks isDarkTheme={isDarkTheme} currentPath={location.pathname} />
            
            {/* Authentication Links */}
            {user ? (
              <div className="flex items-center ml-4">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className={`flex items-center px-3 py-2 rounded-full transition-colors duration-200 ${
                      isDarkTheme
                        ? 'hover:bg-white/20 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                    <span className="mr-2">{user.firstName}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
                        role="menu"
                      >
                        <DropdownLink to="/dashboard" icon={<DashboardIcon />}>
                          Dashboard
                        </DropdownLink>
                        <DropdownLink to="/profile" icon={<ProfileIcon />}>
                          Profile
                        </DropdownLink>
                        {user.isAdmin && (
                          <DropdownLink to="/admin" icon={<AdminIcon />}>
                            Admin Panel
                          </DropdownLink>
                        )}
                        <div className="border-t border-gray-100 my-1" role="separator"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center transition-colors duration-200"
                          role="menuitem"
                        >
                          <LogoutIcon className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2 ml-4">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkTheme
                      ? 'text-white hover:bg-white/10 border border-white/20' 
                      : 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkTheme
                      ? 'bg-white text-blue-600 hover:bg-gray-100' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <HamburgerIcon 
              isOpen={mobileMenuOpen}
              className={`w-6 h-6 ${isDarkTheme ? 'text-white' : 'text-blue-600'}`}
            />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4" role="navigation">
                <MobileNavLinks currentPath={location.pathname} />
                
                {/* Authentication Links for Mobile */}
                {user ? (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <MobileDropdownLink to="/dashboard" icon={<DashboardIcon />}>
                        Dashboard
                      </MobileDropdownLink>
                      <MobileDropdownLink to="/profile" icon={<ProfileIcon />}>
                        Profile
                      </MobileDropdownLink>
                      {user.isAdmin && (
                        <MobileDropdownLink to="/admin" icon={<AdminIcon />}>
                          Admin Panel
                        </MobileDropdownLink>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left py-2 text-gray-700 flex items-center"
                      >
                        <LogoutIcon className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 border-t border-gray-200 pt-4 mt-4">
                    <Link 
                      to="/login" 
                      className="w-full py-3 text-center rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="w-full py-3 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Navigation Links Component
interface NavLinksProps {
  isDarkTheme: boolean;
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ isDarkTheme, currentPath }) => {
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Events', path: '/events' },
    { title: 'Directory', path: '/directory' },
    { title: 'News', path: '/news' },
    { title: 'About', path: '/about' },
  ];
  
  return (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-3 py-2 rounded-md transition-colors duration-200 relative ${
            currentPath === link.path
              ? isDarkTheme
                ? 'text-white font-medium'
                : 'text-blue-600 font-medium'
              : isDarkTheme
                ? 'text-white/90 hover:text-white'
                : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {link.title}
          {currentPath === link.path && (
            <motion.div
              layoutId="activeTab"
              className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                isDarkTheme ? 'bg-white' : 'bg-blue-600'
              }`}
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </>
  );
};

// Mobile Navigation Links Component
interface MobileNavLinksProps {
  currentPath: string;
}

const MobileNavLinks: React.FC<MobileNavLinksProps> = ({ currentPath }) => {
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Events', path: '/events' },
    { title: 'Directory', path: '/directory' },
    { title: 'News', path: '/news' },
    { title: 'About', path: '/about' },
  ];
  
  return (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`py-2 px-2 rounded-md transition-colors duration-200 ${
            currentPath === link.path
              ? 'text-blue-600 font-medium bg-blue-50'
              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          {link.title}
        </Link>
      ))}
    </>
  );
};

// Dropdown Link Component
interface DropdownLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const DropdownLink: React.FC<DropdownLinkProps> = ({ to, icon, children }) => {
  return (
    <Link 
      to={to} 
      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center transition-colors duration-200"
      role="menuitem"
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Link>
  );
};

// Mobile Dropdown Link Component
const MobileDropdownLink: React.FC<DropdownLinkProps> = ({ to, icon, children }) => {
  return (
    <Link 
      to={to} 
      className="block py-2 text-gray-700 flex items-center hover:text-blue-600 transition-colors duration-200"
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Link>
  );
};

// Icon Components
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DashboardIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AdminIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// Hamburger Icon Component
interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ isOpen, className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {isOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    )}
  </svg>
);

export default Header;
