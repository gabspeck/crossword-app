<script lang="ts">

	import { getGameContext } from '$lib/context.svelte';
	import { onTileKeyDown } from '$lib/input';

	const ctx = getGameContext();

	const gridSideLength = 500;
	const gridStrokeWidth = 3;
	const marginOffset = gridStrokeWidth / 2;
	const cellSide = gridSideLength / ctx.state.puzzle.dimensions.cols;
	const cellX = (idx: number) => (idx % ctx.state.puzzle.dimensions.cols) * cellSide + marginOffset;
	const cellY = (idx: number) => Math.floor(idx / ctx.state.puzzle.dimensions.cols) * cellSide + marginOffset;

	const onTileClick = ({ currentTarget: tile }: MouseEvent & { currentTarget: SVGGElement }) => {
		if (tile !== document.activeElement) {
			tile.focus();
		} else {
			ctx.state.currentDirection = ctx.state.currentDirection === 'across' ? 'down' : 'across';
		}
	};

	const onTileFocus = (idx: number) => {
		if (idx !== ctx.state.currentTileIndex) ctx.state.currentTileIndex = idx;
	};

	$effect(() => {
		ctx.derived.currentTile.element?.focus();
	})

</script>
<svg
	class="select-none"
	viewBox="0 0 {gridSideLength + gridStrokeWidth} {gridSideLength + gridStrokeWidth}"
>
	{#each ctx.state.tiles as cell, idx}
		<g
			bind:this={cell.element}
			pointer-events="visible"
			class="focus:outline-none"
			tabindex={cell.isBlank ? null : 0}
			role="gridcell"
			onmousedown={cell.isBlank ? null : (ev) => ev.preventDefault()}
			onkeydown={cell.isBlank ? null : (ev) => onTileKeyDown(ctx, ev, cell)}
			onclick={cell.isBlank ? null : onTileClick}
			onfocus={cell.isBlank
									? null
									: () => onTileFocus(idx)}>
			<rect
				width={cellSide}
				height={cellSide}
				class:fill-[#FFDA00]={!cell.isBlank && ctx.state.currentTileIndex === idx}
				class:fill-[#A7D8FF]={!cell.isBlank &&
										ctx.derived.currentTile.clues[ctx.state.currentDirection] === cell.clues[ctx.state.currentDirection]}
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
					y={cellY(idx) + cellSide - 4}>{ctx.derived.paused && !ctx.derived.solved ? '' : cell.guess}</text
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
