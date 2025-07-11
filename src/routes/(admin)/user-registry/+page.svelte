<script lang="ts">
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import WebsiteTabs from '$lib/components/organisms/WebsiteTabs.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';

	type UserData = {
		_id?: number;
		userId: string;
		email: string;
		authProvider: string;
		isAdmin: boolean;
		banned?: boolean;
		imagePath?: string;
		userName?: string;
		ipAddress?: string;
	};

	let users: UserData[] = [];
	let loading = true;
	let error = '';
	let searchTerm = '';
	let sortBy: 'email' | 'userName' | 'authProvider' | 'isAdmin' | 'banned' = 'email';
	let sortOrder: 'asc' | 'desc' = 'asc';
	let banningUserId: string | null = null;
	let adminEmails: string[] = [];

	// Filtered and sorted users
	$: filteredUsers = users
		.filter(
			(user) =>
				user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(user.userName && user.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
				user.userId.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			// Handle boolean values for isAdmin and banned
			if (sortBy === 'isAdmin') {
				aValue = a.isAdmin ? 'true' : 'false';
				bValue = b.isAdmin ? 'true' : 'false';
			} else if (sortBy === 'banned') {
				aValue = a.banned ? 'true' : 'false';
				bValue = b.banned ? 'true' : 'false';
			}

			// Handle undefined values
			if (aValue === undefined) aValue = '';
			if (bValue === undefined) bValue = '';

			if (sortOrder === 'asc') {
				return aValue.toString().localeCompare(bValue.toString());
			} else {
				return bValue.toString().localeCompare(aValue.toString());
			}
		});

	async function fetchAdminEmails() {
		try {
			const res = await fetch('http://localhost:8080/admin/getall');
			if (!res.ok) throw new Error('Failed to fetch admin emails');
			const data = await res.json();
			if (Array.isArray(data)) {
				adminEmails = data.map((a) => a.email);
			} else {
				adminEmails = [];
			}
		} catch (e) {
			adminEmails = [];
		}
	}

	async function fetchUsers() {
		try {
			loading = true;
			error = '';
			await fetchAdminEmails();
			const response = await fetch('http://localhost:8080/userData/getall');
			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}
			const data = await response.json();
			if (Array.isArray(data)) {
				const usersWithBannedStatus = await Promise.all(
					data.map(async (u) => {
						const user = {
							...u,
							userId: u.userId || u.id || u._id
						};
						// Check if user is banned by email
						try {
							const bannedResponse = await fetch(
								`http://localhost:8080/bannedUsers/get/email/${user.email}`
							);
							user.banned = bannedResponse.ok;
						} catch (e) {
							user.banned = false;
						}
						// Compute isAdmin from adminEmails
						user.isAdmin = adminEmails.includes(user.email);
						return user;
					})
				);
				users = usersWithBannedStatus;
			} else {
				users = [];
			}
		} catch (e) {
			console.error('Error fetching users:', e);
			error = e instanceof Error ? e.message : 'Failed to fetch users';
		} finally {
			loading = false;
		}
	}

	async function banUser(user: UserData) {
		banningUserId = user.userId;
		const body = {
			email: user.email,
			userId: user.userId,
			ipAddress: user.ipAddress || ''
		};
		try {
			const res = await fetch('http://localhost:8080/bannedUsers/createEntry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error('Failed to ban user');
			// If admin bans themselves, sign out and redirect
			if (auth && auth.subscribe) {
				auth.subscribe(($auth) => {
					if ($auth.user && $auth.user.userId === user.userId) {
						auth.signOut().then(() => goto('/login?error=account_banned'));
					}
				});
			}
			await fetchUsers();
		} catch (e) {
			alert('Failed to ban user: ' + (e instanceof Error ? e.message : e));
		} finally {
			banningUserId = null;
		}
	}

	async function unbanUser(user: UserData) {
		banningUserId = user.userId;
		try {
			const res = await fetch(`http://localhost:8080/bannedUsers/delete/userId/${user.userId}`, {
				method: 'DELETE'
			});
			if (!res.ok) throw new Error('Failed to unban user');
			await fetchUsers();
		} catch (e) {
			alert('Failed to unban user: ' + (e instanceof Error ? e.message : e));
		} finally {
			banningUserId = null;
		}
	}

	function toggleSort(field: 'email' | 'userName' | 'authProvider' | 'isAdmin' | 'banned') {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'asc';
		}
	}

	function getSortIcon(field: 'email' | 'userName' | 'authProvider' | 'isAdmin' | 'banned') {
		if (sortBy !== field) return '↕️';
		return sortOrder === 'asc' ? '↑' : '↓';
	}

	onMount(() => {
		const unsubscribe = auth.subscribe(($auth) => {
			if ($auth.initialized && !$auth.loading) {
				if (!$auth.user) {
					goto('/login');
					unsubscribe();
					return;
				}
				if (!$auth.user.isAdmin) {
					goto('/');
					unsubscribe();
					return;
				}
				// Only fetch once, then unsubscribe
				fetchUsers();
				unsubscribe();
			}
		});
	});
</script>

<svelte:head>
	<title>User Registry - Extreme Violence</title>
</svelte:head>

<div class="article-layout">
	<Header showBackground />
	<WebsiteTabs />

	<main>
		<article id="article-content">
			<div class="header">
				<h1>User Registry</h1>
				<p>Manage and view all registered users</p>
			</div>

			<div class="content">
				{#if error}
					<div class="error-message">
						<p>Error: {error}</p>
						<button on:click={fetchUsers}>Retry</button>
					</div>
				{:else}
					<div class="controls">
						<div class="search-box">
							<input
								type="text"
								placeholder="Search by email, username, or user ID..."
								bind:value={searchTerm}
							/>
						</div>

						<div class="stats">
							<span>Total Users: {users.length}</span>
							<span>Admins: {users.filter((u) => String(u.isAdmin) === 'true').length}</span>
							<span>Regular Users: {users.filter((u) => String(u.isAdmin) !== 'true').length}</span>
							<span>Banned: {users.filter((u) => u.banned).length}</span>
						</div>
					</div>

					{#if loading}
						<div class="loading">
							<p>Loading users...</p>
						</div>
					{:else if filteredUsers.length === 0}
						<div class="no-results">
							<p>No users found.</p>
						</div>
					{:else}
						<div class="users-table-container">
							<table class="users-table">
								<thead>
									<tr>
										<th on:click={() => toggleSort('email')} class="sortable">
											Email {getSortIcon('email')}
										</th>
										<th on:click={() => toggleSort('userName')} class="sortable">
											Username {getSortIcon('userName')}
										</th>
										<th on:click={() => toggleSort('authProvider')} class="sortable">
											Provider {getSortIcon('authProvider')}
										</th>
										<th on:click={() => toggleSort('isAdmin')} class="sortable">
											Role {getSortIcon('isAdmin')}
										</th>
										<th on:click={() => toggleSort('banned')} class="sortable">
											Status {getSortIcon('banned')}
										</th>
										<th>User ID</th>
										<th>Profile Image</th>
										<th>Ban</th>
									</tr>
								</thead>
								<tbody>
									{#each filteredUsers as user}
										<tr>
											<td class="email-cell">
												<span class="email">{user.email}</span>
											</td>
											<td class="username-cell">
												<span class="username">{user.userName || 'N/A'}</span>
											</td>
											<td class="provider-cell">
												<span class="provider-badge {user.authProvider}">
													{user.authProvider}
												</span>
											</td>
											<td class="role-cell">
												<span
													class="role-badge {String(user.isAdmin) === 'true' ? 'admin' : 'user'}"
												>
													{String(user.isAdmin) === 'true' ? 'Admin' : 'User'}
												</span>
											</td>
											<td class="status-cell">
												<span class="status-badge {user.banned ? 'banned' : 'active'}">
													{user.banned ? 'Banned' : 'Active'}
												</span>
											</td>
											<td class="userid-cell">
												<code class="userid">{user.userId}</code>
											</td>
											<td class="image-cell">
												{#if user.imagePath}
													<img
														src={user.imagePath}
														alt="Profile"
														class="profile-thumbnail"
														on:error={(e) => {
															const target = e.target;
															if (target && target instanceof HTMLImageElement) {
																target.style.display = 'none';
															}
														}}
													/>
												{:else}
													<div class="profile-placeholder">
														{user.email.charAt(0).toUpperCase()}
													</div>
												{/if}
											</td>
											<td class="ban-cell">
												{#if !user.banned}
													<button
														class="ban-button"
														disabled={banningUserId === user.userId}
														on:click={() => banUser(user)}
													>
														{banningUserId === user.userId ? 'Banning...' : 'Ban'}
													</button>
												{:else}
													<button
														class="unban-button"
														disabled={banningUserId === user.userId}
														on:click={() => unbanUser(user)}
													>
														{banningUserId === user.userId ? 'Unbanning...' : 'Unban'}
													</button>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{/if}
			</div>
		</article>
	</main>

	<Footer />
</div>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	.article-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		padding: 2rem 0;
	}

	#article-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;

		.header {
			margin-bottom: 2rem;
			text-align: center;

			h1 {
				margin: 0 0 0.5rem 0;
				color: var(--color--text);
			}

			p {
				margin: 0;
				color: var(--color--text-muted);
				font-size: 1.1rem;
			}
		}

		.content {
			background: var(--color--card-background);
			border-radius: 12px;
			padding: 2rem;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;

		.search-box {
			flex: 1;
			max-width: 400px;

			input {
				width: 100%;
				padding: 0.75rem 1rem;
				border: 2px solid var(--color--border);
				border-radius: 8px;
				font-size: 1rem;
				background: var(--color--background);
				color: var(--color--text);

				&:focus {
					outline: none;
					border-color: var(--color--primary);
				}
			}
		}

		.stats {
			display: flex;
			gap: 1.5rem;
			font-size: 0.9rem;
			color: var(--color--text-muted);

			span {
				padding: 0.5rem 1rem;
				background: var(--color--background);
				border-radius: 6px;
				border: 1px solid var(--color--border);
			}
		}
	}

	.users-table-container {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid var(--color--border);
	}

	.users-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--color--background);

		thead {
			background: var(--color--card-background);
			border-bottom: 2px solid var(--color--border);

			th {
				padding: 1rem;
				text-align: left;
				font-weight: 600;
				color: var(--color--text);
				font-size: 0.9rem;
				text-transform: uppercase;
				letter-spacing: 0.5px;

				&.sortable {
					cursor: pointer;
					user-select: none;
					transition: background-color 0.2s ease;

					&:hover {
						background: var(--color--primary);
						color: white;
					}
				}
			}
		}

		tbody {
			tr {
				border-bottom: 1px solid var(--color--border);
				transition: background-color 0.2s ease;

				&:hover {
					background: var(--color--card-background);
				}

				&:last-child {
					border-bottom: none;
				}
			}

			td {
				padding: 1rem;
				vertical-align: middle;
			}
		}
	}

	.email-cell {
		.email {
			font-weight: 500;
			color: var(--color--text);
		}
	}

	.username-cell {
		.username {
			color: var(--color--text);
		}
	}

	.provider-cell {
		.provider-badge {
			display: inline-block;
			padding: 0.25rem 0.75rem;
			border-radius: 20px;
			font-size: 0.75rem;
			font-weight: 500;
			text-transform: capitalize;

			&.google {
				background: #4285f4;
				color: white;
			}

			&.github {
				background: #333;
				color: white;
			}

			&.discord {
				background: #5865f2;
				color: white;
			}
		}
	}

	.role-cell {
		.role-badge {
			display: inline-block;
			padding: 0.25rem 0.75rem;
			border-radius: 20px;
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

	.status-cell {
		.status-badge {
			display: inline-block;
			padding: 0.25rem 0.75rem;
			border-radius: 20px;
			font-size: 0.75rem;
			font-weight: 500;
			text-transform: uppercase;

			&.banned {
				background: #dc2626;
				color: white;
			}

			&.active {
				background: #059669;
				color: white;
			}
		}
	}

	.userid-cell {
		.userid {
			font-family: 'Courier New', monospace;
			font-size: 0.8rem;
			color: var(--color--text-muted);
			background: var(--color--background);
			padding: 0.25rem 0.5rem;
			border-radius: 4px;
			border: 1px solid var(--color--border);
		}
	}

	.image-cell {
		.profile-thumbnail {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			object-fit: cover;
			border: 2px solid var(--color--border);
		}

		.profile-placeholder {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: var(--color--primary);
			color: white;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 600;
			font-size: 1rem;
			border: 2px solid var(--color--border);
		}
	}

	.loading,
	.no-results,
	.error-message {
		text-align: center;
		padding: 3rem 2rem;
		color: var(--color--text-muted);
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 8px;
		margin-bottom: 1rem;

		button {
			margin-top: 1rem;
			padding: 0.5rem 1rem;
			background: var(--color--primary);
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;

			&:hover {
				background: var(--color--primary-dark);
			}
		}
	}

	.ban-cell {
		.ban-button {
			background: #dc2626;
			color: white;
			border: none;
			border-radius: 6px;
			padding: 0.5rem 1rem;
			font-size: 0.9rem;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.2s;
			&:hover:not(:disabled) {
				background: #b91c1c;
			}
			&:disabled {
				background: #f87171;
				cursor: not-allowed;
			}
		}
		.unban-button {
			background: #059669;
			color: white;
			border: none;
			border-radius: 6px;
			padding: 0.5rem 1rem;
			font-size: 0.9rem;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.2s;
			&:hover:not(:disabled) {
				background: #047857;
			}
			&:disabled {
				background: #6ee7b7;
				cursor: not-allowed;
			}
		}
		.already-banned {
			color: #aaa;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 768px) {
		#article-content {
			padding: 0 1rem;
		}

		.controls {
			flex-direction: column;
			align-items: stretch;

			.search-box {
				max-width: none;
			}

			.stats {
				justify-content: center;
			}
		}

		.users-table {
			font-size: 0.8rem;

			thead th {
				padding: 0.75rem 0.5rem;
			}

			tbody td {
				padding: 0.75rem 0.5rem;
			}
		}

		.userid {
			font-size: 0.7rem;
		}
	}
</style>
