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

	// const solution: string[][] = [
	// 	['T', 'A', 'B', '', ''],
	// 	['I', 'T', 'E', 'M', ''],
	// 	['F', 'E', 'R', 'A', 'L'],
	// 	['F', 'U', 'R', 'R', 'Y'],
	// 	['S', 'P', 'A', 'C', 'E']
	// ];

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

	$: {
		console.log({ isClicking: isPointerDown });
	}

	onMount(() => {
		let clueCount = 1;
		tiles = solution.map((row, rowIndex) =>
			row.map((solutionTile, colIndex) => {
				const isBlock = solutionTile === '';
				return {
					clueNumber:
						!isBlock &&
						(rowIndex === 0 ||
							solution[rowIndex - 1][colIndex] === '' ||
							colIndex === 0 ||
							solution[rowIndex][colIndex - 1] === '')
							? clueCount++
							: null,
					solution: solutionTile,
					guess: '',
					isBlock,
					isCurrentWord: false,
					element: null
				};
			})
		);
		window.addEventListener('pointerdown', () => {
			isPointerDown = true;
		});
		window.addEventListener('pointerup', () => {
			isPointerDown = false;
		});

		mounted = true;
	});

	let rowLength = solution.length;
	let columnLength = solution[0].length;
	let direction: Direction = Direction.ACROSS;

	let focusRow = 0;
	let focusCol = 0;

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
		}
	}

	const onTileKeyDown = (ev: KeyboardEvent, rowIndex: number, colIndex: number) => {
		const key = ev.key.toUpperCase();
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
