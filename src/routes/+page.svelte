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
	let currentTileIndex: number = $state(puzzle.clues[0].tiles[0]);
	$inspect(currentTileIndex);
	let currentTile: NonBlankTile = $derived(puzzle.tiles[currentTileIndex]) as NonBlankTile;
	let currentClue: Clue = $derived(puzzle.clues[currentTile.clues[currentDirection]]);

	const onTileKeyDown = (ev: KeyboardEvent, tile: NonBlankTile) => {
		const key = ev.key.toUpperCase();
		if (key.length === 1) {
			tile.guess = key.toUpperCase();
			advanceTile();
		} else {
			if (key === 'TAB') {
				ev.preventDefault();
				advanceClue(ev.shiftKey ? -1 : 1);
			}
			if (key === 'DELETE') {
				if (tile.guess) {
					tile.guess = '';
				}
			}
			if (key === 'BACKSPACE') {
				if (tile.guess) {
					tile.guess = '';
				} else {
					if (tile.guess) {
						tile.guess = '';
					} else {
						const prevTileIndex = currentDirection === 'across' ? Math.max(currentTileIndex - 1, 0) : (currentTileIndex - puzzle.dimensions.rows < 0 ? currentTileIndex : currentTileIndex - puzzle.dimensions.rows);
						if (prevTileIndex !== currentTileIndex && !tiles[prevTileIndex].isBlank) {
							tiles[prevTileIndex].guess = '';
							currentTileIndex = prevTileIndex;
						}
					}
				}
			}
			if (['ARROWUP', 'ARROWDOWN'].includes(key) && currentDirection === 'across') {
				ev.preventDefault();
				currentDirection = 'down';
			} else if (currentDirection === 'down') {
				currentTileIndex += puzzle.dimensions.rows * (key === 'ARROWUP' ? -1 : 1);
			}
			if (['ARROWLEFT', 'ARROWRIGHT'].includes(key) && currentDirection === 'down') {
				ev.preventDefault();
				currentDirection = 'across';
			} else if (currentDirection === 'across') {
				currentTileIndex += 1 * (key === 'ARROWLEFT' ? -1 : 1);
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

	const advanceClue = (step: 1 | -1) => {
		let nextClueIndex = (currentTile.clues[currentDirection] + step) % puzzle.clues.length;
		if (nextClueIndex < 0) {
			nextClueIndex = puzzle.clues.findLastIndex(c => c.direction === (currentDirection === 'across' ? 'down' : 'down'));
		}
		const nextClue = puzzle.clues[nextClueIndex];
		if (nextClue.direction !== currentDirection) {
			currentDirection = nextClue.direction;
		}
		currentTileIndex = nextClue.tiles[0];
	};

	const advanceTile = () => {
		const step = currentDirection === 'across' ? 1 : puzzle.dimensions.rows;
		let nextTileIndex = currentTileIndex + step;
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
