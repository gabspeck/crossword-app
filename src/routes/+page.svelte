<script lang="ts">

	import { type AnswerTile, type BlankTile, type Clue, type Direction, loadPuzzle } from '$lib';
	import { onMount } from 'svelte';
	import OnScreenKeyboard from '../components/OnScreenKeyboard.svelte';
	import ClueList from '../components/ClueList.svelte';
	import ClueStrip from '../components/ClueStrip.svelte';
	import GameControls from '../components/GameControls.svelte';
	import CrosswordGrid from '../components/CrosswordGrid.svelte';

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
	let assistanceUsed = $state(false);
	const paused = $derived(!timerRef);
	let secondsSpent = $state(0);
	const currentRowIndex = $derived(Math.floor(currentTileIndex / puzzle.dimensions.cols));
	const currentColIndex = $derived(currentTileIndex % puzzle.dimensions.cols);

	const currentTile: NonBlankTile = $derived(tiles[currentTileIndex]) as NonBlankTile;
	const currentClue: Clue = $derived(puzzle.clues[currentTile.clues[currentDirection]]);
	const solved = $derived(!tiles.some((t) => !t.isBlank && t.guess !== t.answer));


	$effect(() => {
		currentTile.element?.focus();
	});

	$effect(() => {
		if ((!assistanceUsed && currentTile.check) || currentTile.revealed) {
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

	const onTileKeyDown = (eventOrKey: KeyboardEvent | string, tile: NonBlankTile) => {
		const [ev, key] =
			typeof eventOrKey === 'string'
				? [null, eventOrKey.toUpperCase()]
				: [eventOrKey, eventOrKey.key.toUpperCase()];
		const uncheckedTile = tile.guess && tile.check !== 'correct';
		switch (key) {
			case 'TAB':
				ev?.preventDefault();
				advanceClue(ev?.shiftKey ? -1 : 1);
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
				} else if ((currentDirection === 'across' && currentColIndex > 0) || currentRowIndex > 0) {
					const prevTileIndex =
						currentDirection === 'across'
							? Math.max(currentTileIndex - 1, 0)
							: currentTileIndex - puzzle.dimensions.rows < 0
								? currentTileIndex
								: currentTileIndex - puzzle.dimensions.rows;
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
					ev?.preventDefault();
					currentDirection = 'down';
				} else {
					advanceTile(key === 'ARROWUP' ? 'up' : 'down');
				}
				break;
			case 'ARROWLEFT':
			case 'ARROWRIGHT':
				if (currentDirection === 'down') {
					ev?.preventDefault();
					currentDirection = 'across';
				} else {
					advanceTile(ev?.key === 'ARROWLEFT' ? 'left' : 'right');
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

	const onTileFocus = (idx: number) => {
		if (idx !== currentTileIndex) currentTileIndex = idx;
	};

	const onTileClick = ({ currentTarget: tile }: MouseEvent & { currentTarget: SVGGElement }) => {
		console.log(tile !== document.activeElement);
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
		currentClue.tiles.forEach((tileNumber) => {
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

<main class="flex justify-center fixed">
	<div class="flex flex-col w-screen h-[100dvh] max-w-screen-2xl overflow-hidden">
		<div class="flex flex-col overflow-hidden">
			<div class="flex lg:flex-auto flex-col justify-center items-center">
				<GameControls {secondsSpent} {solved} {paused} onResetPuzzle={resetPuzzle} onToggleTimer={toggleTimer}
											onRevealLetter={() => revealTile(currentTile)} onRevealWord={() => revealClue()}
											onRevealPuzzle={revealPuzzle} onCheckLetter={() => checkTile(currentTile)}
											onCheckWord={() => checkClue(currentClue)} onCheckPuzzle={() => checkGrid()} />
				<div class="w-full h-full max-w-2xl">
					<CrosswordGrid {puzzle} {tiles} {currentTile} {currentTileIndex} {currentDirection} {paused} {solved}
												 onKeyDown={onTileKeyDown} {onTileClick} {onTileFocus} />
					<ClueStrip onNextClue={() => advanceClue(1)} onPreviousClue={() => advanceClue(-1)}
										 prompt={currentClue.prompt} />
				</div>
			</div>
		</div>
		<div class="hidden lg:flex flex-1 min-h-0">
			<ClueList onSelectClue={goToClue} clues={puzzle.clues} { tiles } {currentClue} {currentTileIndex}
								censor={paused && !solved} />
		</div>
		<div class="lg:hidden mt-2">
			<OnScreenKeyboard onPress={(key) => onTileKeyDown(key, currentTile)} />
		</div>
	</div>
</main>
