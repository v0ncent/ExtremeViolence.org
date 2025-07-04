import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
    // For now, return empty session data
    // The session will be loaded client-side via the API endpoint
    // This avoids issues with Auth.js session handling on the server side
    return {
        session: null
    };
}; 