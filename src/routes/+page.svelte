<script lang="ts">
	import { onMount, untrack } from 'svelte';

	type Tile = {
		solution: string;
		guess: string;
		clueNumber: number | null;
		isBlock: boolean;
		isCurrentWord: boolean;
		element: HTMLElement | null;
	};

	type Direction = 'ACROSS' | 'DOWN'

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

	type Clue = Record<number, string>;

	const clues: Record<Direction, Clue> = {
		['ACROSS']: {
			'1': 'Spinning item for a circus performer',
			'6': 'Pollution portmanteau',
			'10': 'Does in, in mob slang',
			'14': 'Actress Hinds of "9-1-1"',
			'15': 'Choco ___ (frozen treat with a rhyming name)',
			'16': 'Penne ___ vodka',
			'17': 'Song character who comes "down the bunny trail"',
			'20': 'Revered star',
			'21': 'Umpire\'s count after a ball and a strike',
			'22': 'Museum in N.Y.C.\'s Central Park, with "the"',
			'23': '"Makes sense"',
			'25': 'Narrows at the end',
			'27': 'Someone who says the same thing again and again, metaphorically',
			'32': 'Engineered embankment',
			'33': 'Kwik-E-Mart operator on "The Simpsons"',
			'34': 'National law enforcement officers, with "the"',
			'38': 'Dedicated poem',
			'39': 'Stance',
			'43': 'Slime',
			'44': 'Gummy candy shape',
			'46': 'U.S. 101 or 66: Abbr.',
			'47': '"Bleeding Love" singer Lewis',
			'49': 'One having an ice time at the Olympics?',
			'53': 'Pop singer Grande',
			'56': 'The "m" of e = mc^2',
			'57': 'Sandoval of "Vanderpump Rules"',
			'58': 'Rocky',
			'61': 'Senate affirmatives',
			'65': 'Short distance to travel, with a hint to 17-, 27- and 49-Across',
			'68': 'City where the Nobel Peace Prize is awarded',
			'69': 'Put in the mail',
			'70': 'Kitchen gadget for apples',
			'71': 'River to Hades',
			'72': 'They may be graphic',
			'73': 'Black wood'
		},
		['DOWN']: {
			'1': 'Spanish "daddy"',
			'2': 'Told a fib',
			'3': 'Regarding',
			'4': 'Others similar',
			'5': 'Outsize feature of a bat\'s head',
			'6': 'Pot smoker',
			'7': 'Chess game\'s ending',
			'8': 'Eight: Prefix',
			'9': 'Hit the road, as a band',
			'10': 'Nondairy milk option',
			'11': 'Symbol in Tinder\'s logo',
			'12': 'Frequent-___ miles',
			'13': 'Seasons to taste, say',
			'18': 'Director Joel or Ethan',
			'19': 'Approach',
			'24': 'Ooze',
			'26': 'Common email attachment',
			'27': 'What one might do after making a birthday wish',
			'28': 'Second chance',
			'29': 'Finished',
			'30': 'Picky ___',
			'31': 'PC "brain"',
			'35': 'Showbiz awards quartet',
			'36': 'Finished',
			'37': 'Fly high',
			'40': 'Musician in a cathedral',
			'41': 'Letters between R and V',
			'42': 'Lodge group since 1868',
			'45': 'Advanced deg. for creative types',
			'48': 'Gravy train gig',
			'50': 'Alaska native',
			'51': 'Corrects, as a text',
			'52': 'What a beach shower helps wash off',
			'53': 'One of the Three Musketeers',
			'54': 'Pigeon\'s perch',
			'55': 'Suggest indirectly',
			'59': 'Fencing sword',
			'60': 'Barn topper',
			'62': 'Croatian currency beginning in 2023',
			'63': '"___ to that!" ("Totally agree!")',
			'64': 'Agile for one\'s age',
			'66': 'Word after White or Red',
			'67': 'Card above king'
		}
	};

	let tiles: Tile[][] = $state([]);
	let isPointerDown = $state(false);

	let cluesAcross: { clueNumber: number; row: number; col: number }[] = $state([]);
	let cluesDown: { clueNumber: number; row: number; col: number }[] = $state([]);

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
		return () => {
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointerdown', onPointerDown);
		};
	});

	let rowLength = $state(solution.length);
	let columnLength = $state(solution[0].length);
	let direction: Direction = $state('ACROSS');

	let focusRow = $state(0);
	let focusCol = $state(0);

	let currentClueNumber: number = $state(1);

	$effect(() => {
		const tile = tiles[focusRow][focusCol].element;
		if (tile && document.activeElement !== tile) {
			tile.focus();
		}
		tiles
			.filter((r) => r.filter((t) => t.isCurrentWord))
			.forEach((row) => row.forEach((tile) => (tile.isCurrentWord = false)));
	});

	$effect(() => {
		let firstLetter, lastLetter;
		if (direction === 'DOWN') {
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
	});
	//
	// 	// Calculate the current clue number
	// 	currentClueNumber = (() => {
	// 		let row = focusRow;
	// 		let col = focusCol;
	//
	// 		// If the focused tile is a block, there's no clue number
	// 		if (tiles[row][col].isBlock) {
	// 			return 1;
	// 		}
	//
	// 		// Traverse to the start of the word
	// 		if (direction === 'ACROSS') {
	// 			// Move left until we reach the start of the word
	// 			while (col > 0 && !tiles[row][col - 1].isBlock) {
	// 				col--;
	// 			}
	// 		} else {
	// 			// 'DOWN'
	// 			// Move up until we reach the start of the word
	// 			while (row > 0 && !tiles[row - 1][col].isBlock) {
	// 				row--;
	// 			}
	// 		}
	//
	// 		// Return the clue number of the starting tile
	// 		return tiles[row][col].clueNumber || 1;
	// 	})();

	const onTileKeyDown = (ev: KeyboardEvent, rowIndex: number, colIndex: number) => {
		const key = ev.key.toUpperCase();

		// Handle TAB and Shift+TAB
		if (key === 'TAB') {
			ev.preventDefault(); // Prevent default tab behavior

			// Determine the clues array based on the current direction
			const cluesArray = direction === 'ACROSS' ? cluesAcross : cluesDown;

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
				if (direction === 'ACROSS') {
					direction = 'DOWN';
				} else {
					walkUp();
				}
				break;
			case 'ARROWDOWN':
				if (direction === 'ACROSS') {
					direction = 'DOWN';
				} else {
					walkDown();
				}
				break;
			case 'ARROWLEFT':
				if (direction === 'DOWN') {
					direction = 'ACROSS';
				} else {
					walkLeft();
				}
				break;
			case 'ARROWRIGHT':
				if (direction === 'DOWN') {
					direction = 'ACROSS';
				} else {
					walkRight();
				}
				break;
			case 'BACKSPACE':
				if (tiles[rowIndex][colIndex].guess) {
					tiles[rowIndex][colIndex].guess = '';
				} else {
					clearNext = true;
					if (direction === 'DOWN') {
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
			if (direction === 'DOWN') {
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
			direction = direction === 'DOWN' ? 'ACROSS' : 'DOWN';
		} else {
			updateFocus(rowIndex, colIndex);
		}
	};
</script>

<div
	role="grid"
	class="inline-grid grid-cols-{columnLength} gap-0 border-[3px] border-black font-['Helvetica']"
>
	{#each tiles as row, rowIndex}
		{#each row as tile, colIndex}
			<div
				role="gridcell"
				onkeydown={(ev) => onTileKeyDown(ev, rowIndex, colIndex)}
				tabindex={tile.isBlock ? null : 0}
				bind:this={tiles[rowIndex][colIndex].element}
				class="border-[#696969] w-[33px] h-[33px] focus:outline-none relative"
				class:border-r-[1px]={colIndex < columnLength - 1}
				class:border-b-[1px]={rowIndex < rowLength - 1}
				class:bg-[#FFDA00]={focusRow === rowIndex && focusCol === colIndex}
				class:bg-[#A7D8FF]={tile.isCurrentWord}
				class:bg-black={tile.isBlock}
				onfocus={() => {
						onTileFocus(rowIndex, colIndex);
					}}
				onclick={(ev) => onTileClick(ev, tile, rowIndex, colIndex)}
			>
				{#if !tile.isBlock}
					<div class="cursor-default absolute top-[-3px] left-0.5 select-none">
						<p class="text-[0.75em]">
							{tile.clueNumber || ''}
						</p>
					</div>
					<div class="flex items-center justify-center w-full h-full absolute top-1">
							<p class="text-[22px] cursor-default select-none">
								{tile.guess}
							</p>
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>
<p>
	<span>{currentClueNumber}. {clues[direction][currentClueNumber]}</span>
</p>
