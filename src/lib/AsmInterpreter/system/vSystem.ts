import type { Register } from '$lib/AsmInterpreter/system/Register';
import { SystemMemory } from '$lib/AsmInterpreter/system/SystemMemory';
import { generate_registers } from '$lib/AsmInterpreter/system/RegisterBuilders';
import {
	instruction_reference_to_key,
	type InstructionLnReference,
	type ProcReference
} from '$lib/AsmInterpreter/parsing/SegmentType';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

/**
 * represents the virtual machine the program runs on
 */
export class vSystem {
	public registers: Map<string, Register>;
	public memory: SystemMemory;
	public current_proc: ProcReference;
	public memory_instruction_mapping: InstructionLnReference[];
	public instruction_memory_mapping: Map<string, number>;
	public instruction_pointer: number;
	public status_equal_to: boolean = false;
	public status_greater_then: boolean = false;
	public status_less_then: boolean = false;
	public status_zero_res: boolean = false;

	public console_output: string[]

	constructor(static_alloc: DataView, static_offset: number, main: ProcReference, instruction_mapping: InstructionLnReference[]) {
		this.memory = new SystemMemory(static_alloc, static_offset);
		this.registers = generate_registers();
		this.current_proc = main;
		this.memory_instruction_mapping = instruction_mapping;
		this.instruction_memory_mapping = new Map();
		this.console_output = []

		// construct instruction=>memory  map
		for (let i = 0; i < instruction_mapping.length; i++) {
			let ref = instruction_mapping[i];
			let key = instruction_reference_to_key(ref);
			this.instruction_memory_mapping.set(key, i);
		}

		// locate entrypoint
		let entrypoint_ref: InstructionLnReference = { proc: main, ln: 0 };
		let entrypoint = this.instruction_memory_mapping.get(instruction_reference_to_key(entrypoint_ref));
		if (entrypoint == undefined) {
			throw `cannot find entrypoint`;
		}
		this.instruction_pointer = entrypoint;

		this.registers.get('esp')!.set_int(this.memory.stack_top);

	}

	stack_push(value: number) {
		let ESP = this.registers.get('esp')!;
		ESP.add(-4, 'int');
		this.memory.sys_set_bytes(ESP.get_int(), value, 4);
	}

	stack_pop(trace: RuntimeTrace): number {
		let ESP = this.registers.get('esp')!;
		let value = this.memory.get_int(trace, ESP.get_int());
		ESP.add(4, 'int');
		return value;
	}

	get_stack(max_values: number): number[] {
		let top = this.memory.stack_top;
		let bottom = this.registers.get('esp')!.get_int();
		let range = Math.round((top - bottom) / 4);

		console.debug(`stack top: 0x${top.toString(16).padStart(8, '0')}, bottom: 0x${bottom.toString(16).padStart(8, '0')}, size: ${range}`);

		if (range > max_values) {
			range = max_values;
		}
		let stack_values = [];
		for (let offset = 0; offset < range; offset++) {
			let addr = bottom + (offset * 4);
			let val = this.memory.sys_get_bytes(addr, 4);
			console.debug(`getting stack value from 0x${addr.toString(16).padStart(8, '0')} (0x${bottom.toString(16).padStart(8, '0')} + (${offset * 4})): ${val}`);
			stack_values.push(val);
		}

		return stack_values;
	}

}
