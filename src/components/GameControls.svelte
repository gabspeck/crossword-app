<script lang="ts">
	import PopupMenu from './PopupMenu.svelte';

	type GameControlsProps = {
		secondsSpent: number;
		solved: boolean;
		paused: boolean;
		onRevealLetter: () => void;
		onRevealWord: () => void;
		onRevealPuzzle: () => void;
		onToggleTimer: () => void;
		onCheckLetter: () => void;
		onCheckWord: () => void;
		onCheckPuzzle: () => void;
		onResetPuzzle: () => void;
	};

	let {
		secondsSpent,
		solved,
		paused,
		onRevealLetter,
		onRevealWord,
		onRevealPuzzle,
		onToggleTimer,
		onCheckLetter,
		onCheckWord,
		onCheckPuzzle,
		onResetPuzzle
	}: GameControlsProps = $props();

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const secondsPart = seconds % 60;
		const minutesPart = minutes % 60;

		return `${hours > 0 ? `${hours}:` : ''}${minutesPart.toString().padStart(hours > 0 ? 2 : 1, '0')}:${secondsPart.toString().padStart(2, '0')}`;
	};
</script>
<div class="flex flex-row items-center lg:justify-start py-2 gap-4 mx-auto">
	<p>🕰️ {formatDuration(secondsSpent)}</p>
	<button class:invisible={solved} class="hover:bg-slate-300" onclick={onToggleTimer}
	>{paused ? '▶️' : '⏸️'}
	</button>
	<PopupMenu
		label="Reveal"
		items={[
							{ label: 'Letter', callback: onRevealLetter},
							{ label: 'Word', callback:  onRevealWord},
							{ label: 'Puzzle', callback:  onRevealPuzzle}
						]}
	/>
	<PopupMenu
		label="Check"
		items={[
							{ label: 'Letter', callback: onCheckLetter},
							{ label: 'Word', callback: onCheckWord},
							{ label: 'Puzzle', callback: onCheckPuzzle}
						]}
	/>
	<button onclick={onResetPuzzle}>Reset</button>
</div>
