<footer>
	<div class="content">
		<div class="section">
			<a href="/News" class="button">News</a>
			<a href="/Gallery" class="button">Gallery</a>
			<a href="/Comics" class="button">Comics</a>
			<a href="/About" class="button">About</a>
		</div>

		<div class="section">
			<a href="/contact" class="button">Contact</a>
		</div>

		<div class="section">
			<a href="https://ko-fi.com/v0ncent" class="button">Donate</a>
			<a href="https://github.com/v0ncent/ExtremeViolence.org" target="_blank" class="button"
				>This Site's Source Code</a
			>
		</div>
	</div>
</footer>

<style lang="scss">
	footer {
		width: 100%;
		background: linear-gradient(60deg, var(--color--waves-start) 0%, var(--color--waves-end) 100%);
		display: flex;
		flex-direction: column;
		padding: 2rem;

		.content {
			display: flex;
			justify-content: space-around;
			text-align: center;
			margin-bottom: 1rem;

			.section {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;

				h3 {
					margin-bottom: 0.5rem;
					font-weight: bold;
				}

				a {
					color: inherit;
					text-decoration: none;
					font-weight: 500;

					&:hover {
						filter: drop-shadow(0px 0px 3px var(--color--primary));
					}
				}

				.button {
					padding: 0.5rem 1rem;
					background-color: var(--color--primary);
					color: white;
					border-radius: 8px;
					font-weight: bold;
					transition: 0.3s;

					&:hover {
						background-color: var(--color--primary-dark);
						filter: drop-shadow(0px 0px 5px var(--color--primary));
					}
				}
			}
		}

		.bottom {
			display: flex;
			justify-content: center;

			.socials {
				display: flex;
				align-items: center;
				gap: 20px;
			}
		}
	}
</style>
