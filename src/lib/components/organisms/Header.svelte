<script lang="ts">
	import Logo from '$lib/components/atoms/Logo.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { auth } from '$lib/stores/auth';
	import { signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let showBackground = false;

	let dropdownOpen = false;

	onMount(() => {
		// Initialize auth store
		auth.initialize();
	});

	async function handleSignOut() {
		await signOut({ callbackUrl: '/' });
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	function goToProfile() {
		closeDropdown();
		goto('/profile');
	}
</script>

<header class:has-background={showBackground}>
	<nav class="container">
		<a class="logo" href="/" aria-label="Site logo">
			<Logo src="/images/site-assets/El-Logo-B.png" alt="Extreme Violence Logo" />
		</a>
		<div class="links">
			{#if $auth.user}
				<div
					class="user-profile"
					on:click={toggleDropdown}
					on:keydown={(e) => e.key === 'Enter' && toggleDropdown()}
					tabindex="0"
					role="button"
					aria-label="User profile menu"
				>
					<div class="profile-info">
						{#if $auth.user.image}
							<img src={$auth.user.image} alt="Profile" class="profile-image" />
						{:else}
							<div class="profile-placeholder">
								{$auth.user.name?.charAt(0) || $auth.user.email?.charAt(0) || 'U'}
							</div>
						{/if}
						<span class="user-name">{$auth.user.name || $auth.user.email}</span>
					</div>

					{#if dropdownOpen}
						<div class="dropdown-menu" on:click|stopPropagation>
							<div class="user-info">
								<span class="user-name">{$auth.user.name || $auth.user.email}</span>
								<span class="user-role {$auth.user.isAdmin ? 'admin' : 'user'}">
									{$auth.user.isAdmin ? 'Administrator' : 'User'}
								</span>
							</div>
							<button class="dropdown-item" on:click={goToProfile}> Profile </button>
							{#if $auth.user.isAdmin}
								<div class="admin-links">
									<a href="/create-post" class="dropdown-item admin-link">Create Post</a>
									<a href="/create-comic" class="dropdown-item admin-link">Create Comic</a>
									<a href="/create-gallery-post" class="dropdown-item admin-link">Create Gallery</a>
								</div>
							{/if}
							<button class="dropdown-item" on:click={handleSignOut}> Sign Out </button>
						</div>
					{/if}
				</div>
			{:else}
				<a href="/login">
					<Button color="primary" size="small" style="solid">Login</Button>
				</a>
			{/if}
		</div>
	</nav>
</header>

<!-- Click outside to close dropdown -->
{#if dropdownOpen}
	<div class="dropdown-overlay" on:click={closeDropdown} />
{/if}

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	header {
		position: relative;
		height: 200px;
		display: flex;
		align-items: center;

		@include for-phone-only {
			height: auto;
			padding: 20px 0;
		}

		&.has-background {
			background: linear-gradient(
				60deg,
				var(--color--waves-start) 0%,
				var(--color--waves-end) 100%
			);
		}

		.container {
			display: flex;
			align-items: left;
			justify-content: space-between;
			gap: 30px;
			width: 100%;

			@include for-phone-only {
				.links {
					a {
						display: none;
					}
				}
			}
		}

		.logo {
			flex: 1;
			display: flex;
			align-items: center;
		}

		a {
			color: var(--color--text);
		}

		.links {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 30px;

			a {
				text-decoration: none;

				&:hover {
					color: var(--color--primary);
					filter: drop-shadow(0px 0px 3px var(--color--primary));
				}
			}
		}
	}

	.user-profile {
		position: relative;
		cursor: pointer;
		user-select: none;

		.profile-info {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			padding: 0.5rem;
			border-radius: 8px;
			transition: background-color 0.2s ease;

			&:hover {
				background: rgba(255, 255, 255, 0.1);
			}

			.profile-image {
				width: 32px;
				height: 32px;
				border-radius: 50%;
				object-fit: cover;
				border: 2px solid var(--color--primary);
			}

			.profile-placeholder {
				width: 32px;
				height: 32px;
				border-radius: 50%;
				background: var(--color--primary);
				color: white;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: 600;
				font-size: 0.875rem;
				border: 2px solid var(--color--primary);
			}

			.user-name {
				font-weight: 500;
				color: var(--color--text);
				max-width: 150px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				@include for-phone-only {
					display: none;
				}
			}
		}

		.dropdown-menu {
			position: absolute;
			top: 100%;
			right: 0;
			background: var(--color--card-background);
			border: 1px solid var(--color--border);
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			min-width: 200px;
			z-index: 1000;
			margin-top: 0.5rem;
			padding: 0.5rem 0;

			.user-info {
				padding: 0.75rem 1rem;
				border-bottom: 1px solid var(--color--border);
				margin-bottom: 0.5rem;

				.user-name {
					display: block;
					font-weight: 600;
					color: var(--color--text);
					font-size: 0.875rem;
					margin-bottom: 0.25rem;
				}

				.user-role {
					display: inline-block;
					padding: 0.25rem 0.5rem;
					border-radius: 4px;
					font-size: 0.75rem;
					font-weight: 500;
					text-transform: uppercase;

					&.admin {
						background: var(--color--success);
						color: white;
					}

					&.user {
						background: var(--color--text-muted);
						color: white;
					}
				}
			}

			.dropdown-item {
				width: 100%;
				padding: 0.75rem 1rem;
				background: none;
				border: none;
				text-align: left;
				cursor: pointer;
				color: var(--color--text);
				font-size: 0.875rem;
				transition: background-color 0.2s ease;
				text-decoration: none;
				display: block;

				&:hover {
					background: var(--color--primary);
					color: white;
				}

				&.admin-link {
					color: var(--color--accent);
					font-weight: 500;

					&:hover {
						background: var(--color--accent);
						color: white;
					}
				}
			}

			.admin-links {
				border-top: 1px solid var(--color--border);
				border-bottom: 1px solid var(--color--border);
				margin: 0.5rem 0;
				padding: 0.5rem 0;
			}
		}
	}

	.dropdown-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
	}
</style>
