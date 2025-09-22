<script lang="ts">
	export let onPreviousClue: () => void;
	export let onNextClue: () => void;
	export let prompt: string;
</script>

<div class="h-16 px-5 flex bg-[#a7d8ff]">
	<button class="shrink-0 w-8" onclick={onPreviousClue}>&lt;</button>
	<div class="flex-1 min-w-0">
		<div class="w-full h-full flex overflow-x-auto">
			<span class="min-w-full my-auto">{prompt}</span>
		</div>
	</div>
	<button class="shrink-0 w-8" onclick={onNextClue}>&gt;</button>
</div>
