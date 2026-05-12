<script>
	export let value = 0.0;
	export let max = 5;
</script>

<div class="stars">
	{#each Array(max) as _, i}
		<span class="star" class:filled={i < value}>★</span>
	{/each}
</div>

<style>
	.star {
		color: gray;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.star.filled {
		color: var(--primary);
	}
</style>
