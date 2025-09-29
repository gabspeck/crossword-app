export type CheckStatus = 'correct' | 'incorrect' | null;

export type Direction = 'across' | 'down';
export type Clue = {
	direction: Direction;
	number: number;
	prompt: string;
	tiles: number[];
};
export type BlankTile = { isBlank: true };
export type AnswerTile = {
	isBlank?: false;
	label?: string;
	answer: string;
	clues: { [d in Direction]: number };
};
export type Tile = BlankTile | AnswerTile;
export type Puzzle = {
	dimensions: {
		cols: number;
		rows: number;
	};
	clues: Clue[];
	tiles: Tile[];
};
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
