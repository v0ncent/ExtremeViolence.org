<script lang="ts">
	import '$lib/scss/global.scss';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { AdminService } from '$lib/services/adminService';
	import BannedUserGuard from '$lib/components/molecules/BannedUserGuard.svelte';

	export let data: LayoutData;

	onMount(async () => {
		// Initialize auth store with session data from server
		const session = data?.session as any;
		if (session?.user) {
			// Check admin status
			const isAdmin = await AdminService.checkAdminStatus(session.user.email);

			// Check if user is banned
			let isBanned = false;
			try {
				const bannedResponse = await fetch(
					`http://localhost:8080/bannedUsers/get/email/${session.user.email}`
				);
				isBanned = bannedResponse.ok;
			} catch (e) {
				// If banned users API is unreachable, assume not banned
				isBanned = false;
			}

			auth.setUser({
				id: session.user.id || session.user.email || '',
				email: session.user.email || '',
				name: session.user.name || '',
				image: session.user.image || undefined,
				provider: session.provider || 'google',
				isAdmin,
				banned: isBanned,
				userName: session.user.userName || session.user.email?.split('@')[0] || '',
				imagePath: session.user.imagePath || session.user.image || '',
				userId: session.user.userId || session.user.id || session.user.email || ''
			});
		} else {
			// If no server session, try to get from client
			auth.initialize();
		}
	});
</script>

<BannedUserGuard>
	<slot />
</BannedUserGuard>
