<script lang="ts">
	import PopupMenu from './PopupMenu.svelte';
	import { getGameContext } from '$lib/context.svelte';
	import { onMount } from 'svelte';
	import type { GridTile, NonBlankTile } from '$lib/types';
	import type { Clue } from '$lib';

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const secondsPart = seconds % 60;
		const minutesPart = minutes % 60;

		return `${hours > 0 ? `${hours}:` : ''}${minutesPart.toString().padStart(hours > 0 ? 2 : 1, '0')}:${secondsPart.toString().padStart(2, '0')}`;
	};

	const ctx = getGameContext();


	const startTimer = () => {
		if (ctx.derived.paused) {
			ctx.state.timerRef = setInterval(() => {
				ctx.state.secondsSpent++;
			}, 1000);
		}
	};

	const pauseTimer = () => {
		if (ctx.state.timerRef) {
			clearInterval(ctx.state.timerRef);
			ctx.state.timerRef = 0;
		}
	};

	const revealTile = (tile: GridTile) => {
		if (!tile.isBlank && tile.guess !== tile.answer) {
			tile.guess = tile.answer;
			tile.revealed = true;
			tile.check = 'correct';
		}
	};
	const revealClue = () => {
		ctx.derived.currentClue.tiles.forEach((tileNumber) => {
			revealTile(ctx.state.tiles[tileNumber]);
		});
	};

	const revealPuzzle = () => {
		ctx.state.tiles.forEach((tile) => {
			revealTile(tile as NonBlankTile);
		});
	};

	const resetPuzzle = () => {
		ctx.state.tiles.forEach((tile) => {
			if (!tile.isBlank) {
				tile.guess = '';
				tile.revealed = false;
				tile.check = null;
			}
			ctx.state.currentTileIndex = ctx.state.puzzle.clues[0].tiles[0];
			ctx.state.secondsSpent = 0;
		});
	};

	$effect(() => {
		if ((!ctx.state.assistanceUsed && ctx.derived.currentTile.check) || ctx.derived.currentTile.revealed) {
			ctx.state.assistanceUsed = true;
		}
	});

	onMount(() => {
		startTimer();
	});

	const toggleTimer = () => {
		if (ctx.derived.paused) {
			startTimer();
		} else {
			pauseTimer();
		}
	};

	const checkTile = (tile: GridTile) => {
		if (!tile.isBlank && tile.guess && !tile.check) {
			tile.check = tile.guess === tile.answer ? 'correct' : 'incorrect';
		}
	};

	const checkClue = (clue: Clue) => {
		for (let tileIndex of clue.tiles) {
			checkTile(ctx.state.tiles[tileIndex]);
		}
	};

	const checkGrid = () => {
		for (let tile of ctx.state.tiles) {
			checkTile(tile);
		}
	};

</script>
<div class="flex flex-row items-center lg:justify-start py-2 gap-4 mx-auto">
	<p>🕰️ {formatDuration(ctx.state.secondsSpent)}</p>
	<button class:invisible={ctx.derived.solved} class="hover:bg-slate-300" onclick={toggleTimer}
	>{ctx.derived.paused ? '▶️' : '⏸️'}
	</button>
	<PopupMenu
		label="Reveal"
		items={[
							{ label: 'Letter', callback: () => revealTile(ctx.derived.currentTile)},
							{ label: 'Word', callback:  revealClue},
							{ label: 'Puzzle', callback:  revealPuzzle}
						]}
	/>
	<PopupMenu
		label="Check"
		items={[
							{ label: 'Letter', callback: () => checkTile(ctx.derived.currentTile)},
							{ label: 'Word', callback: () => checkClue(ctx.derived.currentClue)},
							{ label: 'Puzzle', callback: checkGrid}
						]}
	/>
	<button onclick={resetPuzzle}>Reset</button>
</div>
