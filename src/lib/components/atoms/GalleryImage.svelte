<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation'; // Optional if you want to handle navigation in a function

	export let src: string;
	export let alt: string;
	export let fullBleed: boolean | undefined = undefined;

	export let formats: string[] = ['avif', 'webp', 'png'];
	export let widths: string[] | undefined = undefined;

	export let link: string | undefined = undefined;

	$: fileName = src.split('.')[0];

	function buildSrcset() {
		if (dev) return;

		let srcset = '';

		if (widths) {
			for (let i = 0; i < widths.length; i++) {
				srcset += `${fileName}-${widths[i]}.${formats[0]} ${widths[i]}w`;

				if (i < widths.length - 1) {
					srcset += ', ';
				}
			}
		} else {
			for (let i = 0; i < formats.length; i++) {
				srcset += `${fileName}.${formats[i]}`;

				if (i < formats.length - 1) {
					srcset += ', ';
				}
			}
		}

		return srcset;
	}
</script>

{#if link}
	<a href={link}>
		<img
			srcset={buildSrcset()}
			{src}
			{alt}
			loading="lazy"
			decoding="async"
			class:full-bleed={fullBleed}
		/>
	</a>
{:else}
	<img
		srcset={buildSrcset()}
		{src}
		{alt}
		loading="lazy"
		decoding="async"
		class:full-bleed={fullBleed}
	/>
{/if}

<style lang="scss">
	img {
		display: block;
		width: auto;
		height: auto;
		max-width: none;
	}

	a {
		display: block;
		text-decoration: none;
	}
</style>
