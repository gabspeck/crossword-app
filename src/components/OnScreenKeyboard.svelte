<script lang="ts">
	export let rows: string[] = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM⌫'];
	export let onPress: (key: string) => void;

	function handlePress(key: string) {
		if (typeof onPress === 'function') onPress(key);
	}

	const keyName = (key: string): string => {
		const specialKeys: Record<string, string> = {
			'⌫': 'BACKSPACE'
		};

		return specialKeys[key] ?? key;
	};

</script>

<div class="flex flex-col gap-2 select-none w-full max-w-[520px] mx-auto" role="group" aria-label="On-screen keyboard">
	{#each rows as row}
		<div class="flex justify-center gap-2">
			{#each row.split('') as key}
				<button
					class="w-11 h-14 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-semibold text-lg leading-tight cursor-pointer transition-all duration-150 ease-in-out hover:bg-gray-200 active:translate-y-px focus:outline focus:outline-2 focus:outline-indigo-600 focus:outline-offset-2"
					type="button"
					on:pointerdown={() => handlePress(keyName(key))}
					on:keydown={(e) => {
						if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
							e.preventDefault();
							handlePress(keyName(key));
						}
					}}
					aria-label={key}
				>
					{key}
				</button>
			{/each}
		</div>
	{/each}
</div>
