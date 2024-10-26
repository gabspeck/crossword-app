<script lang="ts">

	type Direction = 'across' | 'down'

	type Clue = {
		number: number
		prompt: string
		start: number
		end: number
	}

	type BlankTile = { isBlank: true }
	type AnswerTile = { isBlank?: false, label?: string, answer: string }

	type Tile = | BlankTile | AnswerTile

	type GridTile = | BlankTile | AnswerTile & {
		guess: string,
		focused: boolean
		clueIndex: { [d in Direction]: number }
	}

	type NonBlankTile = Exclude<GridTile, BlankTile>

	type Puzzle = {
		cols: number,
		rows: number,
		clues: { [d in Direction]: Clue[] },
		tiles: Tile[]
	}

	let puzzle: Puzzle = {
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
		tiles:
			[
				{
					label: '1',
					answer: 'P'
				},
				{
					label: '2',
					answer: 'L'
				},
				{
					label: '3',
					answer: 'A'
				},
				{
					label: '4',
					answer: 'T'
				},
				{
					label: '5',
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					label: '6',
					answer: 'S'
				},
				{
					label: '7',
					answer: 'M'
				},
				{
					label: '8',
					answer: 'O'
				},
				{
					label: '9',
					answer: 'G'
				},
				{
					isBlank: true
				},
				{
					label: '10',
					answer: 'O'
				},
				{
					label: '11',
					answer: 'F'
				},
				{
					label: '12',
					answer: 'F'
				},
				{
					label: '13',
					answer: 'S'
				},
				{
					label: '14',
					answer: 'A'
				},
				{
					answer: 'I'
				},
				{
					answer: 'S'
				},
				{
					answer: 'H'
				},
				{
					answer: 'A'
				},
				{
					isBlank: true
				},
				{
					label: '15',
					answer: 'T'
				},
				{
					answer: 'A'
				},
				{
					answer: 'C'
				},
				{
					answer: 'O'
				},
				{
					isBlank: true
				},
				{
					label: '16',
					answer: 'A'
				},
				{
					answer: 'L'
				},
				{
					answer: 'L'
				},
				{
					answer: 'A'
				},
				{
					label: '17',
					answer: 'P'
				},
				{
					answer: 'E'
				},
				{
					answer: 'T'
				},
				{
					answer: 'E'
				},
				{
					answer: 'R'
				},
				{
					label: '18',
					answer: 'C'
				},
				{
					answer: 'O'
				},
				{
					answer: 'T'
				},
				{
					answer: 'T'
				},
				{
					answer: 'O'
				},
				{
					label: '19',
					answer: 'N'
				},
				{
					answer: 'T'
				},
				{
					answer: 'A'
				},
				{
					answer: 'I'
				},
				{
					answer: 'L'
				},
				{
					label: '20',
					answer: 'I'
				},
				{
					answer: 'D'
				},
				{
					answer: 'O'
				},
				{
					answer: 'L'
				},
				{
					isBlank: true
				},
				{
					label: '21',
					answer: 'O'
				},
				{
					answer: 'N'
				},
				{
					answer: 'E'
				},
				{
					answer: 'O'
				},
				{
					answer: 'N'
				},
				{
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					label: '22',
					answer: 'M'
				},
				{
					answer: 'E'
				},
				{
					answer: 'T'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '23',
					answer: 'I'
				},
				{
					label: '24',
					answer: 'S'
				},
				{
					answer: 'E'
				},
				{
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '25',
					answer: 'T'
				},
				{
					answer: 'A'
				},
				{
					label: '26',
					answer: 'P'
				},
				{
					answer: 'E'
				},
				{
					answer: 'R'
				},
				{
					answer: 'S'
				},
				{
					label: '27',
					answer: 'B'
				},
				{
					label: '28',
					answer: 'R'
				},
				{
					label: '29',
					answer: 'O'
				},
				{
					answer: 'K'
				},
				{
					answer: 'E'
				},
				{
					answer: 'N'
				},
				{
					answer: 'R'
				},
				{
					label: '30',
					answer: 'E'
				},
				{
					label: '31',
					answer: 'C'
				},
				{
					answer: 'O'
				},
				{
					answer: 'R'
				},
				{
					answer: 'D'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '32',
					answer: 'L'
				},
				{
					answer: 'E'
				},
				{
					answer: 'V'
				},
				{
					answer: 'E'
				},
				{
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '33',
					answer: 'A'
				},
				{
					answer: 'P'
				},
				{
					answer: 'U'
				},
				{
					isBlank: true
				},
				{
					label: '34',
					answer: 'F'
				},
				{
					label: '35',
					answer: 'E'
				},
				{
					label: '36',
					answer: 'D'
				},
				{
					label: '37',
					answer: 'S'
				},
				{
					label: '38',
					answer: 'O'
				},
				{
					answer: 'D'
				},
				{
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					label: '39',
					answer: 'P'
				},
				{
					label: '40',
					answer: 'O'
				},
				{
					label: '41',
					answer: 'S'
				},
				{
					answer: 'T'
				},
				{
					answer: 'U'
				},
				{
					answer: 'R'
				},
				{
					label: '42',
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					label: '43',
					answer: 'G'
				},
				{
					answer: 'O'
				},
				{
					answer: 'O'
				},
				{
					label: '44',
					answer: 'W'
				},
				{
					answer: 'O'
				},
				{
					answer: 'R'
				},
				{
					label: '45',
					answer: 'M'
				},
				{
					isBlank: true
				},
				{
					label: '46',
					answer: 'R'
				},
				{
					answer: 'T'
				},
				{
					answer: 'E'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '47',
					answer: 'L'
				},
				{
					label: '48',
					answer: 'E'
				},
				{
					answer: 'O'
				},
				{
					answer: 'N'
				},
				{
					answer: 'A'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '49',
					answer: 'F'
				},
				{
					label: '50',
					answer: 'I'
				},
				{
					answer: 'G'
				},
				{
					answer: 'U'
				},
				{
					answer: 'R'
				},
				{
					label: '51',
					answer: 'E'
				},
				{
					label: '52',
					answer: 'S'
				},
				{
					answer: 'K'
				},
				{
					answer: 'A'
				},
				{
					answer: 'T'
				},
				{
					answer: 'E'
				},
				{
					answer: 'R'
				},
				{
					label: '53',
					answer: 'A'
				},
				{
					label: '54',
					answer: 'R'
				},
				{
					label: '55',
					answer: 'I'
				},
				{
					answer: 'A'
				},
				{
					answer: 'N'
				},
				{
					answer: 'A'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '56',
					answer: 'M'
				},
				{
					answer: 'A'
				},
				{
					answer: 'S'
				},
				{
					answer: 'S'
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					isBlank: true
				},
				{
					label: '57',
					answer: 'T'
				},
				{
					answer: 'O'
				},
				{
					answer: 'M'
				},
				{
					isBlank: true
				},
				{
					label: '58',
					answer: 'U'
				},
				{
					answer: 'N'
				},
				{
					label: '59',
					answer: 'E'
				},
				{
					label: '60',
					answer: 'V'
				},
				{
					answer: 'E'
				},
				{
					answer: 'N'
				},
				{
					isBlank: true
				},
				{
					label: '61',
					answer: 'Y'
				},
				{
					label: '62',
					answer: 'E'
				},
				{
					label: '63',
					answer: 'A'
				},
				{
					label: '64',
					answer: 'S'
				},
				{
					label: '65',
					answer: 'H'
				},
				{
					answer: 'O'
				},
				{
					answer: 'P'
				},
				{
					label: '66',
					answer: 'S'
				},
				{
					answer: 'K'
				},
				{
					answer: 'I'
				},
				{
					answer: 'P'
				},
				{
					answer: 'A'
				},
				{
					answer: 'N'
				},
				{
					answer: 'D'
				},
				{
					label: '67',
					answer: 'A'
				},
				{
					answer: 'J'
				},
				{
					answer: 'U'
				},
				{
					answer: 'M'
				},
				{
					answer: 'P'
				},
				{
					label: '68',
					answer: 'O'
				},
				{
					answer: 'S'
				},
				{
					answer: 'L'
				},
				{
					answer: 'O'
				},
				{
					isBlank: true
				},
				{
					label: '69',
					answer: 'S'
				},
				{
					answer: 'E'
				},
				{
					answer: 'N'
				},
				{
					answer: 'D'
				},
				{
					isBlank: true
				},
				{
					label: '70',
					answer: 'C'
				},
				{
					answer: 'O'
				},
				{
					answer: 'R'
				},
				{
					answer: 'E'
				},
				{
					answer: 'R'
				},
				{
					label: '71',
					answer: 'S'
				},
				{
					answer: 'T'
				},
				{
					answer: 'Y'
				},
				{
					answer: 'X'
				},
				{
					isBlank: true
				},
				{
					label: '72',
					answer: 'T'
				},
				{
					answer: 'E'
				},
				{
					answer: 'E'
				},
				{
					answer: 'S'
				},
				{
					isBlank: true
				},
				{
					label: '73',
					answer: 'E'
				},
				{
					answer: 'B'
				},
				{
					answer: 'O'
				},
				{
					answer: 'N'
				},
				{
					answer: 'Y'
				}
			]
	};

	$inspect(puzzle);

	let tiles: GridTile[] = $state(puzzle.tiles.map((t, tileIndex) => {

		return {
			...t,
			guess: '',
			focused: false,
			clueIndex: {
				across: puzzle.clues.across.findIndex(c => c.start <= tileIndex && c.end >= tileIndex),
				down: puzzle.clues.down.findIndex(c => {
					for (let i = c.start; i <= c.end; i += puzzle.cols) {
						if (i === tileIndex) {
							return true;
						}
					}
					return false;
				})
			}
		};
	}));

	let currentDirection: Direction = $state('across');
	let currentClue: Clue = $state(puzzle.clues.across[0]);
	$inspect(currentClue)
	let currentTile: NonBlankTile = $state(tiles[puzzle.clues.across[0].start] as NonBlankTile);

	$effect(() => {
		if (!currentTile.focused) {
			currentTile.focused = true;
		}
	});

	$effect(() => {
		const tileClue = puzzle.clues[currentDirection][currentTile.clueIndex[currentDirection]];
		if (tileClue.end !== currentClue.end) {
			currentClue = tileClue;
		}
	});


	const setCurrentTile = (tile: NonBlankTile) => {
		if (tile !== currentTile) {
			currentTile.focused = false;
			currentTile = tile;
		}
	};

	const onTileKeyDown = (ev: KeyboardEvent, tile: NonBlankTile) => {
		tile.guess = ev.key.toUpperCase();
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
		class="inline-grid grid-cols-{puzzle.cols} gap-0 border-[3px] border-black font-['Helvetica']"
	>
		{#each tiles as tile}
			<div
				tabindex={tile.isBlank ? null : 0}
				role="gridcell"
				class="border-[#696969] border-r-[1px] border-b-[1px] w-[33px] h-[33px] focus:outline-none relative"
				class:bg-[#FFDA00]={!tile.isBlank && tile.focused}
				class:bg-[#A7D8FF]={false}
				class:bg-black={tile.isBlank}
				onmousedown={tile.isBlank ? null : ev => ev.preventDefault()}
				onkeydown={tile.isBlank ? null : (ev) => onTileKeyDown(ev, tile)}
				onclick={tile.isBlank ? null : onTileClick}
				onfocus={tile.isBlank ? null : () => {setCurrentTile(tile)}}>
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
</main>
