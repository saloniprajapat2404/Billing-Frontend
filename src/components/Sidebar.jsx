import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  UserCircle, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, id: 'nav-dashboard' },
    { name: 'Billing', path: '/billing', icon: Receipt, id: 'nav-billing' },
    { name: 'Reports', path: '/reports', icon: BarChart3, id: 'nav-reports' },
    { name: 'Profile', path: '/profile', icon: UserCircle, id: 'nav-profile' },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 text-slate-100 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white leading-none">🧾</span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white leading-none">BillFlow</h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Billing Suite</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              id={item.id}
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all
                ${isActive 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/10' 
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-slate-900">
          <button
            id="nav-logout"
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
