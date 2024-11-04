<div class="panel-label-wrapper">
	<span class="panel-label">
		<slot />
	</span>
</div>

<style lang="scss">
  span.panel-label {
		color: $panel-text-color
  }
	div.panel-label-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: $navbar-height;
		padding-bottom: 3px;
		padding-top: 3px;
    border-bottom-color: $panel-border-color;
    border-bottom-style: solid;
    border-bottom-width: 1px;
  }
</style>