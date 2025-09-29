<script lang="ts">
	import { onTileKeyDown } from '$lib/input';
	import { getGameContext } from '$lib/context.svelte';

	const rows: string[] = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM⌫'];

	const keyName = (key: string): string => {
		const specialKeys: Record<string, string> = {
			'⌫': 'BACKSPACE'
		};

		return specialKeys[key] ?? key;
	};

	const ctx = getGameContext();

</script>

<div class="flex flex-col gap-2 select-none w-full max-w-[520px] mx-auto" role="group" aria-label="On-screen keyboard">
	{#each rows as row}
		<div class="flex justify-center gap-2">
			{#each row.split('') as key}
				<svg
					class="w-11 h-14 cursor-pointer focus:outline focus:outline-2 focus:outline-indigo-600 focus:outline-offset-2"
					viewBox="0 0 44 56"
					role="button"
					tabindex="0"
					aria-label={keyName(key)}
					onpointerdown={() => onTileKeyDown(keyName(key), ctx.derived.currentTile)}
					onkeydown={(e) => {
						if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
							e.preventDefault();
							onTileKeyDown(keyName(key), ctx.derived.currentTile);
						}
					}}
				>
					<rect
						x="0.5"
						y="0.5"
						width="43"
						height="55"
						rx="8"
						class="fill-gray-100 stroke-gray-300 hover:fill-gray-200"
						stroke-width="1"
					/>
					<text
						x="50%"
						y="50%"
						text-anchor="middle"
						dominant-baseline="central"
						class="font-semibold text-lg fill-gray-900"
					>
						{key}
					</text>
				</svg>
			{/each}
		</div>
	{/each}
</div>
