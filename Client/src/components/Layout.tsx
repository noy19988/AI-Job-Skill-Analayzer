import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import SideNav from './SideNav';

const Layout: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      <TopNavbar />
      
      <div 
        className="h-full"
        dir="ltr"
        style={{
          display: 'grid',
          gridTemplateColumns: '192px 1fr', 
          height: 'calc(100vh - 64px)', 
        }}
      >
        <div style={{ gridColumn: '1', direction: 'ltr' }}>
          <SideNav />
        </div>
        
        <div style={{ gridColumn: '2', direction: 'ltr' }} className="overflow-auto">
          <Outlet context={{ token }} />
        </div>
      </div>
    </div>
  );
};

export default Layout;