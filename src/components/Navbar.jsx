import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-effect border-b border-slate-200/80 px-6 py-4 flex justify-between items-center">
      {/* Mobile Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-brand-500" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* User Actions */}
      <div className="relative">
        <button
          id="btn-profile-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-500/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <h4 className="text-sm font-bold text-slate-800 leading-tight">
              {user?.fullName || 'Active User'}
            </h4>
            <p className="text-xs text-slate-500 leading-none mt-0.5">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            {/* Click backdrop to close */}
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
            
            <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 z-20 py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
              </div>

              <button
                id="btn-nav-profile"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                View Profile
              </button>

              <button
                id="btn-nav-logout"
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-all flex items-center gap-2.5 border-t border-slate-50"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
