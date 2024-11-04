<div class="filewrapper">
	<slot/>
</div>

<style lang="scss">
	@use "sass:color";

	div.filewrapper {
		width: 95%;
		padding: 5px;
		cursor: pointer;
	}

	div.filewrapper:hover{
		background-color: color.adjust($panel-background-color, $lightness: 20%)

  }



</style>

