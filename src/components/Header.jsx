import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Format the path to display as title
  const getPageTitle = (path) => {
    const name = path.replace('/', '').replace('-', ' ');
    if (!name) return 'Dashboard';
    
    // Title case the string, treating CPC specially
    return name.split(' ').map(word => {
      if (word.toLowerCase() === 'cpc') return 'CPC';
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  return (
    <header className="top-header">
      <div className="header-title">
        {getPageTitle(location.pathname)}
      </div>
      
      <div className="user-profile">
        <div className="user-info">
          <span className="user-name">Dr. Sarah Chen</span>
          <span className="user-role">Lead Pathologist</span>
        </div>
        <div className="avatar">
          SC
        </div>
      </div>
    </header>
  );
};

export default Header;
