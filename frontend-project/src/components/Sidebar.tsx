import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Users, Building2, DollarSign, FileBarChart2, X, Search, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logo';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { logout, user } = useAuthStore();
  
  const navigation: NavItem[] = [
    { name: 'Employees', to: '/', icon: <Users size={20} /> },
    { name: 'Departments', to: '/departments', icon: <Building2 size={20} /> },
    { name: 'Salaries', to: '/salaries', icon: <DollarSign size={20} /> },
    { name: 'Reports', to: '/reports', icon: <FileBarChart2 size={20} /> },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div 
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-primary-800 text-white transform transition-transform duration-300 ease-in-out z-30 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8" dangerouslySetInnerHTML={{ __html: logo }} />
            <span className="font-bold text-xl">SmartPark EPMS</span>
          </Link>
          <button 
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-primary-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-primary-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:bg-primary-500"
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => 
                clsx(
                  "flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200",
                  isActive 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-primary-700 hover:text-white"
                )
              }
            >
              <div className="mr-4">{item.icon}</div>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info and logout - Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{user?.username}</p>
              <p className="text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-primary-800 lg:text-white">
        {/* Desktop header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8" dangerouslySetInnerHTML={{ __html: logo }} />
            <span className="font-bold text-xl">SmartPark EPMS</span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-primary-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-primary-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:bg-primary-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => 
                clsx(
                  "flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200",
                  isActive 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-primary-700 hover:text-white"
                )
              }
            >
              <div className="mr-4">{item.icon}</div>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info and logout - Desktop */}
        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{user?.username}</p>
              <p className="text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;