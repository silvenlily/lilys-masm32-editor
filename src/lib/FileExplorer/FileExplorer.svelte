<script>
	import PanelLabel from '$lib/PanelLabel.svelte';
	import FileButton from '$lib/FileExplorer/FileButton.svelte';
	import Folder from '$lib/FileExplorer/Folder.svelte';
</script>


<div class="wrapper">

	<PanelLabel>File Explorer</PanelLabel>
	<div class="files">
		<FileButton>Main.asm</FileButton>
		<FileButton>Factorial.asm</FileButton>
		<FileButton>Console.asm</FileButton>
	</div>
</div>

<style lang="scss">
  div.wrapper {
    display: flex;
    justify-content: center;
    position: absolute;
    background: $panel-background-color;
    overflow: scroll;
    top: 0;
    left: 0;
    bottom: $navbar-height;
    width: calc($editor-left-edge - 1px);
  }

  div.files {
    display: flex;
    flex-direction: column;
    position: absolute;
    background: $panel-background-color;
    overflow: scroll;
    top: calc($navbar-height + 1vh);
    left: 0;
    bottom: 0;
    width: calc($editor-left-edge - 1px);

  }
</style>
