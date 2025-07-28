import { useState, useEffect } from 'react';

export const useAdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
  };

  return {
    collapsed,
    toggleCollapsed,
    setCollapsed
  };
}; 