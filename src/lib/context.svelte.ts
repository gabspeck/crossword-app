import { getContext, setContext } from 'svelte';
import type { Clue, Direction, GridTile, NonBlankTile, Puzzle } from '$lib/types';

export type GameContext = {
	state: {
		puzzle: Puzzle;
		tiles: GridTile[];
		currentDirection: Direction;
		currentTileIndex: number;
		assistanceUsed: boolean;
		secondsSpent: number;
		timerRef: number;
	};
	derived: {
		paused: boolean;
		currentRowIndex: number;
		currentColIndex: number;
		currentTile: NonBlankTile;
		currentClue: Clue;
		solved: boolean;
	};
};

const key = 'game';

export function setGameContext(context: GameContext) {
	setContext(key, context);
	return getGameContext();
}

export function getGameContext(): GameContext {
	return getContext(key);
}
