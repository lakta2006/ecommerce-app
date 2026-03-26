import React from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar - Desktop */}
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};
