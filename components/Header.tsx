import React from 'react';
import { Leaf } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { Page } from '../contexts/AppContext';

export const Header: React.FC = () => {
  const { navigateTo, page } = useApp();

  const NavLink: React.FC<{ targetPage: Page; children: React.ReactNode }> = ({ targetPage, children }) => {
    const isActive = page === targetPage;
    return (
        <button 
            onClick={() => navigateTo(targetPage)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                ? 'text-slate-900' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
        >
            {children}
        </button>
    );
  };
  
  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200/80">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-8">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigateTo('main')}
            role="button"
            aria-label="Go to homepage"
          >
            <Leaf className="h-7 w-7 text-orange-500" />
            <h1 className="text-lg font-bold text-slate-800 tracking-wide">AI Landscape Designer</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink targetPage="main">Home</NavLink>
            <NavLink targetPage="history">Projects</NavLink>
            <NavLink targetPage="pricing">Pricing</NavLink>
            <NavLink targetPage="contact">Contact</NavLink>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
            <img 
                src={`https://i.pravatar.cc/40?u=${'user123'}`} // Placeholder avatar
                alt="User profile"
                className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white ring-slate-200"
            />
        </div>
      </div>
    </header>
  );
};