import { advanceClue, advanceTile, firstEmptyTileInClue } from '$lib/movement';
import { type GameContext } from '$lib/context.svelte';
import type { NonBlankTile } from '$lib/types';

export const onTileKeyDown = (
	ctx: GameContext,
	eventOrKey: KeyboardEvent | string,
	tile: NonBlankTile
) => {
	const [ev, key] =
		typeof eventOrKey === 'string'
			? [null, eventOrKey.toUpperCase()]
			: [eventOrKey, eventOrKey.key.toUpperCase()];
	const uncheckedTile = tile.guess && tile.check !== 'correct';
	switch (key) {
		case 'TAB':
			ev?.preventDefault();
			advanceClue(ctx, ev?.shiftKey ? -1 : 1);
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
			} else if (
				(ctx.state.currentDirection === 'across' && ctx.derived.currentColIndex > 0) ||
				ctx.derived.currentRowIndex > 0
			) {
				const prevTileIndex =
					ctx.state.currentDirection === 'across'
						? Math.max(ctx.state.currentTileIndex - 1, 0)
						: ctx.state.currentTileIndex - ctx.state.puzzle.dimensions.rows < 0
							? ctx.state.currentTileIndex
							: ctx.state.currentTileIndex - ctx.state.puzzle.dimensions.rows;
				if (
					prevTileIndex !== ctx.state.currentTileIndex &&
					!ctx.state.tiles[prevTileIndex].isBlank
				) {
					if (ctx.state.tiles[prevTileIndex].check !== 'correct') {
						ctx.state.tiles[prevTileIndex].check = null;
						ctx.state.tiles[prevTileIndex].guess = '';
					}
					ctx.state.currentTileIndex = prevTileIndex;
				}
			}
			break;
		case 'ARROWUP':
		case 'ARROWDOWN':
			if (ctx.state.currentDirection === 'across') {
				ev?.preventDefault();
				ctx.state.currentDirection = 'down';
			} else {
				advanceTile(ctx, key === 'ARROWUP' ? 'up' : 'down');
			}
			break;
		case 'ARROWLEFT':
		case 'ARROWRIGHT':
			if (ctx.state.currentDirection === 'down') {
				ev?.preventDefault();
				ctx.state.currentDirection = 'across';
			} else {
				advanceTile(ctx, key === 'ARROWLEFT' ? 'left' : 'right');
			}
			break;
		default:
			if (key.length === 1 && !ctx.derived.paused && !ctx.derived.solved) {
				if (tile.check !== 'correct') {
					tile.guess = key.toUpperCase().trim();
					tile.check = null;
				}
				if (ctx.state.currentTileIndex === ctx.derived.currentClue.tiles.at(-1)) {
					const firstEmpty = firstEmptyTileInClue(ctx, ctx.derived.currentClue);
					if (firstEmpty != undefined) {
						ctx.state.currentTileIndex = firstEmpty;
					}
				} else {
					advanceTile(ctx, ctx.state.currentDirection === 'across' ? 'right' : 'down');
				}
			}
			break;
	}
};
