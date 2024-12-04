import type { RegisterAddress } from '$lib/AsmInterpreter/system/Register';
import type { MemoryAddress } from '$lib/AsmInterpreter/system/MemoryAddress';
import { type vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export type LegalOperandTags =
	'PointerDataOperand'
	| 'ReferenceDataOperand'
	| 'RegisterDataOperand'
	| 'ImmediateDataOperand'

abstract class BaseDataOperand {
	abstract type: LegalOperandTags;
	abstract value: number | string | RegisterAddress | MemoryAddress | ReferenceDataOperand | RegisterDataOperand;

	add(trace: RuntimeTrace, val: number, system: vSystem, reference_map: Map<string, number | null>): undefined {
		let current = this.get(trace, system, reference_map);
		this.set(trace, current + val, system, reference_map);
	}

	abstract set(trace: RuntimeTrace, val: number, system: vSystem, reference_map: Map<string, number | null>): undefined;

	abstract get(trace: RuntimeTrace, system: vSystem, reference_map: Map<string, number | null>): number;

}

export class ReferenceDataOperand extends BaseDataOperand {
	type = 'ReferenceDataOperand' as const;
	value: string;

	constructor(value: string) {
		super();
		this.value = value;
	}

	get(trace: RuntimeTrace, _system: vSystem, reference_map: Map<string, number | null>): number {
		return this.get_reqested_address(this.value, reference_map);
	}

	set(trace: RuntimeTrace, _val: number, _system: vSystem, _reference_map: Map<string, number | null>): undefined {
		throw `illegal operation, cannot change a reference, did you mean to use this as a pointer?`;
	}

	get_reqested_address(req: string, ref_map: Map<string, number | null>): number {
		let address = ref_map.get(req);
		if (typeof address != 'number') {
			throw `Interpreter integrity check failed, unresolved variable address reference ${req} instruction: ${JSON.stringify(this)}`;
		}
		return address;
	}

}

export class PointerDataOperand extends BaseDataOperand {
	type = 'PointerDataOperand' as const;
	value: ReferenceDataOperand | RegisterDataOperand;

	constructor(value: ReferenceDataOperand | RegisterDataOperand) {
		super();
		this.value = value;
	}

	get(trace: RuntimeTrace, system: vSystem, reference_map: Map<string, number | null>): number {
		let addr = this.value.get(trace, system, reference_map);
		return system.memory.get_int(trace, addr);
	}

	set(trace: RuntimeTrace, val: number, system: vSystem, reference_map: Map<string, number | null>): undefined {
		let addr = this.value.get(trace, system, reference_map);
		system.memory.set_int(trace, addr, val);
	}

}

export class RegisterDataOperand extends BaseDataOperand {
	type = 'RegisterDataOperand' as const;
	value: RegisterAddress;

	constructor(value: RegisterAddress) {
		super();
		this.value = value;
	}

	get(trace: RuntimeTrace, system: vSystem, _reference_map: Map<string, number | null>): number {
		let register = system.registers.get(this.value.full_tag);
		if (register == undefined) {
			throw 'unknown register access';
		}
		return register.get(this.value.tag_category);
	}

	set(trace: RuntimeTrace, val: number, system: vSystem, _reference_map: Map<string, number | null>): undefined {
		let register = system.registers.get(this.value.full_tag);
		if (register == undefined) {
			throw 'unknown register access';
		}
		register.set(val, this.value.tag_category);
	}


}

export class ImmediateDataOperand extends BaseDataOperand {
	type = 'ImmediateDataOperand' as const;
	value: number;

	constructor(value: number) {
		super();
		this.value = value;
	}

	get(trace: RuntimeTrace, _system: vSystem, _reference_map: Map<string, number | null>): number {
		return this.value;
	}

	set(trace: RuntimeTrace, _val: number, _system: vSystem, _reference_map: Map<string, number | null>): undefined {
		throw `illegal operation, cannot change an immediate value`;
	}

}

export type DataOperand = RegisterDataOperand | ImmediateDataOperand | PointerDataOperand | ReferenceDataOperand;




