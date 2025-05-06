<script lang="ts">
	import Image from '$lib/components/atoms/Image.svelte';

	let photoSrc = 'images/GarfieldCharacter.webp';
</script>

<section class="about-container">
	<div class="photo-wrapper">
		<Image
			src={photoSrc}
			alt="Portrait of Vincent Banks"
			formats={['avif', 'webp', 'png']}
			widths={['250']}
		/>
	</div>

	<div class="bio-text">
		<h1>About Me</h1>
		<p>
      penispenispeenisneinsijdajsdkjas;kldjklasjflhshafsalkjfl;kasjfkljaslk;fjsa;lk
		</p>
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
	width: 250px;
	height: 250px;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
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
