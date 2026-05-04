import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, Layers, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/test-orders', icon: ClipboardList, label: 'Test Orders' },
  { to: '/cpc-workflow', icon: Activity, label: 'CPC Workflow' },
  { to: '/batches', icon: Layers, label: 'OncoIncytes Batches' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-100 flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="p-2 bg-blue-600 rounded-lg">
          <FlaskConical size={20} className="text-white" />
        </div>
        <span className="font-semibold text-lg tracking-tight">OncoIncyte</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">OncoIncyte Lab Portal</p>
        <p className="text-xs text-slate-600">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
