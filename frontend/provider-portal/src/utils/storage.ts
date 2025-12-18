const RECENT_PROVIDERS_KEY = 'medblock_recent_providers';

export interface RecentProvider {
    name: string;
    email: string;
    hospitalName?: string;
    did: string;
    lastLogin: number;
}

export const getRecentProviders = (): RecentProvider[] => {
    try {
        const stored = localStorage.getItem(RECENT_PROVIDERS_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to parse recent providers', error);
        return [];
    }
};

export const addRecentProvider = (provider: Omit<RecentProvider, 'lastLogin'>) => {
    const providers = getRecentProviders();
    // Remove if exists (by email or did)
    const filtered = providers.filter(p => p.email !== provider.email && p.did !== provider.did);
    
    const newProvider = {
        ...provider,
        lastLogin: Date.now()
    };
    
    // Add to top, limit to 3
    const updated = [newProvider, ...filtered].slice(0, 3);
    localStorage.setItem(RECENT_PROVIDERS_KEY, JSON.stringify(updated));
};
