<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import * as asm_defs from '$lib/Editor/monarchAsm';
	import exampleAsm from '$lib/Editor/example-asm';
	import PanelLabel from '$lib/PanelLabel.svelte';
	import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
	import Parser from '$lib/AsmInterpreter/parsing/Parser';

	let editor: Monaco.editor.IStandaloneCodeEditor | undefined = undefined;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;

	let models: Map<string, Monaco.editor.ITextModel>;

	onMount(async () => {
		models = new Map();
		monaco = (await import('./monaco')).default;

		monaco.editor.defineTheme('asm-dark', asm_defs.asm_theme);
		monaco.languages.register(asm_defs.asm_extention);
		monaco.languages.setMonarchTokensProvider('asm', asm_defs.asm_lang_def);
		monaco.languages.setLanguageConfiguration('asm', asm_defs.asm_lang_conf);

		// create editor
		const editor = monaco.editor.create(editorContainer, {
			automaticLayout: true,
			theme: 'asm-dark',
			model: null,
			language: 'asm'
		});

		const main = monaco.editor.createModel(
			exampleAsm,
			'asm',
			monaco.Uri.file('/vfs/main.asm')
		);
		models.set(main.uri.toString(), main);

		// create the interpreter singleton
		new Interpreter(monaco, models, editor);

		main.onDidChangeContent(async (_e) => {
			try {
				await Parser.get_parser().validate(models);
			} catch (e: any) {
				console.debug(`caught validate err ${e.toString()}`);
			}
		});
		editor.setModel(main);

		// create parser singleton and run validate on default main file
		try {
			await Parser.get_parser().validate(models);
		} catch (e: any) {
			console.debug(`caught validate err ${e.toString()}`);
		}
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());

		// tsc has no idea how to handle the onMount and onDestroy callbacks
		// for obvious reasons onDestroy cant happen before onMount but the tsc doesn't know that
		// so we have to do this silliness to make the tsc happy
		let e: any = editor as any;
		if (e != undefined) {
			e.dispose();
		}
	});

</script>

<div class="wrapper">
	<PanelLabel>Editor</PanelLabel>
	<div class="container" bind:this={editorContainer}></div>
</div>

<style lang="scss">
  div.wrapper {
    position: absolute;
    left: $editor-left-edge;
    right: $editor-right-edge;
    bottom: 0;
    top: 0;
    background: $panel-background-color;
    border-right-color: $panel-border-color;
    border-right-style: solid;
    border-right-width: 1px;
    border-left-color: $panel-border-color;
    border-left-style: solid;
    border-left-width: 1px;
  }

  div.container {
    margin-top: 2px;
    width: 100%;
    height: calc(100vh - $navbar-height);
  }
</style>
