<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let isBanned = false;
	let loading = true;

	onMount(async () => {
		// Wait for store to be initialized
		await new Promise<void>((resolve) => {
			const unsubInit = auth.subscribe(($auth) => {
				if ($auth.initialized && !$auth.loading) {
					unsubInit();
					resolve();
				}
			});
		});

		// Only check banned status once, after store is initialized
		await auth.checkBannedStatus();

		// Now subscribe to react to banned status
		const unsub = auth.subscribe(($auth) => {
			if ($auth.user?.banned) {
				isBanned = true;
				auth.signOut().then(() => goto('/login?error=account_banned'));
			} else {
				loading = false;
			}
		});
	});
</script>

{#if loading}
	<!-- Show loading state -->
{:else if isBanned}
	<!-- User is banned, redirecting... -->
{:else}
	<slot />
{/if}
