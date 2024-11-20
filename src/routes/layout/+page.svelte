<main class="flex flex-col w-screen h-screen overflow-hidden">
	<div class="min-h-[50px] w-full flex flex-row items-center justify-around">
		<p>Control 1</p>
		<p>Control 2</p>
	</div>
	<div class="flex-1 flex flex-col bg-green-200 overflow-hidden lg:flex-row">
		<div class="bg-blue-200 flex-1 flex justify-center items-center min-h-0">
			<div class="border border-black h-full w-full max-h-[500px] max-w-[500px]"></div>
		</div>
		<div class="bg-red-200 flex-1 flex flex-col min-h-0 lg:flex-row">
			<div class="bg-indigo-200 flex-1 flex flex-col min-h-0">
				<h3>Across</h3>
				<ul class="flex-1 overflow-y-auto">
					{#each new Array(50) as _, idx}
						<li>Clue {idx}</li>
					{/each}
				</ul>
			</div>
			<div class="bg-indigo-200 flex-1 flex flex-col min-h-0">
				<h3>Down</h3>
				<ul class="flex-1 overflow-y-auto">
					{#each new Array(50) as _, idx}
						<li>Clue {idx}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</main>