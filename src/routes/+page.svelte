<script lang="ts">
import Editor from '$lib/Editor/Editor.svelte';
</script>

<div class="debug-box">
	nyaa
</div>

	<Editor></Editor>


<style>


		div.debug-box {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 70vw;
        right: 0;
				bottom: 0;
        background: #1e1e1e;
        border-left-color: #2d2d2d;
        border-left-style: solid;
        border-left-width: 1px;
				color: #d4d4d4;
		}

</style>
