import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toasts, removeToast } = useApp();

  const icons = {
    success: '',
    error: '',
    info: 'ℹ️',
    warning: '️',
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{icons[toast.type] || 'ℹ️'}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1rem', padding: 0 }}
          >
            
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
