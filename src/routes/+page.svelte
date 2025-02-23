<script lang="ts">

	import { type AnswerTile, type BlankTile, type Clue, type Direction, loadPuzzle } from '$lib';
	import { onMount } from 'svelte';
	import PopupMenu from '../components/PopupMenu.svelte';

	type CheckStatus = 'correct' | 'incorrect' | null;

	type GridTile = (| BlankTile | AnswerTile & {
		guess: string
		check: CheckStatus
		revealed: boolean
	}) &
		{
			element: SVGGElement | null;
		}

	type NonBlankTile = Exclude<GridTile, BlankTile>

	const puzzle = loadPuzzle();

	let tiles: GridTile[] = $state(puzzle.tiles.map((t) => {
		return {
			...t,
			guess: '',
			element: null,
			check: null,
			revealed: false
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
	let assistanceUsed = $state(false);

	const gridSideLength = 500;
	const gridStrokeWidth = 3;
	const marginOffset = gridStrokeWidth / 2;
	const cellSide = gridSideLength / puzzle.dimensions.cols;

	const cellX = (idx: number) => ((idx % puzzle.dimensions.cols) * cellSide) + marginOffset;
	const cellY = (idx: number) => Math.floor(idx / puzzle.dimensions.cols) * cellSide + marginOffset;

	$effect(() => {
		currentTile.element?.focus();
	});

	$effect(() => {
		if (!assistanceUsed && currentTile.check || currentTile.revealed) {
			assistanceUsed = true;
		}
	});

	$effect(() => {
		if (solved) {
			pauseTimer();
		}
	});

	$effect(() => {
		if (currentClue) {
			for (let e of document.getElementsByClassName('focused-clue')) {
				e.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});

	const onTileKeyDown = (ev: KeyboardEvent, tile: NonBlankTile) => {
		const uncheckedTile = tile.guess && tile.check !== 'correct';
		const key = ev.key.toUpperCase();
		switch (key) {
			case 'TAB':
				ev.preventDefault();
				advanceClue(ev.shiftKey ? -1 : 1);
				break;
			case 'DELETE':
				if (uncheckedTile) {
					tile.check = null;
					tile.guess = '';
				}
				break;
			case 'BACKSPACE':
				if (uncheckedTile) {
					tile.check = null;
					tile.guess = '';
				} else if ((currentDirection === 'across' && currentColIndex > 0) || (currentRowIndex > 0)) {
					const prevTileIndex = currentDirection === 'across' ? Math.max(currentTileIndex - 1, 0) : (currentTileIndex - puzzle.dimensions.rows < 0 ? currentTileIndex : currentTileIndex - puzzle.dimensions.rows);
					if (prevTileIndex !== currentTileIndex && !tiles[prevTileIndex].isBlank) {
						if (tiles[prevTileIndex].check !== 'correct') {
							tiles[prevTileIndex].check = null;
							tiles[prevTileIndex].guess = '';
						}
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
					if (tile.check !== 'correct') {
						tile.guess = key.toUpperCase().trim();
						tile.check = null;
					}
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

	const onTileClick = ({ currentTarget: tile }: MouseEvent & { currentTarget: SVGGElement }) => {
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

	const checkTile = (tile: GridTile) => {
		if (!tile.isBlank && tile.guess && !tile.check) {
			tile.check = tile.guess === tile.answer ? 'correct' : 'incorrect';
		}
	};

	const checkClue = (clue: Clue) => {
		for (let tileIndex of clue.tiles) {
			checkTile(tiles[tileIndex]);
		}
	};

	const checkGrid = () => {
		for (let tile of tiles) {
			checkTile(tile);
		}
	};

	const revealTile = (tile: GridTile) => {
		if (!tile.isBlank && tile.guess !== tile.answer) {
			tile.guess = tile.answer;
			tile.revealed = true;
			tile.check = 'correct';
		}
	};
	const revealClue = () => {
		currentClue.tiles.forEach(tileNumber => {
			revealTile(tiles[tileNumber]);
		});
	};

	const revealPuzzle = () => {
		tiles.forEach((tile) => {
			revealTile(tile as NonBlankTile);
		});
	};

	const resetPuzzle = () => {
		tiles.forEach((tile) => {
			if (!tile.isBlank) {
				tile.guess = '';
				tile.revealed = false;
				tile.check = null;
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
<main class="flex justify-center">
	<div class="flex flex-col w-screen h-screen max-w-screen-2xl overflow-hidden">
		<div class="flex flex-row items-center justify-around lg:justify-start">
			<p>🕰️ {formatDuration(secondsSpent)}</p>
			<PopupMenu label="Reveal" items={[
					{label: 'Letter', callback: () => revealTile(currentTile)},
					{label: 'Word', callback: () => revealClue()},
					{label: 'Puzzle', callback: () => revealPuzzle()}
					]} />
			<PopupMenu label="Check" items={[
				{label:"Letter", callback: () => checkTile(currentTile)},
				{label:"Word", callback: () => checkClue(currentClue)},
				{label:"Puzzle", callback: () => checkGrid()},
			]} />
			<button class="border-2 border-black p-1"
							onclick={resetPuzzle}>Reset
			</button>
			<button class="border-2 border-black p-1"
							class:invisible={solved}
							onclick={toggleTimer}>{paused ? '▶️' : '⏸️'}
			</button>
		</div>
		<div class="flex flex-col overflow-hidden lg:flex-row">
			<div class="flex lg:flex-auto justify-center items-center">
				<svg class="w-full h-full max-w-2xl select-none"
						 viewBox="0 0 {gridSideLength + gridStrokeWidth} {gridSideLength + gridStrokeWidth}">
					{#each tiles as cell, idx}
						<g bind:this={cell.element} pointer-events="visible" class="focus:outline-none"
							 tabindex={cell.isBlank ? null : 0} role="gridcell"
							 onmousedown={cell.isBlank ? null : ev => ev.preventDefault()}
							 onkeydown={cell.isBlank ? null : (ev) => onTileKeyDown(ev, cell)}
							 onclick={cell.isBlank ? null : onTileClick}
							 onfocus={cell.isBlank ? null : () => {if (idx !== currentTileIndex) currentTileIndex = idx}}>
							<rect width="{cellSide}" height="{cellSide}"
										class:fill-[#FFDA00]={!cell.isBlank && currentTileIndex === idx}
										class:fill-[#A7D8FF]={!cell.isBlank && currentTile.clues[currentDirection] === cell.clues[currentDirection]}
										class:fill-black={cell.isBlank}
										x="{cellX(idx)}"
										y="{cellY(idx)}"
										stroke="#696969"
										stroke-width="1" fill="none">
							</rect>
							{#if !cell.isBlank}
								{#if cell.label}
									<text
										font-size="10"
										x="{cellX(idx) + 3}"
										y="{cellY(idx) + 10}">{cell.label}</text>
								{/if}
								<text
									font-size="24"
									text-anchor="middle"
									x="{cellX(idx) + cellSide / 2}"
									class:fill-[#2860d8]={cell.check === 'correct'}
									y="{cellY(idx) + cellSide - 4}">{paused && !solved ? '' : cell.guess}</text>
								{#if cell.check === 'incorrect'}
									<line
										transform="translate({cellX(idx)},{cellY(idx)})"
										x1={cellSide} y1="0" x2="0" y2={cellSide} stroke="red"
										stroke-width="1" />
								{/if}
								{#if cell.revealed}
									<g transform="translate({cellX(idx)}, {cellY(idx)})">
										<polygon fill="#e63333" points="{cellSide},0.00 {cellSide / 2},0.00 {cellSide},{cellSide / 2}" />
										<circle fill="white" cx="{0.85 * cellSide}" cy="{cellSide / 8}" r="2.44" />
									</g>
								{/if}
							{/if}
						</g>
					{/each}
					<rect class="fill-none stroke-black" role="grid" x="{marginOffset}" y="{marginOffset}"
								tabindex="-1"
								width="{gridSideLength}"
								height="{gridSideLength}"
								stroke-width="{gridStrokeWidth}" />
				</svg>
			</div>
		</div>
		<div class="flex-1 flex flex-col min-h-0 lg:flex-row">
			{#each ['across', 'down'] as direction}
				<div class="flex-1 flex flex-col min-h-0 lg:flex-row">
					<div class="flex-1 flex flex-col min-h-0">
						<h3 class="border-b-2 text-left uppercase font-bold">{direction}</h3>
						<ul class="flex-1 overflow-y-auto">
							{#each puzzle.clues.filter(c => c.direction === direction) as clue}
								<li onkeydown={() => {}} role="menuitem" onclick={() => goToClue(clue)}
										class="py-1 flex items-center border-l-8 cursor-pointer border-transparent pl-1"
										class:focused-clue={currentClue === clue || clue.tiles.includes(currentTileIndex)}
										class:bg-[#a7d8ff]={currentClue === clue}
										class:border-l-[#a7d8ff]={clue.tiles.includes(currentTileIndex)}
										class:text-[#98a2a9]={clue.tiles.every(t => !tiles[t].isBlank && !!tiles[t].guess)}
								>
									<span class="min-w-6 text-right font-bold mr-2">{clue.number}</span>
									<span class:bg-[#98a2a9]={!solved && paused} class:text-[#98a2a9]={!solved && paused}
												class:select-none={paused}>{clue.prompt}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>