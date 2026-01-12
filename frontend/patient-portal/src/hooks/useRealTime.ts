import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const useRealTime = (token: string | null, logout: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/notifications/stream?token=${token}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'USER_STATUS_CHANGED' && data.active === false) {
        Swal.fire({
          icon: 'error',
          title: 'Account Suspended',
          text: 'Your account has been suspended by the administrator. You will be logged out.',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then(() => {
          logout();
          navigate('/login');
        });
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token, logout, navigate]);

  useEffect(() => {
    if (!token) return;

    const globalStreamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/notifications/global-stream?token=${token}`;
    const globalSource = new EventSource(globalStreamUrl);

    globalSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'NOTIFICATION') {
        const { notification } = data;
        
        // Show a "push" notification via Swal toast
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        Toast.fire({
          icon: 'info',
          title: notification.title,
          text: notification.message
        });
      }
    };

    return () => {
      globalSource.close();
    };
  }, [token]);
};
