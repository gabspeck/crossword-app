<script lang="ts">
	import PopupMenu from './PopupMenu.svelte';

	export let secondsSpent: number;
	export let solved: boolean;
	export let paused: boolean;
	export let onRevealLetter: () => void;
	export let onRevealWord: () => void;
	export let onRevealPuzzle: () => void;
	export let onToggleTimer: () => void;
	export let onCheckLetter: () => void;
	export let onCheckWord: () => void;
	export let onCheckPuzzle: () => void;
	export let onResetPuzzle: () => void;

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
