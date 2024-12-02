import type { Register } from '$lib/AsmInterpreter/system/Register';
import { SystemMemory } from '$lib/AsmInterpreter/system/SystemMemory';
import { generate_registers } from '$lib/AsmInterpreter/system/RegisterBuilders';

/**
 * represents the virtual machine the program runs on
 */
export class vSystem {
	public registers: Map<string, Register>;
	public memory: SystemMemory;

	constructor(static_alloc: DataView) {
		this.memory = new SystemMemory(static_alloc);
		this.registers = generate_registers();
	}

}
