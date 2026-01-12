import { useEffect } from 'react';
import Swal from 'sweetalert2';

export const useRealTime = (token: string | null) => {
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
