<script lang="ts">
	import type { Clue } from '$lib';
	import type { GridTile } from '$lib/types';

	type ClueListProps = {
		clues: Clue[];
		onSelectClue: (clue: Clue) => void;
		currentClue: Clue | undefined;
		currentTileIndex: number;
		censor: boolean;
		tiles: GridTile[];
	}

	let { clues, onSelectClue, currentClue, currentTileIndex, censor, tiles }: ClueListProps = $props();

</script>

<div class="flex-1 lg:flex flex-col lg:flex-row">
	{#each ['across', 'down'] as direction}
		<div class="flex-1 flex flex-col min-h-0 lg:flex-row">
			<div class="flex-1 flex flex-col min-h-0">
				<h3 class="border-b-2 text-left uppercase font-bold">{direction}</h3>
				<ul class="flex-1 overflow-y-auto">
					{#each clues.filter((c) => c.direction === direction) as clue}
						<li
							onkeydown={() => {}}
							role="menuitem"
							onclick={() => onSelectClue(clue)}
							class="py-1 flex items-center border-l-8 cursor-pointer border-transparent pl-1"
							class:focused-clue={currentClue === clue || clue.tiles.includes(currentTileIndex)}
							class:bg-[#a7d8ff]={currentClue === clue}
							class:border-l-[#a7d8ff]={clue.tiles.includes(currentTileIndex)}
							class:text-[#98a2a9]={clue.tiles.every(
																		(t) => !tiles[t].isBlank && !!tiles[t].guess
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
