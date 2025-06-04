import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  headerProps?: Record<string, any>;
  footerProps?: Record<string, any>;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '',
  headerProps = {},
  footerProps = {}
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header {...headerProps} />
      <main 
        className={`flex-grow pt-16 ${className}`}
        role="main"
        id="main-content"
      >
        {children}
      </main>
      <Footer {...footerProps} />
    </div>
  );
};

export default Layout;
