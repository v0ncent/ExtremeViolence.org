import type { UserDataModel } from '$lib/utils/types';

const API_BASE_URL = 'http://localhost:8080';

export class UserService {
	// Get user by userId
	static async getUserById(userId: string): Promise<UserDataModel | null> {
		try {
			// Try the userId endpoint first
			let response = await fetch(`${API_BASE_URL}/userData/get/userId/${userId}`);
			if (response.ok) {
				return await response.json();
			}

			// If that fails, try getting all users and finding by userId
			response = await fetch(`${API_BASE_URL}/userData/getall`);
			if (response.ok) {
				const allUsers = await response.json();
				// Look for user by userId field (custom UUID) or id field (MongoDB ID)
				const user = allUsers.find((u: any) => u.userId === userId || u.id === userId);
				return user || null;
			}

			return null;
		} catch (error) {
			console.error('Error fetching user by ID:', error);
			return null;
		}
	}

	// Get all users (for fallback)
	static async getAllUsers(): Promise<UserDataModel[]> {
		try {
			const response = await fetch(`${API_BASE_URL}/userData/getall`);
			if (!response.ok) return [];
			const data = await response.json();
			return Array.isArray(data) ? data : [];
		} catch (error) {
			console.error('Error fetching all users:', error);
			return [];
		}
	}

	// Get user by userId with fallback to getAllUsers
	static async getUserByIdWithFallback(userId: string): Promise<UserDataModel | null> {
		// getUserById now includes fallback logic and handles both userId and id fields
		return await this.getUserById(userId);
	}
}
