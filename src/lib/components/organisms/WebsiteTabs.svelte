<script lang="ts">
	import TabList from '../molecules/Tabs.svelte';

	const tabs = [
		{ label: 'News', href: '/news' },
		{ label: 'Gallery', href: '/gallery-section' },
		{ label: 'Comics', href: '/comics' },
		{ label: 'About', href: '/about' }
	];
</script>

<section class="tab-nav-container">
	<TabList {tabs} />
</section>

<style>
	.tab-nav-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
