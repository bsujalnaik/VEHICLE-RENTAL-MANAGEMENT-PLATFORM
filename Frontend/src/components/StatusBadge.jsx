const StatusBadge = ({ status }) => {
  const map = {
    Booked:      { cls: 'badge-primary', icon: '•' },
    Active:      { cls: 'badge-success', icon: '•' },
    Completed:   { cls: 'badge-gray',   icon: '•' },
    Cancelled:   { cls: 'badge-danger', icon: '•' },
    Pending:     { cls: 'badge-warning',icon: '•' },
    Maintenance: { cls: 'badge-warning',icon: '•' },
    Available:   { cls: 'badge-success',icon: '•' },
    Unavailable: { cls: 'badge-danger', icon: '•' },
  };
  const { cls, icon } = map[status] || { cls: 'badge-gray', icon: '•' };
  return (
    <span className={`badge ${cls}`}>
      {icon} {status}
    </span>
  );
};

export default StatusBadge;
