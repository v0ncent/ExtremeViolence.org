<script lang="ts">
	import '$lib/scss/global.scss';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		auth.initialize();
	});
</script>

<slot />
