<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	type MenuItem = {
		label: string;
		callback: () => void;
	};
	type MenuProps = {
		label: string;
		items: MenuItem[];
	};

	let isOpen = $state(false);
	let menuRef: HTMLElement;
	const { label, items }: MenuProps = $props();

	const toggleOpen = () => {
		isOpen = !isOpen;
	};

	const closeMenu = (ev: MouseEvent) => {
		if (ev.target !== menuRef) {
			isOpen = false;
		}
	};

	onMount(() => {
		document.addEventListener('click', closeMenu);
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', closeMenu);
		}
	});
</script>

<div class="relative inline-block">
	<button onclick={toggleOpen} bind:this={menuRef}>{label}</button>
	{#if isOpen}
		<div
			tabindex="-1"
			class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 z-10"
		>
			{#each items as item}
				<button class="block w-full text-left px-4 py-2 hover:bg-gray-100" onclick={item.callback}>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
