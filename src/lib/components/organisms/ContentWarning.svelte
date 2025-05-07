<!-- src/lib/components/organisms/ContentWarningModal.svelte -->
<script lang="ts">
	export let onAccept: () => void;
</script>

<div class="modal-backdrop">
	<div class="modal">
		<h2>Content Warning</h2>
		<p>This website contains graphic, macabre, and sexually explicit content. Viewer discretion is advised and is not for minors. If such material is not for you, please do not proceed.</p>
		<button on:click={onAccept}>I Understand and Wish to Proceed</button>
	</div>
</div>

<style lang="scss">
.modal-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal {
	background: black;
	padding: 2rem;
	border-radius: 8px;
	max-width: 500px;
	width: 100%;
	text-align: center;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

button {
	margin-top: 1.5rem;
	padding: 0.75rem 1.5rem;
	background-color: white;
	color: black;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}
</style>
