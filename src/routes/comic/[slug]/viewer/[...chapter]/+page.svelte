<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	onMount(() => {
		const { params } = get(page);
		const slug = params.slug;
		const chapter = params.chapter;

		// Redirect to the main viewer route with the chapter as a query parameter
		goto(`/comic/${slug}/viewer?chapter=${chapter}`);
	});
</script>

<div>Redirecting to comic viewer...</div>
