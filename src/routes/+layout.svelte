<script>
	import '$lib/scss/global.scss';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { AdminService } from '$lib/services/adminService';

	onMount(async () => {
		// Check if user is logged in and verify admin status
		if ($auth.user) {
			const isAdmin = await AdminService.checkIfAdmin($auth.user.email);
			if (isAdmin !== $auth.user.isAdmin) {
				auth.setUser({ ...$auth.user, isAdmin });
			}
		}
	});
</script>

<slot />
