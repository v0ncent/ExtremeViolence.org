import { writable } from 'svelte/store';

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
        }
    };
}

export const auth = createAuthStore(); 