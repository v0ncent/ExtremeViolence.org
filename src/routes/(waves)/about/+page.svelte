<script lang="ts">
	import Image from '$lib/components/atoms/Image.svelte';
	import { title } from '$lib/data/meta';

	let photoSrc = 'images/site-assets/Self-Portrait-GOOD.jpg';
</script>

<svelte:head>
	<title>About - {title}</title>
	<meta name="description" content="About Vincent Banks - Artist behind Extreme Violence" />
</svelte:head>

<section class="about-container">
	<div class="photo-wrapper">
		<Image
			src={photoSrc}
			alt="Portrait of Vincent Banks"
			formats={['avif', 'webp', 'png']}
			widths={['400']}
		/>
	</div>

	<div class="bio-text">
		<h1>About Me</h1>
		<p>My name is Vincent Banks, I draw romance and macabre.</p>
		<p>I am hoping to cultivate a movement of art like mine that I call Extreme Violence.</p>
		<p>Please enjoy the site.</p>
	</div>
</section>

<style lang="scss">
	.about-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 48px;
		gap: 48px;

		@media (max-width: 768px) {
			flex-direction: column;
			padding: 24px;
		}
	}

	.photo-wrapper {
		flex-shrink: 0;
		width: 400px;
		height: 400px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.bio-text {
		max-width: 600px;
		h1 {
			font-size: 2rem;
			margin-bottom: 16px;
		}
		p {
			font-size: 1.125rem;
			line-height: 1.7;
		}
	}
</style>
