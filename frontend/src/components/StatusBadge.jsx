import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-success/20 text-success',
    rented: 'bg-primary/20 text-primary',
    maintenance: 'bg-admin/20 text-admin',
    booked: 'bg-primary/20 text-primary',
    picked_up: 'bg-blue-500/20 text-blue-400',
    returned: 'bg-warning/20 text-warning',
    closed: 'bg-success/20 text-success',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
