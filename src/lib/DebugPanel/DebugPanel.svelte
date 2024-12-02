<script>
	import PanelLabel from '$lib/PanelLabel.svelte';
</script>

<div class="debug-box">
	<PanelLabel>Debug Panel</PanelLabel>
</div>

<style lang="scss">

  div.debug-box {
    display: flex;
    justify-content: center;
    position: absolute;
    background: $panel-background-color;
    color: #d4d4d4;
    overflow-x: hidden;
    overflow-y: auto;
    top: 0;
    right: 0;
		bottom: 0;
    width: calc($editor-right-edge - 1px);
  }


</style>