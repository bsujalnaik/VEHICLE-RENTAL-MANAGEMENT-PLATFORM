import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  // Roles: customer, admin, fleet_manager
  const [role, setRole] = useState('customer');
  const [user, setUser] = useState({ name: 'John Doe', role: 'customer' });

  const switchRole = (newRole) => {
    setRole(newRole);
    // Mock user update
    const names = { customer: 'John Doe', admin: 'Admin Agent', fleet_manager: 'Fleet Master' };
    setUser({ name: names[newRole], role: newRole });
  };

  return (
    <RoleContext.Provider value={{ role, user, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
