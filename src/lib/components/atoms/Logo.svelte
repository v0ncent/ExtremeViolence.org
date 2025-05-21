<script lang="ts">
	export let src: string;
	export let alt: string = 'Site logo';
	export let height: string = '28px'; // default height, override if needed
</script>

<div class="logo">
	<img src={src} alt={alt} class="logo-image" />
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.logo {
		align-items: left;
		justify-content: left;
		gap: 19px;
		height: 100%;

		@include for-phone-only {
			gap: 8px;
		}
	}

	.logo-image {
		height: var(--logo-height, 450px);
		max-height: 300%;
		width: auto;
		display: block;
	}
</style>
