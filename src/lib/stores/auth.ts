import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AdminService } from '$lib/services/adminService';
import type { User } from 'lucia';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: string;
    isAdmin: boolean;
}

interface AuthState {
    user: AuthUser | null;
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
        setUser: (user: AuthUser) => {
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
                // Get user session from Lucia
                const response = await fetch('/api/auth/user');
                const data = await response.json();

                if (data.user) {
                    // Check admin status
                    const isAdmin = await AdminService.checkAdminStatus(data.user.email);

                    const user: AuthUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        image: data.user.image,
                        provider: data.user.provider,
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