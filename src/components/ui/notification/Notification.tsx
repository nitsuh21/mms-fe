import { useState, useEffect } from 'react';
import { Alert } from '../alert/Alert';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function Notification({ notification }: { notification: NotificationProps }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {show && (
        <Alert
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      )}
    </div>
  );
}
