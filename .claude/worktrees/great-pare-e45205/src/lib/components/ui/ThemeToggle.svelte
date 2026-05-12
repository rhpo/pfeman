<script lang="ts">
  import { onMount } from "svelte";
  import { Moon, Sun } from "lucide-svelte";
  import { setupTheme, theme, toggleTheme } from "$lib/stores/theme";
  import { scale } from "svelte/transition";

  onMount(() => {
    setupTheme();
  });
</script>

<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
  {#if $theme === "dark"}
    <div class="icon" transition:scale>
      <Sun size="24" />
    </div>
  {:else}
    <div class="icon" transition:scale>
      <Moon size="24" />
    </div>
  {/if}

  <div class="icon hidden" transition:scale>
    <Moon size="24" />
  </div>
</button>

<style>
  .theme-toggle {
    color: inherit;

    /* position: fixed;
    left: 2rem;
    bottom: 2rem; */

    z-index: 1000;
    background: var(--background-secondary);
    border: 1px solid var(--border);
    border-radius: 50px;
    width: 50px;
    height: 50px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-normal);
    box-shadow: 0 4px 12px rgba(var(--shadow-color-rgb), 0.1);

    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 24px rgba(var(--shadow-color-rgb), 0.15);
    }

    &:active {
      transform: scale(0.8);
    }

    .icon {
      position: absolute;

      &.hidden {
        opacity: 0;
      }
    }
  }

  @media (max-width: 768px) {
    .theme-toggle {
      right: 1rem;
      padding: 0.5rem;
    }
  }
</style>
