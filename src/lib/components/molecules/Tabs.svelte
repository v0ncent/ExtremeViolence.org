<script lang="ts">
	import TabButton from '../atoms/Tab.svelte';
	export let tabs: { label: string; href: string }[] = [];
</script>

<!-- Full-width wrapper -->
<div class="tab-bar-background">
	<nav class="tab-list">
		{#each tabs as tab}
			<TabButton label={tab.label} href={tab.href} />
		{/each}
	</nav>
</div>

<style>
	.tab-bar-background {
		background: white;
		border-bottom: 2px solid #ccc;
		width: 150vw;
	}

	.tab-list {
		display: flex;
		gap: 12rem;
		justify-content: center;
		max-width: 2000px; /* optional */
		margin: 0 auto; /* center the tabs inside */
	}
</style>
