<script lang="ts">
	let { name } = $props();
	
	function folderDrag() {
		console.log("dragging")
	}
</script>

<div class="filewrapper" ondragstart={folderDrag}>
	<div class="folder-label">
		- {name}
	</div>
	<div class="folders">
		<slot />
	</div>
</div>

<style lang="scss">
  @use "sass:color";

	div.folder-label {
    width: 97%;
    padding: 5px;
		border-bottom-color: $panel-border-color;
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}

  div.filewrapper {
    width: 95%;
    padding: 5px;
    height: fit-content;
    display: flex;
		flex-direction: column;
    align-content: end;
    justify-content: end;
		align-items: end;
  }

  div.folders {
    width: 95%;
  }

</style>

