import React from 'react';
import { useSignalEffect } from '@preact/signals-react';
import { toasts, removeToast } from '../../../modules/Store/ToastStore';
import './toast.css';

const ToastContainer = () => {
  const [visibleToasts, setVisibleToasts] = React.useState(toasts.value);

  useSignalEffect(() => {
    setVisibleToasts(toasts.value);
  });

  return (
    <div className="toast-container">
      {visibleToasts.map(({ id, type, message }) => (
        <div key={id} className={`toast toast-${type}`}>
          <span>{message}</span>
          <button className="toast-close" onClick={() => removeToast(id)}>&times;</button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;