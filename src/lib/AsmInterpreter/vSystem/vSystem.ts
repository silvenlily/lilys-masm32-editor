import type { MMU } from '$lib/AsmInterpreter/vSystem/mmu';
import type { RegisterName } from '$lib/AsmInterpreter/vSystem/memoryLocation';

/**
 * represents the virtual machine the program runs on
 */

export interface vSystem {
	registers: { [key in RegisterName]: number }

	stack: number[];
	stack_capacity: number;

	virtual_memory: MMU;
}

