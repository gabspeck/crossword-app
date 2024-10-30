<script lang="ts">

	import { type AnswerTile, type BlankTile, type Clue, type Direction, loadPuzzle } from '$lib';

	type GridTile = (| BlankTile | AnswerTile & {
		guess: string
	}) &
		{
			element: HTMLElement | null;
		}

	type NonBlankTile = Exclude<GridTile, BlankTile>

	const puzzle = loadPuzzle();

	let tiles: GridTile[] = $state(puzzle.tiles.map((t) => {
		return {
			...t,
			guess: '',
			element: null
		};
	}));

	let currentDirection: Direction = $state('across');
	let currentTileIndex: number = $state(puzzle.clues[0].tiles[0]);
	let currentTile: NonBlankTile = $derived(tiles[currentTileIndex]) as NonBlankTile;
	let currentClue: Clue = $derived(puzzle.clues[currentTile.clues[currentDirection]]);

	$effect(() => {
		currentTile.element?.focus();
	});

	const onTileKeyDown = (ev: KeyboardEvent, tile: NonBlankTile) => {
		const key = ev.key.toUpperCase();
		switch (key) {
			case 'TAB':
				ev.preventDefault();
				advanceClue(ev.shiftKey ? -1 : 1);
				break;
			case 'DELETE':
				if (tile.guess) {
					tile.guess = '';
				}
				break;
			case 'BACKSPACE':
				if (tile.guess) {
					tile.guess = '';
				} else {
					const prevTileIndex = currentDirection === 'across' ? Math.max(currentTileIndex - 1, 0) : (currentTileIndex - puzzle.dimensions.rows < 0 ? currentTileIndex : currentTileIndex - puzzle.dimensions.rows);
					if (prevTileIndex !== currentTileIndex && !tiles[prevTileIndex].isBlank) {
						tiles[prevTileIndex].guess = '';
						currentTileIndex = prevTileIndex;
					}
				}
				break;
			case 'ARROWUP':
			case 'ARROWDOWN':
				if (currentDirection === 'across') {
					ev.preventDefault();
					currentDirection = 'down';
				} else {
					advanceTile(key === 'ARROWUP' ? 'up' : 'down');
				}
				break;
			case 'ARROWLEFT':
			case 'ARROWRIGHT':
				if (currentDirection === 'down') {
					ev.preventDefault();
					currentDirection = 'across';
				} else {
					advanceTile(key === 'ARROWLEFT' ? 'left' : 'right');
				}
				break;
			default:
				if (key.length === 1) {
					tile.guess = key.toUpperCase().trim();
					if (currentTileIndex === currentClue.tiles.at(-1)) {
						const firstEmpty = firstEmptyTileInClue(currentClue);
						if (firstEmpty != undefined) {
							currentTileIndex = firstEmpty;
						}
					} else {
						advanceTile(currentDirection === 'across' ? 'right' : 'down');
					}
				}
				break;
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
		currentTileIndex = firstEmptyTileInClue(nextClue) || nextClue.tiles[0];
	};

	const advanceTile = (direction: 'up' | 'down' | 'left' | 'right') => {
		const { cols } = puzzle.dimensions;
		const step = {
			'up': -cols,
			'down': cols,
			'left': -1,
			'right': 1
		}[direction];

		const currentRowIndex = Math.floor(currentTileIndex / cols);
		const currentColIndex = currentTileIndex % cols;

		let tentativeTileIndex = currentTileIndex;

		while (true) {
			tentativeTileIndex += step;

			if (tentativeTileIndex < 0 || tentativeTileIndex >= tiles.length) {
				break;
			}

			const tentativeRowIndex = Math.floor(tentativeTileIndex / cols);
			const tentativeColIndex = tentativeTileIndex % cols;

			if ((direction === 'left' || direction === 'right') && tentativeRowIndex !== currentRowIndex) {
				break;
			}

			if ((direction === 'up' || direction === 'down') && tentativeColIndex !== currentColIndex) {
				break; // Next tile is in a different column
			}

			const nextTile = tiles[tentativeTileIndex];

			if (!nextTile.isBlank) {
				currentTileIndex = tentativeTileIndex;
				break;
			}
		}
	};

	const firstEmptyTileInClue = (clue: Clue) =>
		clue.tiles.find(idx => (tiles[idx] as NonBlankTile).guess === '');
</script>

<main>
	<div
		tabindex="-1"
		role="grid"
		class="inline-grid grid-cols-{puzzle.dimensions.cols} gap-0 border-[3px] border-black font-['Helvetica']"
	>
		{#each tiles as tile, tileIndex}
			<div
				bind:this={tile.element}
				tabindex={tile.isBlank ? null : 0}
				role="gridcell"
				class="border-[#696969] border-r-[1px] border-b-[1px] w-[33px] h-[33px] focus:outline-none relative"
				class:bg-[#FFDA00]={!tile.isBlank && currentTileIndex === tileIndex}
				class:bg-[#A7D8FF]={!tile.isBlank && currentTile.clues[currentDirection] === tile.clues[currentDirection]}
				class:bg-black={tile.isBlank}
				onmousedown={tile.isBlank ? null : ev => ev.preventDefault()}
				onkeydown={tile.isBlank ? null : (ev) => onTileKeyDown(ev, tile)}
				onclick={tile.isBlank ? null : onTileClick}
				onfocus={tile.isBlank ? null : () => {if (tileIndex !== currentTileIndex) currentTileIndex = tileIndex}}>
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
