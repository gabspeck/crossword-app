<script lang="ts">
	import { onMount } from 'svelte';

	type Direction = 'across' | 'down'

	type Clue = {
		number: number
		prompt: string
		start: number
		end: number
	}

	type PuzzleTile =
		| {
		isBlank: true
	} | {
		isBlank?: false
		label?: string
		answer: string
	}

	type Puzzle = {
		cols: number,
		rows: number,
		clues: { [d in Direction]: Clue[] },
		tiles: PuzzleTile[]
	}


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

	const puzzle: Puzzle = {
		cols: 15,
		rows: 15,
		clues: {
			across: [
				{ number: 1, prompt: 'Spinning item for a circus performer', start: 0, end: 4 },
				{ number: 6, prompt: 'Pollution portmanteau', start: 6, end: 9 },
				{ number: 10, prompt: 'Does in, in mob slang', start: 11, end: 14 },
				{ number: 14, prompt: 'Actress Hinds of "9-1-1"', start: 15, end: 19 },
				{ number: 15, prompt: 'Choco ___ (frozen treat with a rhyming name)', start: 21, end: 24 },
				{ number: 16, prompt: 'Penne ___ vodka', start: 26, end: 29 },
				{ number: 17, prompt: 'Song character who comes "down the bunny trail"', start: 30, end: 44 },
				{ number: 20, prompt: 'Revered star', start: 45, end: 48 },
				{ number: 23, prompt: '"Makes sense"', start: 63, end: 66 },
				{ number: 25, prompt: 'Narrows at the end', start: 70, end: 75 },
				{ number: 27, prompt: 'Someone who says the same thing again and again, metaphorically', start: 75, end: 86 },
				{ number: 32, prompt: 'Engineered embankment', start: 90, end: 94 },
				{ number: 33, prompt: 'Kwik-E-Mart operator on "The Simpsons"', start: 97, end: 99 },
				{ number: 34, prompt: 'National law enforcement officers, with "the"', start: 101, end: 104 },
				{ number: 38, prompt: 'Dedicated poem', start: 105, end: 107 },
				{ number: 39, prompt: 'Stance', start: 109, end: 115 },
				{ number: 43, prompt: 'Slime', start: 123, end: 125 },
				{ number: 44, prompt: 'Gummy candy shape', start: 135, end: 138 },
				{ number: 46, prompt: 'U.S. 101 or 66: Abbr.', start: 141, end: 142 },
				{ number: 47, prompt: '"Bleeding Love" singer Lewis', start: 144, end: 148 },
				{ number: 49, prompt: 'One having an ice time at the Olympics?', start: 150, end: 161 },
				{ number: 53, prompt: 'Pop singer Grande', start: 165, end: 170 },
				{ number: 56, prompt: 'The "m" of e = mc^2', start: 174, end: 177 },
				{ number: 58, prompt: 'Rocky', start: 179, end: 184 },
				{ number: 61, prompt: 'Senate affirmatives', start: 186, end: 189 },
				{ number: 65, prompt: 'Short distance to travel, with a hint to 17-, 27- and 49-Across', start: 195, end: 209 },
				{ number: 68, prompt: 'City where the Nobel Peace Prize is awarded', start: 210, end: 213 },
				{ number: 69, prompt: 'Put in the mail', start: 215, end: 218 },
				{ number: 70, prompt: 'Kitchen gadget for apples', start: 220, end: 224 },
				{ number: 71, prompt: 'River to Hades', start: 225, end: 228 },
				{ number: 72, prompt: 'They may be graphic', start: 230, end: 233 },
				{ number: 73, prompt: 'Black wood', start: 235, end: 239 }
			],
			down: [
				{ number: 1, prompt: 'Spanish "daddy"', start: 0, end: 195 },
				{ number: 2, prompt: 'Told a fib', start: 1, end: 16 },
				{ number: 3, prompt: 'Regarding', start: 2, end: 32 },
				{ number: 4, prompt: 'Others similar', start: 3, end: 108 },
				{ number: 5, prompt: 'Outsize feature of a bat\'s head', start: 4, end: 94 },
				{ number: 6, prompt: 'Pot smoker', start: 6, end: 96 },
				{ number: 7, prompt: 'Chess game\'s ending', start: 7, end: 22 },
				{ number: 8, prompt: 'Eight: Prefix', start: 8, end: 113 },
				{ number: 9, prompt: 'Hit the road, as a band', start: 9, end: 129 },
				{ number: 10, prompt: 'Nondairy milk option', start: 11, end: 26 },
				{ number: 11, prompt: 'Symbol in Tinder\'s logo', start: 12, end: 67 },
				{ number: 12, prompt: 'Frequent-___ miles', start: 13, end: 68 },
				{ number: 13, prompt: 'Seasons to taste, say', start: 14, end: 69 },
				{ number: 18, prompt: 'Director Joel or Ethan', start: 30, end: 135 },
				{ number: 19, prompt: 'Approach', start: 31, end: 46 },
				{ number: 21, prompt: 'Umpire\'s count after a ball and a strike', start: 47, end: 142 },
				{ number: 22, prompt: 'Museum in N.Y.C.\'s Central Park, with \'the\'', start: 48, end: 143 },
				{ number: 24, prompt: 'Ooze', start: 66, end: 126 },
				{ number: 26, prompt: 'Common email attachment', start: 71, end: 121 },
				{ number: 27, prompt: 'What one might do after making a birthday wish', start: 75, end: 135 },
				{ number: 28, prompt: 'Second chance', start: 76, end: 121 },
				{ number: 29, prompt: 'Finished', start: 77, end: 92 },
				{ number: 30, prompt: 'Picky ___', start: 78, end: 93 },
				{ number: 31, prompt: 'PC "brain"', start: 79, end: 94 },
				{ number: 35, prompt: 'Showbiz awards quartet', start: 95, end: 140 },
				{ number: 36, prompt: 'Finished', start: 98, end: 113 },
				{ number: 37, prompt: 'Fly high', start: 99, end: 114 },
				{ number: 40, prompt: 'Musician in a cathedral', start: 110, end: 185 },
				{ number: 41, prompt: 'Letters between R and V', start: 112, end: 187 },
				{ number: 42, prompt: 'Lodge group since 1868', start: 113, end: 188 },
				{ number: 45, prompt: 'Advanced deg. for creative types', start: 129, end: 174 },
				{ number: 48, prompt: 'Gravy train gig', start: 132, end: 212 },
				{ number: 50, prompt: 'Alaska native', start: 150, end: 195 },
				{ number: 51, prompt: 'Corrects, as a text', start: 151, end: 196 },
				{ number: 52, prompt: 'What a beach shower helps wash off', start: 152, end: 197 },
				{ number: 53, prompt: 'One of the Three Musketeers', start: 165, end: 210 },
				{ number: 54, prompt: 'Pigeon\'s perch', start: 166, end: 211 },
				{ number: 55, prompt: 'Suggest indirectly', start: 167, end: 212 },
				{ number: 57, prompt: 'Sandoval of "Vanderpump Rules"', start: 178, end: 223 },
				{ number: 59, prompt: 'Fencing sword', start: 180, end: 225 },
				{ number: 60, prompt: 'Barn topper', start: 181, end: 226 },
				{ number: 62, prompt: 'Croatian currency beginning in 2023', start: 192, end: 237 },
				{ number: 63, prompt: '"___ to that!" ("Totally agree!")', start: 193, end: 238 },
				{ number: 64, prompt: 'Agile for one\'s age', start: 194, end: 239 },
				{ number: 66, prompt: 'Word after White or Red', start: 210, end: 225 },
				{ number: 67, prompt: 'Card above king', start: 213, end: 228 }
			]
		},
		tiles: (() => {
			let clueCount = 1;
			return solution.flatMap<PuzzleTile>((row, rowIdx, arr) => {
				return row.map<PuzzleTile>((tile, colIdx) => {
					if (tile === '') {
						return { isBlank: true };
					}
					const label = (rowIdx === 0 || colIdx === 0) || (arr[rowIdx - 1][colIdx] === '' || arr[rowIdx][colIdx - 1] === '') ? (clueCount++).toString() : null;
					return {
						...(label ? { label } : {}),
						answer: tile
					};
				});
			});
		})()
	};
	console.log(JSON.stringify(puzzle));
	// NYT September 2, 2024
	const { tiles, rows, cols } = puzzle;

	// Group the tiles into rows based on the number of columns (cols)
	const grid: PuzzleTile[][] = [];
	for (let row = 0; row < rows; row++) {
		const start = row * cols;
		const end = start + cols;
		grid.push(tiles.slice(start, end));
	}

	let isPointerDown = $state(false);

	onMount(() => {
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

	let rowLength = puzzle.rows;
	let columnLength = puzzle.cols;
	let direction: Direction = $state('across');

	let focusRow = $state(0);
	let focusCol = $state(0);

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

	const onTileClick = (ev: MouseEvent, tile: PuzzleTile, rowIndex: number, colIndex: number) => {
		if (ev.button !== 0 || tile.isBlank) {
			return;
		}
		if (rowIndex === focusRow && colIndex === focusCol) {
			direction = direction === 'down' ? 'across' : 'down';
		} else {
			updateFocus(rowIndex, colIndex);
		}
	};
</script>

<div
	role="grid"
	class="inline-grid grid-cols-{columnLength} gap-0 border-[3px] border-black font-['Helvetica']"
>
	{#each grid as row, rowIndex}
		{#each row as tile, colIndex}
			<div
				role="gridcell"
				onkeydown={(ev) => {}}
				tabindex={tile.isBlank ? null : 0}
				class="border-[#696969] w-[33px] h-[33px] focus:outline-none relative"
				class:border-r-[1px]={colIndex < columnLength - 1}
				class:border-b-[1px]={rowIndex < rowLength - 1}
				class:bg-[#FFDA00]={focusRow === rowIndex && focusCol === colIndex}
				class:bg-[#A7D8FF]={false}
				class:bg-black={tile.isBlank}
				onfocus={() => {
						onTileFocus(rowIndex, colIndex);
					}}
				onclick={(ev) => onTileClick(ev, tile, rowIndex, colIndex)}
			>
				{#if !tile.isBlank}
					<div class="cursor-default absolute top-[-3px] left-0.5 select-none">
						<p class="text-[0.75em]">
							{tile.label}
						</p>
					</div>
					<div class="flex justify-center w-full h-full absolute top-1">
						<p class="text-[22px] cursor-default select-none">
							{tile.answer}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>
