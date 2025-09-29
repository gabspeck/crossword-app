<script lang="ts">
	import { getGameContext } from '$lib/context.svelte';
	import { goToClue } from '$lib/movement';

	const ctx = getGameContext();

	const censor = $derived(ctx.derived.paused && !ctx.derived.solved);

	$effect(() => {
		if (ctx.derived.currentClue) {
			for (let e of document.getElementsByClassName('focused-clue')) {
				e.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});

</script>

<div class="flex-1 lg:flex flex-col lg:flex-row">
	{#each ['across', 'down'] as direction}
		<div class="flex-1 flex flex-col min-h-0 lg:flex-row">
			<div class="flex-1 flex flex-col min-h-0">
				<h3 class="border-b-2 text-left uppercase font-bold">{direction}</h3>
				<ul class="flex-1 overflow-y-auto">
					{#each ctx.state.puzzle.clues.filter((c) => c.direction === direction) as clue}
						<li
							onkeydown={() => {}}
							role="menuitem"
							onclick={() => goToClue(ctx, clue)}
							class="py-1 flex items-center border-l-8 cursor-pointer border-transparent pl-1"
							class:focused-clue={ctx.derived.currentClue === clue || clue.tiles.includes(ctx.state.currentTileIndex)}
							class:bg-[#a7d8ff]={ctx.derived.currentClue === clue}
							class:border-l-[#a7d8ff]={clue.tiles.includes(ctx.state.currentTileIndex)}
							class:text-[#98a2a9]={clue.tiles.every(
																		(t) => !ctx.state.tiles[t].isBlank && !!ctx.state.tiles[t].guess
																)}
						>
							<span class="min-w-6 text-right font-bold mr-2">{clue.number}</span>
							<span
								class:bg-[#98a2a9]={censor}
								class:text-[#98a2a9]={censor}
								class:select-none={censor}>{clue.prompt}</span
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/each}
</div>
