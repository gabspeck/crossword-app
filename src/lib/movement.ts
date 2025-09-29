import type { Clue, NonBlankTile } from '$lib/types';
import { type GameContext } from '$lib/context.svelte';

export const firstEmptyTileInClue = (ctx: GameContext, clue: Clue) =>
	clue.tiles.find((idx) => (ctx.state.tiles[idx] as NonBlankTile).guess === '');

export const goToClue = (ctx: GameContext, clue: Clue) => {
	if (clue.direction !== ctx.state.currentDirection) {
		ctx.state.currentDirection = clue.direction;
	}
	ctx.state.currentTileIndex = firstEmptyTileInClue(ctx, clue) || clue.tiles[0];
};

export const advanceClue = (ctx: GameContext, step: 1 | -1) => {
	let nextClueIndex =
		(ctx.derived.currentTile.clues[ctx.state.currentDirection] + step) %
		ctx.state.puzzle.clues.length;
	if (nextClueIndex < 0) {
		nextClueIndex = ctx.state.puzzle.clues.findLastIndex(
			(c) => c.direction === (ctx.state.currentDirection === 'across' ? 'down' : 'down')
		);
	}
	const nextClue = ctx.state.puzzle.clues[nextClueIndex];
	goToClue(ctx, nextClue);
};

export const advanceTile = (ctx: GameContext, direction: 'up' | 'down' | 'left' | 'right') => {
	const { cols } = ctx.state.puzzle.dimensions;
	const step = {
		up: -cols,
		down: cols,
		left: -1,
		right: 1
	}[direction];

	let tentativeTileIndex = ctx.state.currentTileIndex;

	while (true) {
		tentativeTileIndex += step;

		if (tentativeTileIndex < 0 || tentativeTileIndex >= ctx.state.tiles.length) {
			break;
		}

		const tentativeRowIndex = Math.floor(tentativeTileIndex / cols);
		const tentativeColIndex = tentativeTileIndex % cols;

		if (
			(direction === 'left' || direction === 'right') &&
			tentativeRowIndex !== ctx.derived.currentRowIndex
		) {
			break;
		}

		if (
			(direction === 'up' || direction === 'down') &&
			tentativeColIndex !== ctx.derived.currentColIndex
		) {
			break; // Next tile is in a different column
		}

		const nextTile = ctx.state.tiles[tentativeTileIndex];

		if (!nextTile.isBlank) {
			ctx.state.currentTileIndex = tentativeTileIndex;
			break;
		}
	}
};
