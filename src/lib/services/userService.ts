import type { UserDataModel } from '$lib/utils/types';

const API_BASE_URL = 'http://localhost:8080';

export class UserService {
	// Get user by userId
	static async getUserById(userId: string): Promise<UserDataModel | null> {
		try {
			const response = await fetch(`${API_BASE_URL}/userData/get/userId/${userId}`);
			if (!response.ok) return null;
			return await response.json();
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
		// First try direct lookup
		const user = await this.getUserById(userId);
		if (user) return user;

		// Fallback: get all users and find by userId
		try {
			const allUsers = await this.getAllUsers();
			return allUsers.find((u) => u.userId === userId || u.id === userId) || null;
		} catch (error) {
			console.error('Error in fallback user lookup:', error);
			return null;
		}
	}
}
