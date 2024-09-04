<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const tiles: string[][] = [
		['T', 'A', 'B', '', ''],
		['I', 'T', 'E', 'M', ''],
		['F', 'E', 'R', 'A', 'L'],
		['F', 'U', 'R', 'R', 'Y'],
		['S', 'P', 'A', 'C', 'E']
	];

	let rowLength = tiles.length;
	let columnLength = tiles[0].length;

	const isEmptyTile = (tile: string) => tile === '';

	let tileElements: HTMLDivElement[][] = Array.from({ length: rowLength }, () =>
		Array.from({ length: columnLength })
	);

	let tileNumbers: string[][];
	$: {
		let clueCount = 1;
		tileNumbers = tiles.map((row, rowIndex) =>
			row.map((tile, colIndex) => {
				if (
					!isEmptyTile(tile) &&
					(rowIndex === 0 ||
						isEmptyTile(tiles[rowIndex - 1][colIndex]) ||
						colIndex === 0 ||
						isEmptyTile(tiles[rowIndex][colIndex - 1]))
				) {
					return (clueCount++).toString();
				}
				return '';
			})
		);
	}

	let focusRow = 0;
	let focusCol = 0;

	$: {
		if (browser) {
			const tile = tileElements[focusRow][focusCol]
			if (tile && document.activeElement !== tile) {
				tile.focus();
			}
		}
	}

	const onTileKeyUp = (ev: KeyboardEvent) => {
		const key = ev.key.toUpperCase();
		let nextRow = focusRow,
			nextCol = focusCol;

		switch (key) {
			case 'ARROWUP':
				nextRow = Math.max(0, focusRow - 1);
				break;
			case 'ARROWDOWN':
				nextRow = Math.min(rowLength - 1, focusRow + 1);
				break;
			case 'ARROWLEFT':
				nextCol = Math.max(0, focusCol - 1);
				break;
			case 'ARROWRIGHT':
				nextCol = Math.min(columnLength - 1, focusCol + 1);
				break;
			default:
				if (ev.key.length === 1) {
					tiles[focusRow][focusCol] = ev.key.toUpperCase();
				}
		}

		const nextTileIsBlank = isEmptyTile(tiles[nextRow][nextCol]);

		if (nextRow !== focusRow && !nextTileIsBlank) {
			focusRow = nextRow;
		}

		if (nextCol !== focusCol && !nextTileIsBlank) {
			focusCol = nextCol;
		}
	};

	const logEvent = (ev: Event, preventDefault = false) => {
		if (preventDefault) {
			ev.preventDefault();
			return false;
		}
		console.log(ev.type, ev.isComposing ? 'composing' : '');
	};

	const onTileFocus = (rowIndex: number, colIndex: number) => {
		if (rowIndex !== focusRow || colIndex !== focusCol) {
			focusRow = rowIndex;
			focusCol = colIndex;
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
					on:keyup={onTileKeyUp}
					tabindex={tile !== '' ? 0 : null}
					bind:this={tileElements[rowIndex][colIndex]}
					class="border-[#696969] w-[3em] h-[3em] focus:bg-[#FFDA00] focus:outline-none"
					class:border-r-[1px]={colIndex < columnLength - 1}
					class:border-b-[1px]={rowIndex < rowLength - 1}
					class:bg-black={isEmptyTile(tile)}
					on:focus={() => {
						onTileFocus(rowIndex, colIndex);
					}}
				>
					{#if !isEmptyTile(tile)}
						<span class="h-[0.75em] pl-0.5 text-[0.75em] cursor-default select-none">
							{tileNumbers && tileNumbers[rowIndex][colIndex]}
						</span>
						<span class="w-full h-full text-center pt-1 text-[1.5em] cursor-default select-none">
							{tiles[rowIndex][colIndex]}
						</span>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</body>
