import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AdminService } from '$lib/services/adminService';

export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: string;
    isAdmin: boolean;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    initialized: boolean;
}

const createAuthStore = () => {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        loading: false,
        initialized: false
    });

    return {
        subscribe,
        setUser: (user: User) => {
            update(state => ({ ...state, user, initialized: true }));
        },
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },
        clearUser: () => {
            update(state => ({ ...state, user: null, initialized: true }));
        },
        initialize: async () => {
            update(state => ({ ...state, loading: true }));
            try {
                // Use our custom user session endpoint that calls Auth.js
                const response = await fetch('/api/auth/user-session');
                const session = await response.json();

                if (session?.user) {
                    // Check admin status
                    const isAdmin = await AdminService.checkAdminStatus(session.user.email);

                    const user: User = {
                        id: session.user.id || session.user.email || '',
                        email: session.user.email || '',
                        name: session.user.name || '',
                        image: session.user.image || undefined,
                        provider: session.provider || 'google',
                        isAdmin
                    };

                    update(state => ({ ...state, user, loading: false, initialized: true }));
                } else {
                    update(state => ({ ...state, user: null, loading: false, initialized: true }));
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                update(state => ({ ...state, user: null, loading: false, initialized: true }));
            }
        },
        refreshAdminStatus: async () => {
            update(state => {
                if (state.user) {
                    AdminService.checkAdminStatus(state.user.email).then(isAdmin => {
                        update(s => ({
                            ...s,
                            user: s.user ? { ...s.user, isAdmin } : null
                        }));
                    });
                }
                return state;
            });
        },
        signOut: async () => {
            try {
                await fetch('/auth/signout', { method: 'POST' });
            } catch (error) {
                console.error('Sign out error:', error);
            } finally {
                update(state => ({ ...state, user: null, initialized: true }));
            }
        }
    };
};

export const auth = createAuthStore(); 