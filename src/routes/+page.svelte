<script lang="ts">

	import { type AnswerTile, type BlankTile, type Clue, type Direction, loadPuzzle } from '$lib';

	type GridTile = | BlankTile | AnswerTile & {
		guess: string,
	}

	type NonBlankTile = Exclude<GridTile, BlankTile>

	const puzzle = loadPuzzle();

	let tiles: GridTile[] = $state(puzzle.tiles.map((t) => {
		return {
			...t,
			guess: ''
		};
	}));

	let currentDirection: Direction = $state('across');
	let currentTileIndex: number = $state(puzzle.clues.across[0].tiles[0]);
	let currentTile: NonBlankTile = $derived(puzzle.tiles[currentTileIndex]) as NonBlankTile;
	let currentClue: Clue = $derived(puzzle.clues[currentDirection][currentTile.clues[currentDirection]]);

	const onTileKeyDown = (ev: KeyboardEvent, tile: NonBlankTile) => {
		const key = ev.key.toUpperCase();
		if (key.length === 1) {
			tile.guess = key.toUpperCase();
		} else {
			if (key === 'TAB') {
				while(!currentTile.isBlank) {
					currentTileIndex++;
				}
			}
		}
	};

	const onTileClick = ({ currentTarget: tile }: MouseEvent & { currentTarget: HTMLDivElement }) => {
		if (tile !== document.activeElement) {
			tile.focus();
		} else {
			currentDirection = currentDirection === 'across' ? 'down' : 'across';
		}
	};

</script>

<main>
	<div
		tabindex="-1"
		role="grid"
		class="inline-grid grid-cols-{puzzle.dimensions.cols} gap-0 border-[3px] border-black font-['Helvetica']"
	>
		{#each tiles as tile, tileIndex}
			<div
				tabindex={tile.isBlank ? null : 0}
				role="gridcell"
				class="border-[#696969] border-r-[1px] border-b-[1px] w-[33px] h-[33px] focus:outline-none relative"
				class:bg-[#FFDA00]={!tile.isBlank && currentTileIndex === tileIndex}
				class:bg-[#A7D8FF]={!tile.isBlank && currentTile.clues[currentDirection] === tile.clues[currentDirection]}
				class:bg-black={tile.isBlank}
				onmousedown={tile.isBlank ? null : ev => ev.preventDefault()}
				onkeydown={tile.isBlank ? null : (ev) => onTileKeyDown(ev, tile)}
				onclick={tile.isBlank ? null : onTileClick}
				onfocus={tile.isBlank ? null : () => {currentTileIndex = tileIndex}}>
				{#if !tile.isBlank}
					<div class="absolute top-[-1px] left-0.5 select-none">
						<p class="text-[0.75em]">
							{tile.label}
						</p>
					</div>
					<div class="flex justify-center w-full h-full absolute top-1">
						<p class="text-[22px] cursor-default select-none">
							{tile.guess}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<p>{currentClue.number}{currentDirection.at(0)?.toUpperCase()}. {currentClue.prompt}</p>
</main>
