<script lang="ts">
  import "$lib/styles/app.css";

  import AOS from "aos";
  import "aos/dist/aos.css";

  import { onMount } from "svelte";
  import { BRAND } from "$lib/constants/branding";

  import favicon from "$lib/assets/favicon.svg";
  import NavigationBar from "$lib/components/NavigationBar.svelte";

  let { children } = $props();

  onMount(() => {
    AOS.init();
  });
</script>

<svelte:head>
  <title>
    {BRAND.name} - Main page
  </title>

  <link rel="icon" href={favicon} />
</svelte:head>

<NavigationBar />

{@render children()}
