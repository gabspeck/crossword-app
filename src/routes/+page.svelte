<script lang="ts">

	import { type GameContext, setGameContext } from '$lib/context.svelte';
	import type { NonBlankTile } from '$lib/types';
	import { loadPuzzle } from '$lib';
	import OnScreenKeyboard from '../components/OnScreenKeyboard.svelte';
	import ClueList from '../components/ClueList.svelte';
	import ClueStrip from '../components/ClueStrip.svelte';
	import GameControls from '../components/GameControls.svelte';
	import CrosswordGrid from '../components/CrosswordGrid.svelte';

	const puzzle = loadPuzzle();

	const states: GameContext['state'] = $state({
		puzzle,
		tiles:
			puzzle.tiles.map((t) => {
				return {
					...t,
					guess: '',
					element: null,
					check: null,
					revealed: false
				};
			}),
		currentDirection: 'across',
		currentTileIndex: puzzle.clues[0].tiles[0],
		timerRef: 0,
		assistanceUsed: false,
		secondsSpent: 0
	});
	const currentTile = $derived(states.tiles[states.currentTileIndex]) as NonBlankTile;
	const deriveds: GameContext['derived'] = $derived({
		paused: !states.timerRef,
		currentRowIndex: Math.floor(states.currentTileIndex / states.puzzle.dimensions.cols),
		currentColIndex: states.currentTileIndex % states.puzzle.dimensions.cols,
		get currentTile() {
			return currentTile;
		},
		currentClue: states.puzzle.clues[currentTile.clues[states.currentDirection]],
		solved: !states.tiles.some((t) => !t.isBlank && t.guess !== t.answer)
	});

	setGameContext({
		state: states, get derived() {
			return deriveds;
		}
	});


</script>

<main class="flex justify-center fixed">
	<div class="flex flex-col w-screen h-[100dvh] max-w-screen-2xl overflow-hidden">
		<div class="flex flex-col overflow-hidden">
			<div class="flex lg:flex-auto flex-col justify-center items-center">
				<GameControls />
				<div class="w-full h-full max-w-2xl">
					<CrosswordGrid />
					<ClueStrip />
				</div>
			</div>
		</div>
		<div class="hidden lg:flex flex-1 min-h-0">
			<ClueList />
		</div>
		<div class="lg:hidden mt-2">
			<OnScreenKeyboard />
		</div>
	</div>
</main>
