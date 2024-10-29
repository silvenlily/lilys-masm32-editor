<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import * as asm_defs from '$lib/Editor/monarchAsm';
	import exampleAsm from '$lib/Editor/example-asm';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;


	onMount(async () => {
		// Import our 'monaco.ts' file here
		// (onMount() will only be executed in the browser, which is what we want)
		monaco = (await import('./monaco')).default;

		monaco.editor.defineTheme("asm-dark",asm_defs.asm_theme)
		monaco.languages.register(asm_defs.asm_extention)
		monaco.languages.setMonarchTokensProvider("asm",asm_defs.asm_lang_def)
		// Your monaco instance is ready, let's display some code!
		const editor = monaco.editor.create(editorContainer,{
			automaticLayout: true,
			theme: "asm-dark",
			model: null,
			language: "asm"
		});

		const model = monaco.editor.createModel(
			exampleAsm,
			'asm',
			monaco.Uri.file("/vfs/main.asm")
		);
		editor.setModel(model);
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});

</script>


<div class="container" bind:this={editorContainer}></div>


<style>
    div.container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 30vw;
        bottom: 0;
        background: darkslategray;
        border-right-color: #2d2d2d;
        border-right-style: solid;
        border-right-width: 1px;
    }
</style>
