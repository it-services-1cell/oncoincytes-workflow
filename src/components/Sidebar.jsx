import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, Layers, FileBarChart, FlaskConical } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <FlaskConical className="brand-icon" size={24} />
          OncoInsight
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/test-orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <ClipboardList size={20} />
              Test Orders
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cpc-workflow" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Activity size={20} />
              CPC Workflow
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/batches" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Layers size={20} />
              Batches
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
