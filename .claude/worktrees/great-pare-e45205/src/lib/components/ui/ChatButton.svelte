<script lang="ts">
	import { ArrowDown, MessageCircle } from 'lucide-svelte';

	// when mounted, replace the #chatbase-bubble-button with this self component
	let isOpen = $state(false);

	let chatButton: HTMLButtonElement | null = $state(null);
	let customButton: HTMLButtonElement | null = $state(null);

	var tries = 0;
	var maxTries = 10;

	function tryBind() {
		if (tries >= maxTries) {
			console.warn('Chat button not found after maximum attempts');
			return;
		}

		// Try to find the chat button
		chatButton = document.querySelector('#chatbase-bubble-button') as HTMLButtonElement;

		if (!chatButton) {
			console.log('Chat button not found, retrying...');
			tries++;
			setTimeout(tryBind, 500); // Retry after 500ms
		}
	}
	$effect(() => {
		// wait until a button with id #chatbase-bubble-button is available
		tryBind();
	});

	function toggleChat() {
		if (chatButton) {
			chatButton.click();
			isOpen = !isOpen;
		}
	}
</script>

<button
	class="chat-toggle bounce"
	onclick={toggleChat}
	aria-label="Toggle chat"
	bind:this={customButton}
	class:open={isOpen}
>
	{#if isOpen}
		<ArrowDown />
	{:else}
		<MessageCircle />
	{/if}

	IA
</button>

<style>
	.chat-toggle {
		color: var(--text-primary);
		position: fixed;
		right: 2rem;
		bottom: 2rem;
		z-index: 999999999;
		background: var(--background-secondary);
		border: 2px solid var(--border);
		border-radius: 50px;
		height: 50px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all var(--transition-normal);
		box-shadow: 0 4px 12px rgba(var(--shadow-color-rgb), 0.1);

		display: flex;
		justify-content: center;
		align-items: center;

		gap: 0.5rem;
	}

	.chat-toggle.open {
		background: var(--primary);
		color: var(--white);
		transform: translateY(15px);
	}

	.chat-toggle:hover {
		box-shadow: 0 8px 24px rgba(var(--shadow-color-rgb), 0.15);
	}

	.chat-toggle:not(.open):hover {
		transform: scale(1.1);
	}

	@media (max-width: 768px) {
		.chat-toggle {
			right: 1rem;
			padding: 0.5rem;
		}
	}
</style>
