export const APP_NAME = 'MEDBLOCK';

export const PORTAL_URLS = {
    PATIENT: (import.meta as any).env?.VITE_PATIENT_PORTAL_URL || 'http://localhost:3000',
    PROVIDER: (import.meta as any).env?.VITE_PROVIDER_PORTAL_URL || 'http://localhost:3001',
};

export const THEME = {
    colors: {
        primary: '#2563eb', // blue-600
        secondary: '#10b981', // emerald-500
    }
};
