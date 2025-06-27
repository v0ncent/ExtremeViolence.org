<script lang="ts">
	import AdminGuard from '$lib/components/molecules/AdminGuard.svelte';
	import { goto } from '$app/navigation';
</script>

<AdminGuard on:unauthorized={() => goto('/login')}>
	<slot />
</AdminGuard>
