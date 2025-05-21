<script lang="ts">
	export let src: string;
	export let alt: string = 'Site logo';
</script>

<div class="logo">
	<img src={src} alt={alt} class="logo-image" />
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.logo-image {
		height: auto;
		max-height: 125px;
		width: auto;
		display: block;

		@include for-phone-only {
			max-height: 30px;
		}
	}
</style>
