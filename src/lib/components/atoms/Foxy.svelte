<script lang="ts">
	import { onMount } from 'svelte';

	let showJumpscare = false;
	let audio: HTMLAudioElement;
	let pixelStyle = '';

	onMount(() => {
		audio = new Audio();
		audio.volume = 1; // Set volume to 100%
		audio.src = '/audio/jumpscare-sound.mp3';

		// Randomize pixel position within the viewport (leaving a margin)
		const margin = 30;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const size = 20;
		const left = Math.random() * (vw - size - margin * 2) + margin;
		const top = Math.random() * (vh - size - margin * 2) + margin;
		pixelStyle = `top: ${top}px; left: ${left}px;`;
	});

	function triggerFoxy() {
		showJumpscare = true;
		if (audio) {
			audio.play().catch((e) => {
				console.log('Audio play failed:', e);
			});
		}
		setTimeout(() => {
			showJumpscare = false;
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		}, 3000);
	}
</script>

<!-- Clickable pixel (stealth mode, random position) -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="foxy-pixel" on:click={triggerFoxy} style={pixelStyle} />

<!-- Jumpscare overlay -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if showJumpscare}
	<div class="jumpscare-overlay" on:click={() => (showJumpscare = false)}>
		<div class="jumpscare-content">
			<img
				src="/images/site-assets/fnaf-foxy-jumpscare.gif"
				alt="FNAF Foxy Jumpscare"
				class="jumpscare-gif"
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	.foxy-pixel {
		position: fixed;
		width: 20px;
		height: 20px;
		background-color: var(--body-background-color);
		border: 1px solid rgba(180, 180, 180, 0.25); /* more visible outline */
		border-radius: 50%;
		cursor: pointer;
		z-index: 1000;
		display: block;
		opacity: 0.3;
		box-shadow: none;
		transition: none;
	}

	.jumpscare-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: transparent;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.jumpscare-content {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;

		.jumpscare-gif {
			width: 100vw;
			height: 100vh;
			object-fit: cover;
		}
	}
</style>
