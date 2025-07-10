import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AdminService } from '$lib/services/adminService';
import type { User } from 'lucia';

export interface AuthUser {
    userName: string;
    imagePath: string | undefined;
    userId: any;
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: string;
    isAdmin: boolean;
    banned: boolean;
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

                    // Check if user is banned
                    let isBanned = false;
                    try {
                        const bannedResponse = await fetch(`http://localhost:8080/bannedUsers/get/email/${data.user.email}`);
                        isBanned = bannedResponse.ok;
                    } catch (e) {
                        // If banned users API is unreachable, assume not banned
                        isBanned = false;
                    }

                    const user: AuthUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        image: data.user.image,
                        provider: data.user.provider,
                        isAdmin,
                        banned: isBanned,
                        userName: data.user.userName || '',
                        imagePath: data.user.imagePath || '',
                        userId: data.user.userId || ''
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
        checkBannedStatus: async () => {
            update(state => {
                if (state.user) {
                    fetch(`http://localhost:8080/bannedUsers/get/email/${state.user.email}`)
                        .then(response => {
                            const isBanned = response.ok;
                            update(s => ({
                                ...s,
                                user: s.user ? { ...s.user, banned: isBanned } : null
                            }));
                        })
                        .catch(() => {
                            // If banned users API is unreachable, assume not banned
                            update(s => ({
                                ...s,
                                user: s.user ? { ...s.user, banned: false } : null
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