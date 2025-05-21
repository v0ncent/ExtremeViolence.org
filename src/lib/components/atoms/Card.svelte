<script lang="ts">
	import { HttpRegex } from '$lib/utils/regex';

	export let additionalClass: string | undefined = undefined;
	export let href: string | undefined = undefined;
	export let withBorder: boolean = true;
	export let textAlign: 'left' | 'center' | 'right' = 'left';

	const isExternalLink = !!href && HttpRegex.test(href);
	export let target: '_self' | '_blank' = isExternalLink ? '_blank' : '_self';
	export let rel = isExternalLink ? 'noopener noreferrer' : undefined;

	$: tag = href ? 'a' : 'article';
	$: linkProps = { href, target, rel };
	$: dynamicClasses = `
		card
		${withBorder ? 'with-border' : 'no-border'}
		text-${textAlign}
		${additionalClass ?? ''}
	`;
</script>

<svelte:element
	this={tag}
	class={dynamicClasses}
	{...linkProps}
	data-sveltekit-preload-data
	{...$$restProps}
>
	{#if $$slots.image}
		<div class="image">
			<slot name="image" />
		</div>
	{/if}
	<div class="body">
		<div class="content">
			<slot name="content" />
		</div>
		{#if $$slots.footer}
			<div class="footer">
				<slot name="footer" />
			</div>
		{/if}
	</div>
</svelte:element>

<style lang="scss">
	.card {
		border-radius: 10px;
		transition: all 0.4s ease;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		text-decoration: none;

		&[href],
		&[onclick] {
			cursor: pointer;
			&:hover {
				box-shadow: var(--card-shadow-hover);
				transform: scale(1.01);
			}
		}
	}

	.with-border {
		background: var(--color--card-background);
		box-shadow: var(--card-shadow);
		color: var(--color--text);
	}

	.no-border {
		background: transparent;
		box-shadow: none;
		color: var(--color--text);
	}

	.text-left .body {
		text-align: left;
		align-items: flex-start;
	}
	.text-center .body {
		text-align: center;
		align-items: center;
	}
	.text-right .body {
		text-align: right;
		align-items: flex-end;
	}

	.body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 10px;
		padding: 20px 20px;
		flex: 1 0 50%;

		.content {
			display: flex;
			flex-direction: column;
			flex: 1;
		}
	}

	.image {
		position: relative;
		flex: 1 0 max(50%, 330px);
		min-height: 280px;
		max-height: 350px;
	}

	:global(.card [slot='image']) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
	}
</style>
