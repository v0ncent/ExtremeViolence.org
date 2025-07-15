const API_BASE_URL = 'http://localhost:8080';

export interface AdminUser {
	id: string;
	email: string;
}

interface AdminEmailModel {
	_id: string;
	email: string;
	_class: string;
}

export class AdminService {
	private static readonly ADMIN_API_URL = 'http://localhost:8080/admin/getall';
	private static readonly CLIENT_API_URL = '/api/admin/check-status';

	static async checkAdminStatus(email: string): Promise<boolean> {
		try {
			// Use the server-side endpoint to avoid CORS issues
			const response = await fetch(`${this.CLIENT_API_URL}?email=${encodeURIComponent(email)}`);

			if (!response.ok) {
				console.error('Failed to fetch admin data:', response.statusText);
				return false;
			}

			const data = await response.json();

			if (data.error) {
				console.error('Admin check error:', data.error);
				return false;
			}

			return data.isAdmin;
		} catch (error) {
			console.error('Error checking admin status:', error);
			return false;
		}
	}

	static async refreshAdminStatus(email: string): Promise<boolean> {
		return this.checkAdminStatus(email);
	}

	// Server-side method (used by the API endpoint)
	static async checkAdminStatusServer(email: string): Promise<boolean> {
		try {
			const response = await fetch(this.ADMIN_API_URL);

			if (!response.ok) {
				console.error('Failed to fetch admin data:', response.statusText);
				return false;
			}

			const adminData: AdminEmailModel[] = await response.json();

			// Check if the user's email exists in the admin list
			const isAdmin = adminData.some((admin) => admin.email === email);

			return isAdmin;
		} catch (error) {
			console.error('Error checking admin status:', error);
			return false;
		}
	}
}
