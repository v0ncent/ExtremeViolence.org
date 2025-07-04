<script lang="ts">
	import '$lib/scss/global.scss';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { AdminService } from '$lib/services/adminService';

	export let data: LayoutData;

	onMount(async () => {
		// Initialize auth store with session data from server
		const session = data?.session as any;
		if (session?.user) {
			// Check admin status
			const isAdmin = await AdminService.checkAdminStatus(session.user.email);

			auth.setUser({
				id: session.user.id || session.user.email || '',
				email: session.user.email || '',
				name: session.user.name || '',
				image: session.user.image || undefined,
				provider: session.provider || 'google',
				isAdmin
			});
		} else {
			// If no server session, try to get from client
			auth.initialize();
		}
	});
</script>

<slot />
