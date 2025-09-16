import React from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 