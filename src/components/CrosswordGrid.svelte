<script lang="ts">

	import type { AnswerTile, Direction, Puzzle } from '$lib';
	import type { GridTile, NonBlankTile } from '$lib/types';

	type CrosswordGridProps = {
		puzzle: Puzzle;
		tiles: GridTile[];
		currentTile: AnswerTile;
		currentTileIndex: number;
		currentDirection: Direction;
		paused: boolean;
		solved: boolean;
		onKeyDown: (ev: KeyboardEvent, cell: NonBlankTile) => void;
		onTileClick: ({ currentTarget }: MouseEvent & { currentTarget: SVGGElement }) => void;
		onTileFocus: (idx: number) => void;
	};

	let {
		puzzle,
		tiles,
		currentTile,
		currentTileIndex,
		currentDirection,
		paused,
		solved,
		onKeyDown,
		onTileClick,
		onTileFocus
	}: CrosswordGridProps = $props();

	const gridSideLength = 500;
	const gridStrokeWidth = 3;
	const marginOffset = gridStrokeWidth / 2;
	const cellSide = gridSideLength / puzzle.dimensions.cols;
	const cellX = (idx: number) => (idx % puzzle.dimensions.cols) * cellSide + marginOffset;
	const cellY = (idx: number) => Math.floor(idx / puzzle.dimensions.cols) * cellSide + marginOffset;
</script>
<svg
	class="select-none"
	viewBox="0 0 {gridSideLength + gridStrokeWidth} {gridSideLength + gridStrokeWidth}"
>
	{#each tiles as cell, idx}
		<g
			bind:this={cell.element}
			pointer-events="visible"
			class="focus:outline-none"
			tabindex={cell.isBlank ? null : 0}
			role="gridcell"
			onmousedown={cell.isBlank ? null : (ev) => ev.preventDefault()}
			onkeydown={cell.isBlank ? null : (ev) => onKeyDown(ev, cell)}
			onclick={cell.isBlank ? null : onTileClick}
			onfocus={cell.isBlank
									? null
									: () => onTileFocus(idx)}>
			<rect
				width={cellSide}
				height={cellSide}
				class:fill-[#FFDA00]={!cell.isBlank && currentTileIndex === idx}
				class:fill-[#A7D8FF]={!cell.isBlank &&
										currentTile.clues[currentDirection] === cell.clues[currentDirection]}
				class:fill-black={cell.isBlank}
				x={cellX(idx)}
				y={cellY(idx)}
				stroke="#696969"
				stroke-width="1"
				fill="none"
			>
			</rect>
			{#if !cell.isBlank}
				{#if cell.label}
					<text font-size="10" x={cellX(idx) + 3} y={cellY(idx) + 10}>{cell.label}</text>
				{/if}
				<text
					font-size="24"
					text-anchor="middle"
					x={cellX(idx) + cellSide / 2}
					class:fill-[#2860d8]={cell.check === 'correct'}
					y={cellY(idx) + cellSide - 4}>{paused && !solved ? '' : cell.guess}</text
				>
				{#if cell.check === 'incorrect'}
					<line
						transform="translate({cellX(idx)},{cellY(idx)})"
						x1={cellSide}
						y1="0"
						x2="0"
						y2={cellSide}
						stroke="red"
						stroke-width="1"
					/>
				{/if}
				{#if cell.revealed}
					<g transform="translate({cellX(idx)}, {cellY(idx)})">
						<polygon
							fill="#e63333"
							points="{cellSide},0.00 {cellSide / 2},0.00 {cellSide},{cellSide / 2}"
						/>
						<circle fill="white" cx={0.85 * cellSide} cy={cellSide / 8} r="2.44" />
					</g>
				{/if}
			{/if}
		</g>
	{/each}
	<rect
		class="fill-none stroke-black"
		role="grid"
		x={marginOffset}
		y={marginOffset}
		tabindex="-1"
		width={gridSideLength}
		height={gridSideLength}
		stroke-width={gridStrokeWidth}
	/>
</svg>
