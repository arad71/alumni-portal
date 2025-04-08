import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Change navbar styles on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className={`text-2xl font-serif font-bold ${
              isScrolled || mobileMenuOpen || location.pathname !== '/' 
                ? 'text-blue-600' 
                : 'text-white'
            }`}
          >
            Alumni Portal
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLinks isScrolled={isScrolled} currentPath={location.pathname} />
            
            {/* Authentication Links */}
            {user ? (
              <div className="flex items-center ml-4">
                <div className="relative group">
                  <button 
                    className={`flex items-center px-3 py-2 rounded-full ${
                      isScrolled || location.pathname !== '/' 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'hover:bg-white/20 text-white'
                    }`}
                  >
                    <span className="mr-2">{user.firstName}</span>
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    {user.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2 ml-4">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md ${
                    isScrolled || location.pathname !== '/' 
                      ? 'text-blue-600 hover:bg-blue-50' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md ${
                    isScrolled || location.pathname !== '/' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              className={`w-6 h-6 ${
                isScrolled || mobileMenuOpen || location.pathname !== '/' 
                  ? 'text-blue-600' 
                  : 'text-white'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
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
            className="md:hidden bg-white"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <MobileNavLinks currentPath={location.pathname} />
                
                {/* Authentication Links for Mobile */}
                {user ? (
                  <>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <span className="block text-sm text-gray-500 mb-2">
                        Logged in as {user.firstName} {user.lastName}
                      </span>
                      <Link 
                        to="/dashboard" 
                        className="block py-2 text-gray-700"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/profile" 
                        className="block py-2 text-gray-700"
                      >
                        Profile
                      </Link>
                      {user.isAdmin && (
                        <Link 
                          to="/admin" 
                          className="block py-2 text-gray-700"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={logout}
                        className="block py-2 text-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 border-t border-gray-100 pt-4 mt-2">
                    <Link 
                      to="/login" 
                      className="w-full py-2 text-center rounded-md border border-blue-600 text-blue-600"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="w-full py-2 text-center rounded-md bg-blue-600 text-white"
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
  isScrolled: boolean;
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ isScrolled, currentPath }) => {
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Events', path: '/events' },
    { title: 'Directory', path: '/directory' },
    { title: 'About', path: '/about' },
  ];
  
  return (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-3 py-2 rounded-md transition-colors ${
            currentPath === link.path
              ? isScrolled || currentPath !== '/'
                ? 'text-blue-600 font-medium'
                : 'text-white font-medium'
              : isScrolled || currentPath !== '/'
                ? 'text-gray-700 hover:text-blue-600'
                : 'text-white/90 hover:text-white'
          }`}
        >
          {link.title}
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
    { title: 'About', path: '/about' },
  ];
  
  return (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`py-2 ${
            currentPath === link.path
              ? 'text-blue-600 font-medium'
              : 'text-gray-700'
          }`}
        >
          {link.title}
        </Link>
      ))}
    </>
  );
};

export default Header;
