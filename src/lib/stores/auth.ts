import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: 'google' | 'github';
    isAdmin: boolean;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<{
        user: User | null;
        loading: boolean;
        error: string | null;
    }>({
        user: null,
        loading: true,
        error: null
    });

    return {
        subscribe,
        setUser: (user: User | null) => {
            update(state => ({ ...state, user, loading: false }));
        },
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },
        setError: (error: string | null) => {
            update(state => ({ ...state, error }));
        },
        logout: () => {
            set({ user: null, loading: false, error: null });
        },
        initialize: async () => {
            if (!browser) return;

            try {
                // Fetch session data from the auth API endpoint
                const response = await fetch('/api/auth/session');
                const session = await response.json();

                if (session?.user) {
                    const user: User = {
                        id: session.user.id || session.user.email || '',
                        email: session.user.email || '',
                        name: session.user.name || '',
                        image: session.user.image || undefined,
                        provider: session.provider || 'google',
                        isAdmin: false // You can implement admin check logic here
                    };
                    set({ user, loading: false, error: null });
                } else {
                    set({ user: null, loading: false, error: null });
                }
            } catch (error) {
                set({ user: null, loading: false, error: 'Failed to initialize auth' });
            }
        }
    };
}

export const auth = createAuthStore(); 