const API_BASE_URL = 'http://localhost:8080';

export interface AdminUser {
    id: string;
    email: string;
}

export class AdminService {
    static async checkIfAdmin(email: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/get/${encodeURIComponent(email)}`);
            return response.ok;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    static async createAdminEntry(email: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/createEntry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            return response.ok;
        } catch (error) {
            console.error('Error creating admin entry:', error);
            return false;
        }
    }
}
