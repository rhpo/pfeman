<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    type?: "primary" | "secondary" | "error";
    href?: string;
    label?: string;
    autoWidth?: boolean;
    backgroundColor?: string;
    textColor?: string;
    Icon?: any;
    onClick?: () => void;
    children?: Snippet;
    selected?: boolean;
    [key: string]: any;
  }

  let {
    type = "primary",
    href = "",
    label = "",
    backgroundColor = "var(--color-accent)",
    textColor = "var(--color-gray-100)",
    autoWidth = false,
    Icon,
    onClick = () => {},
    selected = false,
    children,
    ...rest
  }: Props = $props();
</script>

{#if href}
  <a
    class="button"
    aria-label={label}
    class:auto-width={autoWidth}
    {href}
    style="--background:{backgroundColor};--text:{textColor};"
    class:selected
    {...rest}
  >
    {@render children?.()}

    {#if Icon}
      <Icon />
    {/if}
  </a>
{:else}
  <button
    class="button {type}"
    aria-label={label}
    class:auto-width={autoWidth}
    onclick={onClick}
    style="--background:{backgroundColor};--text:{textColor};"
    class:selected
    {...rest}
  >
    {@render children?.()}

    {#if Icon}
      <Icon size={14} />
    {/if}

    {label}
  </button>
{/if}

<style>
  :root {
    --border-icon: 2px;
    --padding-icon: calc(1rem - var(--border-icon));
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: var(--space-2);

    cursor: pointer;
    text-decoration: none;

    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);

    position: relative;
    color: var(--color-text-primary);
    border-radius: var(--radius-md);
    background-color: var(--background);

    transition: all var(--transition-normal);
  }

  .button:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  .button:active {
    transform: translateY(1px);
    opacity: 0.8;
  }

  .button.primary {
    border: var(--border-icon) solid var(--background);
  }

  .button.selected {
    background: var(--primary) !important;
    color: var(--primary) !important;
    transform: scale(1.05) rotate(5deg) translateY(-1px);
    border: var(--border-icon) solid var(--primary) !important;
  }

  .button.selected :global(svg) {
    fill: var(--white) !important;
    transform: scale(1.2);
    transition: all var(--transition-normal);
  }

  .button.selected:hover {
    background: var(--primary);
    color: var(--white) !important;
    transform: scale(1.05) rotate(5deg) translateY(-1px);
  }

  .button.secondary {
    background: transparent;
    color: var(--background);
    border: 2px solid var(--background);
  }

  .button.error {
    background: var(--error);
    color: var(--white);
  }

  .button.error:hover {
    background: var(--error-dark);
    color: var(--white);
  }

  /*
	@media screen and (max-width: 768px) {
		.button.selected {
		}
	} */
</style>
