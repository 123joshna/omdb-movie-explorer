import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CenteredAlert() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const { message = '', timeout = 3000 } = (e && e.detail) || {};
      const id = Date.now();
      setAlert({ id, message });

      setTimeout(() => {
        setAlert((a) => (a && a.id === id ? null : a));
      }, timeout);
    };

    window.addEventListener('center-alert', handler);
    return () => window.removeEventListener('center-alert', handler);
  }, []);

  if (!alert) return null;

  const content = (
    <div className="center-alert-overlay" role="status" aria-live="polite">
      <div className="center-alert">
        <div className="center-alert-message">{alert.message}</div>
        <button className="center-alert-close" onClick={() => setAlert(null)} aria-label="Close">×</button>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }

  return content;
}
