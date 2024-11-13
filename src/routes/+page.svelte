<script lang="ts">

	import { type AnswerTile, type BlankTile, type Clue, type Direction, loadPuzzle } from '$lib';
	import { onMount } from 'svelte';

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
	let timerRef = $state(0);
	const paused = $derived(!timerRef);
	let secondsSpent = $state(0);
	const currentRowIndex = $derived(Math.floor(currentTileIndex / puzzle.dimensions.cols));
	const currentColIndex = $derived(currentTileIndex % puzzle.dimensions.cols);

	const currentTile: NonBlankTile = $derived(tiles[currentTileIndex]) as NonBlankTile;
	const currentClue: Clue = $derived(puzzle.clues[currentTile.clues[currentDirection]]);
	const solved = $derived(!tiles.some(t => !t.isBlank && t.guess !== t.answer));

	$effect(() => {
		currentTile.element?.focus();
	});

	$effect(() => {
		if (solved) {
			pauseTimer();
		}
	});

	$effect(() => {
		if (currentClue) {
			for (let e of document.getElementsByClassName('focused-clue')) {
				e.scrollIntoView({behavior: 'smooth'})
			}
		}
	})

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
				} else if (currentColIndex > 0) {
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
				if (key.length === 1 && !paused && !solved) {
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
		goToClue(nextClue);
	};

	const advanceTile = (direction: 'up' | 'down' | 'left' | 'right') => {
		const { cols } = puzzle.dimensions;
		const step = {
			'up': -cols,
			'down': cols,
			'left': -1,
			'right': 1
		}[direction];

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

	const solvePuzzle = () => {
		tiles.forEach((tile) => {
			if (!tile.isBlank) {
				tile.guess = tile.answer;
			}
		});
	};

	const resetPuzzle = () => {
		tiles.forEach((tile) => {
			if (!tile.isBlank) {
				tile.guess = '';
			}
			currentTileIndex = puzzle.clues[0].tiles[0];
			secondsSpent = 0;
			startTimer();
		});
	};

	const startTimer = () => {
		if (paused) {
			timerRef = setInterval(() => {
				secondsSpent++;
			}, 1000);
		}
	};

	const pauseTimer = () => {
		if (timerRef) {
			clearInterval(timerRef);
			timerRef = 0;
		}
	};

	const toggleTimer = () => {
		if (paused) {
			startTimer();
		} else {
			pauseTimer();
		}
	};

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const secondsPart = seconds % 60;
		const minutesPart = minutes % 60;

		return `${hours > 0 ? `${hours}:` : ''}${minutesPart.toString().padStart(hours > 0 ? 2 : 1, '0')}:${secondsPart.toString().padStart(2, '0')}`;
	};

	const goToClue = (clue: Clue) => {
		if (clue.direction !== currentDirection) {
			currentDirection = clue.direction;
		}
		currentTileIndex = firstEmptyTileInClue(clue) || clue.tiles[0];
	};

	onMount(() => {
		startTimer();
	});

</script>

<main>
	<div class="flex h-[600px]">
		<div class="flex flex-col">
			<div
				tabindex="-1"
				role="grid"
				class="w-max inline-grid grid-cols-{puzzle.dimensions.cols} gap-0 border-[3px] border-black"
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
									{!solved && paused ? '' : tile.guess}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<div>
				<p class:text-[#98a2a9]={paused} class:bg-[#98a2a9]={paused}>{currentClue.number}{currentDirection.at(0)?.toUpperCase()}. {currentClue.prompt}</p>
				<p>🕰️ {formatDuration(secondsSpent)}</p>
				<button class="border-2 border-black p-1"
								onclick={solvePuzzle}>Solve
				</button>
				<button class="border-2 border-black p-1"
								onclick={resetPuzzle}>Reset
				</button>
				{#if !solved}
					<button class="border-2 border-black p-1"
									onclick={toggleTimer}>{paused ? 'Resume' : 'Pause'}
					</button>
				{/if}
			</div>
		</div>
		<div class="flex flex-row">
			{#each ['across', 'down'] as direction}
				<div class="mx-2 w-1/2">
					<h3 class="border-b-2 text-left uppercase font-bold">{direction}</h3>
					<ol class="overflow-y-scroll h-full">
						{#each puzzle.clues.filter(c => c.direction === direction) as clue}
							<li onkeydown={() => {}} role="menuitem" onclick={() => goToClue(clue)}
									class="py-1 flex items-center border-l-8 cursor-pointer border-transparent pl-1"
									class:focused-clue={currentClue === clue || clue.tiles.includes(currentTileIndex)}
									class:bg-[#a7d8ff]={currentClue === clue}
									class:border-l-[#a7d8ff]={clue.tiles.includes(currentTileIndex)}
									class:text-[#98a2a9]={paused || clue.tiles.every(t => !tiles[t].isBlank && !!tiles[t].guess)}
							>
								<span class="min-w-6 text-right font-bold mr-2">{clue.number}</span>
								<span class:bg-[#98a2a9]={paused} class:select-none={paused}>{clue.prompt}</span>
							</li>
						{/each}
					</ol>
				</div>
			{/each}
		</div>
	</div>
</main>
