<script lang="ts">
	import { onMount } from 'svelte';

	type Tile = {
		solution: string;
		guess: string;
		clueNumber: number | null;
		isBlock: boolean;
		isCurrentWord: boolean;
		element: HTMLElement | null;
	};

	enum Direction {
		ACROSS,
		DOWN
	}

	// NYT September 2, 2024
	const solution = [
		['P', 'L', 'A', 'T', 'E', '', 'S', 'M', 'O', 'G', '', 'O', 'F', 'F', 'S'],
		['A', 'I', 'S', 'H', 'A', '', 'T', 'A', 'C', 'O', '', 'A', 'L', 'L', 'A'],
		['P', 'E', 'T', 'E', 'R', 'C', 'O', 'T', 'T', 'O', 'N', 'T', 'A', 'I', 'L'],
		['I', 'D', 'O', 'L', '', 'O', 'N', 'E', 'O', 'N', 'E', '', 'M', 'E', 'T'],
		['', '', '', 'I', 'S', 'E', 'E', '', '', 'T', 'A', 'P', 'E', 'R', 'S'],
		['B', 'R', 'O', 'K', 'E', 'N', 'R', 'E', 'C', 'O', 'R', 'D', '', '', ''],
		['L', 'E', 'V', 'E', 'E', '', '', 'A', 'P', 'U', '', 'F', 'E', 'D', 'S'],
		['O', 'D', 'E', '', 'P', 'O', 'S', 'T', 'U', 'R', 'E', '', 'G', 'O', 'O'],
		['W', 'O', 'R', 'M', '', 'R', 'T', 'E', '', '', 'L', 'E', 'O', 'N', 'A'],
		['', '', '', 'F', 'I', 'G', 'U', 'R', 'E', 'S', 'K', 'A', 'T', 'E', 'R'],
		['A', 'R', 'I', 'A', 'N', 'A', '', '', 'M', 'A', 'S', 'S', '', '', ''],
		['T', 'O', 'M', '', 'U', 'N', 'E', 'V', 'E', 'N', '', 'Y', 'E', 'A', 'S'],
		['H', 'O', 'P', 'S', 'K', 'I', 'P', 'A', 'N', 'D', 'A', 'J', 'U', 'M', 'P'],
		['O', 'S', 'L', 'O', '', 'S', 'E', 'N', 'D', '', 'C', 'O', 'R', 'E', 'R'],
		['S', 'T', 'Y', 'X', '', 'T', 'E', 'E', 'S', '', 'E', 'B', 'O', 'N', 'Y']
	];

	let tiles: Tile[][] = [];
	let mounted = false;
	let isPointerDown = false;

	let cluesAcross: { clueNumber: number; row: number; col: number }[] = [];
	let cluesDown: { clueNumber: number; row: number; col: number }[] = [];

	onMount(() => {
		let clueCount = 1;
		tiles = solution.map((row, rowIndex) =>
			row.map((solutionTile, colIndex) => {
				const isBlock = solutionTile === '';
				let clueNumber: number | null = null;

				const startsAcross =
					!isBlock &&
					(colIndex === 0 || solution[rowIndex][colIndex - 1] === '') && // No block to the left
					colIndex + 1 < columnLength &&
					solution[rowIndex][colIndex + 1] !== ''; // Not a block to the right

				const startsDown =
					!isBlock &&
					(rowIndex === 0 || solution[rowIndex - 1][colIndex] === '') && // No block above
					rowIndex + 1 < rowLength &&
					solution[rowIndex + 1][colIndex] !== ''; // Not a block below

				if (startsAcross || startsDown) {
					clueNumber = clueCount++;
				}

				if (startsAcross && clueNumber !== null) {
					cluesAcross.push({ clueNumber, row: rowIndex, col: colIndex });
				}

				if (startsDown && clueNumber !== null) {
					cluesDown.push({ clueNumber, row: rowIndex, col: colIndex });
				}

				return {
					clueNumber,
					solution: solutionTile,
					guess: '',
					isBlock,
					isCurrentWord: false,
					element: null
				};
			})
		);

		const onPointerDown = () => {
			isPointerDown = true;
		};

		const onPointerUp = () => {
			isPointerDown = false;
		};
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		mounted = true;
		return () => {
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointerdown', onPointerDown);
		};
	});

	let rowLength = solution.length;
	let columnLength = solution[0].length;
	let direction: Direction = Direction.ACROSS;

	let focusRow = 0;
	let focusCol = 0;

	let currentClueNumber: number | null = null;

	$: {
		if (mounted) {
			const tile = tiles[focusRow][focusCol].element;
			if (tile && document.activeElement !== tile) {
				tile.focus();
			}
			let firstLetter, lastLetter;
			tiles
				.filter((r) => r.filter((t) => t.isCurrentWord))
				.forEach((row) => row.forEach((tile) => (tile.isCurrentWord = false)));
			if (direction === Direction.DOWN) {
				firstLetter = focusRow;
				lastLetter = focusRow;
				while (firstLetter > 0 && !tiles[firstLetter - 1][focusCol].isBlock) {
					tiles[--firstLetter][focusCol].isCurrentWord = true;
				}
				while (lastLetter < rowLength - 1 && !tiles[lastLetter + 1][focusCol].isBlock) {
					tiles[++lastLetter][focusCol].isCurrentWord = true;
				}
			} else {
				firstLetter = focusCol;
				lastLetter = focusCol;
				while (firstLetter > 0 && !tiles[focusRow][firstLetter - 1].isBlock) {
					tiles[focusRow][--firstLetter].isCurrentWord = true;
				}
				while (lastLetter < columnLength - 1 && !tiles[focusRow][lastLetter + 1].isBlock) {
					tiles[focusRow][++lastLetter].isCurrentWord = true;
				}
			}

			// Calculate the current clue number
			currentClueNumber = (() => {
				let row = focusRow;
				let col = focusCol;

				// If the focused tile is a block, there's no clue number
				if (tiles[row][col].isBlock) {
					return null;
				}

				// Traverse to the start of the word
				if (direction === Direction.ACROSS) {
					// Move left until we reach the start of the word
					while (col > 0 && !tiles[row][col - 1].isBlock) {
						col--;
					}
				} else {
					// Direction.DOWN
					// Move up until we reach the start of the word
					while (row > 0 && !tiles[row - 1][col].isBlock) {
						row--;
					}
				}

				// Return the clue number of the starting tile
				return tiles[row][col].clueNumber;
			})();
		}
	}

	const onTileKeyDown = (ev: KeyboardEvent, rowIndex: number, colIndex: number) => {
		const key = ev.key.toUpperCase();

		// Handle TAB and Shift+TAB
		if (key === 'TAB') {
			ev.preventDefault(); // Prevent default tab behavior

			// Determine the clues array based on the current direction
			const cluesArray = direction === Direction.ACROSS ? cluesAcross : cluesDown;

			// Find the index of the current clue
			let currentClueIndex = cluesArray.findIndex((clue) => clue.clueNumber === currentClueNumber);

			// If currentClueNumber is null or not found, start from the beginning
			if (currentClueIndex === -1) {
				currentClueIndex = 0;
			}

			let nextClueIndex;

			if (ev.shiftKey) {
				// Shift+TAB: Move to the previous clue
				nextClueIndex = currentClueIndex - 1;
				if (nextClueIndex < 0) {
					nextClueIndex = cluesArray.length - 1; // Wrap around to the last clue
				}
			} else {
				// TAB: Move to the next clue
				nextClueIndex = currentClueIndex + 1;
				if (nextClueIndex >= cluesArray.length) {
					nextClueIndex = 0; // Wrap around to the first clue
				}
			}

			// Get the starting position of the next or previous clue
			const nextClue = cluesArray[nextClueIndex];

			// Update focusRow and focusCol to move to the starting tile of the next clue
			focusRow = nextClue.row;
			focusCol = nextClue.col;

			// Ensure the tile is focused
			tiles[focusRow][focusCol].element?.focus();

			return; // Exit the function
		}

		if (key === 'BACKSPACE') {
			ev.preventDefault();
		}
		let nextRow = rowIndex,
			nextCol = colIndex;

		const walkUp = () => {
			nextRow = Math.max(0, rowIndex - 1);
		};

		const walkDown = () => {
			nextRow = Math.min(rowLength - 1, rowIndex + 1);
		};

		const walkLeft = () => {
			nextCol = Math.max(0, colIndex - 1);
		};

		const walkRight = () => {
			nextCol = Math.min(columnLength - 1, colIndex + 1);
		};

		let clearNext = false;

		switch (key) {
			case 'ARROWUP':
				if (direction === Direction.ACROSS) {
					direction = Direction.DOWN;
				} else {
					walkUp();
				}
				break;
			case 'ARROWDOWN':
				if (direction === Direction.ACROSS) {
					direction = Direction.DOWN;
				} else {
					walkDown();
				}
				break;
			case 'ARROWLEFT':
				if (direction === Direction.DOWN) {
					direction = Direction.ACROSS;
				} else {
					walkLeft();
				}
				break;
			case 'ARROWRIGHT':
				if (direction === Direction.DOWN) {
					direction = Direction.ACROSS;
				} else {
					walkRight();
				}
				break;
			case 'BACKSPACE':
				if (tiles[rowIndex][colIndex].guess) {
					tiles[rowIndex][colIndex].guess = '';
				} else {
					clearNext = true;
					if (direction === Direction.DOWN) {
						walkUp();
					} else {
						walkLeft();
					}
				}
				break;
			case 'DELETE': {
				tiles[rowIndex][colIndex].guess = '';
			}
		}

		const isLetter = key.length === 1;
		if (isLetter) {
			tiles[rowIndex][colIndex].guess = key;
			if (direction === Direction.DOWN) {
				walkDown();
			} else {
				walkRight();
			}
		}

		const nextTileIsBlock = tiles[nextRow][nextCol].isBlock;

		if (nextRow !== focusRow && !nextTileIsBlock) {
			focusRow = nextRow;
		}

		if (nextCol !== focusCol && !nextTileIsBlock) {
			focusCol = nextCol;
		}

		if (clearNext) {
			tiles[focusRow][focusCol].guess = '';
		}
	};

	const updateFocus = (rowIndex: number, colIndex: number) => {
		if (rowIndex !== focusRow) {
			focusRow = rowIndex;
		}
		if (colIndex !== focusCol) {
			focusCol = colIndex;
		}
	};

	const onTileFocus = (rowIndex: number, colIndex: number) => {
		if (!isPointerDown) {
			updateFocus(rowIndex, colIndex);
		}
	};

	const onTileClick = (ev: MouseEvent, tile: Tile, rowIndex: number, colIndex: number) => {
		if (ev.button !== 0 || tile.isBlock) {
			return;
		}
		if (rowIndex === focusRow && colIndex === focusCol) {
			direction = direction === Direction.DOWN ? Direction.ACROSS : Direction.DOWN;
		} else {
			updateFocus(rowIndex, colIndex);
		}
	};
</script>

<body>
	<div
		role="grid"
		class="inline-grid grid-cols-{columnLength} gap-0 border-[3px] border-black font-['Helvetica']"
	>
		{#each tiles as row, rowIndex}
			{#each row as tile, colIndex}
				<div
					role="gridcell"
					on:keydown={(ev) => onTileKeyDown(ev, rowIndex, colIndex)}
					tabindex={tile.isBlock ? null : 0}
					bind:this={tiles[rowIndex][colIndex].element}
					class="border-[#696969] w-[3em] h-[3em] focus:outline-none"
					class:border-r-[1px]={colIndex < columnLength - 1}
					class:border-b-[1px]={rowIndex < rowLength - 1}
					class:bg-[#FFDA00]={focusRow === rowIndex && focusCol === colIndex}
					class:bg-[#A7D8FF]={tile.isCurrentWord}
					class:bg-black={tile.isBlock}
					on:focus={() => {
						onTileFocus(rowIndex, colIndex);
					}}
					on:click={(ev) => onTileClick(ev, tile, rowIndex, colIndex)}
				>
					{#if !tile.isBlock}
						<span class="absolute pl-0.5 text-[0.75em] cursor-default select-none">
							{tile.clueNumber || ''}
						</span>
						<div class="flex items-center justify-center w-full h-full">
							<span class="text-[1.6em] cursor-default select-none">
								{tile.guess}
							</span>
						</div>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</body>
