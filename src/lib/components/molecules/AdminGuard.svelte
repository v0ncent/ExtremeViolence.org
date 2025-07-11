<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	export let fallback: string = '';

	let isAdmin = false;

	onMount(() => {
		// Subscribe to auth store to get admin status
		const unsubscribe = auth.subscribe((state) => {
			isAdmin = state.user?.isAdmin || false;
		});

		return unsubscribe;
	});
</script>

{#if isAdmin}
	<slot />
{:else if fallback}
	<div class="fallback">
		{fallback}
	</div>
{/if}

<style>
	.fallback {
		color: var(--color--text-muted);
		font-style: italic;
		font-size: 0.875rem;
	}
</style>
