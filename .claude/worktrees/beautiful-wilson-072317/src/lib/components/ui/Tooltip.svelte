<script lang="ts">
    import tooltip from "svelte-tippy";
    import "tippy.js/dist/tippy.css";

    import type { SvelteComponent } from "svelte";

    let {
        text = "",
        Icon = null,
        position = "top",
        onFocusHide = false,
        color = "rgba(0,0,0,0.8)",
        children,
    }: {
        text?: string;
        Icon?: typeof SvelteComponent | null;
        position?: "top" | "bottom" | "left" | "right";
        onFocusHide?: boolean;
        color?: string;
        children?: any;
    } = $props();

    let visible = $state(true);
</script>

{#if !visible}
    {@render children?.()}
{:else}
    <div class="wrapper">
        <div
            class="main"
            use:tooltip={{
                content: text,
                placement: position,
            }}
        >
            {#if Icon}
                <Icon size={16} />
            {/if}
            {@render children?.()}
        </div>
    </div>
{/if}

<style>
</style>
