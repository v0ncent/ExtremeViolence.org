<script lang="ts">
	export let id: string;
	export let title: string;
	export let align: 'left' | 'center' | 'right' | 'top' = 'center';
</script>

<section id={id} class={`content-section align-${align}`}>
	<h2>{title}</h2>
	<slot />
</section>

<style lang="scss">
	.content-section {
		margin-top: 2rem;
		margin-bottom: 2rem;
		padding: 0 1rem;

		&.align-center {
			max-width: 800px;
			margin-left: auto;
			margin-right: auto;
			text-align: center;
		}

		&.align-left {
			max-width: unset; /* remove center constraints */
			margin: 0;
			text-align: left;
		}
	}
</style>