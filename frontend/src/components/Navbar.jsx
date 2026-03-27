import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Car, LayoutDashboard, User, ShieldAlert, LogOut } from 'lucide-react';

const Navbar = () => {
  const { role, user, switchRole } = useRole();

  const navItems = {
    customer: [
      { name: 'Home', path: '/' },
      { name: 'Browse Vehicles', path: '/browse' },
      { name: 'My Rentals', path: '/my-rentals' },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin' },
      { name: 'Vehicles', path: '/admin/vehicles' },
      { name: 'Pricing Rules', path: '/admin/pricing' },
    ],
    fleet_manager: [
      { name: 'Fleet Board', path: '/fleet' },
      { name: 'Maintenance', path: '/fleet/maintenance' },
    ]
  };

  return (
    <nav className="sticky top-0 z-50 glass border-t-0 rounded-t-none backdrop-blur-md">
      <div className="container h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Car size={24} className="text-white" />
          </div>
          <span className="font-heading text-xl tracking-tight">LUXE<span className="text-primary">VALET</span></span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6">
            {navItems[role].map((item) => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-text-dim'}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-border-glass mx-2"></div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{role.replace('_', ' ')}</span>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-border-glass flex items-center justify-center hover:bg-primary transition-colors">
                <User size={20} />
              </button>
              
              <div className="absolute right-0 top-12 w-48 glass p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-2xl">
                <div className="px-3 py-2 text-xs text-text-dim border-b border-border-glass mb-1">Switch Role (Demo)</div>
                {['customer', 'admin', 'fleet_manager'].map(r => (
                  <button 
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-primary/20 ${role === r ? 'text-primary' : ''}`}
                  >
                    {r.replace('_', ' ').charAt(0).toUpperCase() + r.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
