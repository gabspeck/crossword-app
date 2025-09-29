<script lang="ts">

	import { advanceClue } from '$lib/movement';
	import { getGameContext } from '$lib/context.svelte';

	const ctx = getGameContext()

</script>

<div class="h-16 px-5 flex bg-[#a7d8ff]">
	<button class="shrink-0 w-8" onclick={() => advanceClue(ctx, -1)}>&lt;</button>
	<div class="flex-1 min-w-0">
		<div class="w-full h-full flex overflow-x-auto">
			<span class="min-w-full my-auto">{ctx.derived.currentClue.prompt}</span>
		</div>
	</div>
	<button class="shrink-0 w-8" onclick={() => advanceClue(ctx, 1)}>&gt;</button>
</div>
