<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { createEventDispatcher } from 'svelte';

	export let fallback: string = 'Access denied. Admin privileges required.';

	const dispatch = createEventDispatcher();

	$: if ($auth.user && !$auth.user.isAdmin) {
		dispatch('unauthorized');
	}
</script>

{#if $auth.user?.isAdmin}
	<slot />
{:else if $auth.user}
	<div class="admin-guard">
		<p>{fallback}</p>
	</div>
{:else}
	<div class="admin-guard">
		<p>Please log in to access this feature.</p>
		<a href="/login" class="login-link">Login</a>
	</div>
{/if}

<style lang="scss">
	.admin-guard {
		text-align: center;
		padding: 2rem;
		color: var(--color--text-muted);

		.login-link {
			color: var(--color--accent);
			text-decoration: none;
			font-weight: 500;

			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
