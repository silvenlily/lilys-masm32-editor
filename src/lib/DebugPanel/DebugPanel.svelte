<script lang="ts">
	import PanelLabel from '$lib/PanelLabel.svelte';
	import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
	import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';


	let register_EAX = $state(0);
	let register_EBX = $state(0);
	let register_ECX = $state(0);
	let register_EDX = $state(0);

	let register_ESI = $state(0);
	let register_EDI = $state(0);
	let register_ESP = $state(0);
	let register_EBP = $state(0);

	let errored = false;

	let start_stop_box_text = $state('start');

	let console_lines: string[] = $state([]);

	let register_IP = $state(0);

	const displayed_stack_size = 20;

	let stack_display = $state((() => {
		let dis: string[] = [];

		for (let i = 0; i < displayed_stack_size; i++) {
			dis.push(`---------- : --------`);
		}

		return dis;
	})());

	let built = $state(0);

	const steps: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1750, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12500, 15000, 17500, 20000, 25000, 30000];
	let step_count = steps.length;

	let step_delay = $state(10);
	let display_step_delay = $state('???');

	async function autostep() {
		console.log('auto triggered step');
		if (autostepping) {
			await step_request();
			step_timer = setTimeout(autostep, steps[step_delay]);
		}
	}

	function step_delay_update() {
		let delay = steps[step_delay];
		if (delay < 1000) {
			display_step_delay = `${delay}ms`;
		} else if (delay < 2000) {
			display_step_delay = `${(delay / 1000).toFixed(1)}s`;
		} else {
			display_step_delay = `${(delay / 1000).toFixed(0)}s`;
		}

		if (autostepping && step_timer != undefined) {
			clearTimeout(step_timer);
			step_timer = setTimeout(autostep, steps[step_delay]);
		}
	}

	let step_timer: number | undefined;
	let autostepping = false;

	function toggle_autostep() {
		if (autostepping) {
			console.log('disabling autostep');
			autostepping = false;
			if (step_timer != undefined) {
				clearTimeout(step_timer);
			}
			step_timer = undefined;
			start_stop_box_text = 'start';
		} else {
			console.log('enabling autostep');
			autostepping = true;
			if (step_timer == undefined) {
				step_timer = setTimeout(autostep, steps[step_delay]);
			}
			start_stop_box_text = 'stop';
		}

	}

	async function build_request() {
		built = 1;
		try {
			let sys = await Interpreter.reset();
			update_display(sys);
			built = 2;
		} catch {
			built = 0;
		}
	}

	async function step_request() {
		if (errored) {
			await build_request();
			return;
		}

		let interpreter = await Interpreter.get_instance();
		try {
			let system = interpreter.step_program();
			update_display(system);
		} catch (err: any) {
			let es = err.toString();
			console_lines.push(es);
			console.debug(es);
			if (autostepping) {
				toggle_autostep();
			}
			errored = true;
		}
	}

	function update_display(system: vSystem) {
		register_EAX = system.registers.get('eax')!.get_int();
		register_EBX = system.registers.get('ebx')!.get_int();
		register_ECX = system.registers.get('ecx')!.get_int();
		register_EDX = system.registers.get('edx')!.get_int();

		register_ESI = system.registers.get('esi')!.get_int();
		register_EDI = system.registers.get('edi')!.get_int();
		register_ESP = system.registers.get('esp')!.get_int();
		register_EBP = system.registers.get('ebp')!.get_int();

		register_IP = system.instruction_pointer;

		let stack_values = system.get_stack(displayed_stack_size);
		let dis = [];
		for (let stack_offset = displayed_stack_size - 1; stack_offset >= 0; stack_offset--) {
			let val: number = stack_values[stack_offset];
			if (val != undefined) {
				let hex = `0x${val.toString(16).padStart(8, '0')}`;
				let dec = `${val.toString().padEnd(8, '-')}`;
				dis.push(`${hex} : ${dec}`);
			} else {
				dis.push(`---------- : --------`);
			}

		}

		stack_display = dis;

		step_delay_update();

	}

</script>

<div class="label-box">
	<PanelLabel>Debug Panel</PanelLabel>
</div>
<div class="debug-box">
	<div class="display-box">
		<span>stack</span>

		{#each stack_display as dis_item}
			<div class="display-row">
				<span>{dis_item}</span>
			</div>
		{/each}
	</div>

	<div class="display-box">
		<span>registers</span>

		<div class="display-row">

			<div class="display-box">
				<span>EAX 0x{register_EAX.toString(16).padStart(8, "0")}</span>
				<span>EBX 0x{register_EBX.toString(16).padStart(8, "0")}</span>
				<span>ECX 0x{register_ECX.toString(16).padStart(8, "0")}</span>
				<span>EDX 0x{register_EDX.toString(16).padStart(8, "0")}</span>
			</div>
			<div class="display-box">
				<span>ESI 0x{register_ESI.toString(16).padStart(8, "0")}</span>
				<span>EDI 0x{register_EDI.toString(16).padStart(8, "0")}</span>
				<span>EBP 0x{register_EBP.toString(16).padStart(8, "0")}</span>
				<span>ESP 0x{register_ESP.toString(16).padStart(8, "0")}</span>
			</div>

		</div>
		<span>IP 0x{register_IP.toString(16).padStart(8, "0")}</span>

	</div>

	<span>controls</span>
	<div class="controls-box">
		{#if built === 2}

			<div class="display-row">
				<label for="step-delay">Step Delay</label>
				<input id="step-delay" name="step delay" oninput={step_delay_update} class="control" type="range" min="0"
							 max={step_count-1} step="1"
							 bind:value={step_delay} />
				<span class="display-current-step-delay">
				{display_step_delay}
				</span>
			</div>
			<div class="display-row">
				<button class="control" onclick={toggle_autostep}>{start_stop_box_text}</button>
				<button class="control" onclick={step_request}>step</button>
				<button class="control" onclick={build_request}>rebuild</button>
			</div>
		{:else if built === 1}
			<div class="display-row">
				<span>building</span>
			</div>
		{:else}
			<div class="display-row">
				<button class="control" onclick={build_request}>build</button>
			</div>
		{/if}
	</div>
</div>

<div class="console-wrapper">
	{#each console_lines as line}
		<span>> {line}</span>
	{/each}
</div>

<style lang="scss">

  .control {
    margin: 5px;
  }

  div.console-wrapper {
    display: flex;
    justify-content: center;
    position: absolute;
    color: #d4d4d4;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;
    left: 0;
    bottom: 0;
    height: calc(20vh - 10px);
    right: calc($editor-right-edge);
  }

  div.label-box {
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

  div.display-row {
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-direction: row;
    color: #d4d4d4;
    overflow-x: hidden;
    overflow-y: auto;
    min-width: fit-content;
  }

  div.display-box {
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    color: #d4d4d4;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    min-width: fit-content;
    margin: 5px 10px;
    //background: deeppink;
  }

  div.controls-box {
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    color: #d4d4d4;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    min-height: 20vh;
    margin: 5px 10px;
    //background: deeppink;
  }

  div.debug-box {
    display: flex;
    justify-content: flex-end;
    align-content: center;
    align-items: center;
    position: absolute;
    color: #d4d4d4;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    top: 0;
    right: 0;
    bottom: 0;
    width: calc($editor-right-edge - 1px);
  }


</style>