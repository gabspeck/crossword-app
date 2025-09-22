import type { AnswerTile, BlankTile } from '$lib/puzzle';

export type CheckStatus = 'correct' | 'incorrect' | null;

export type NonBlankTile = Exclude<GridTile, BlankTile>;

export type GridTile = (
	| BlankTile
	| (AnswerTile & {
			guess: string;
			check: CheckStatus;
			revealed: boolean;
	  })
) & {
	element: SVGGElement | null;
};
