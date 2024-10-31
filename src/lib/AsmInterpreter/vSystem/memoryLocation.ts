import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';

export type MemoryTag = 'Register' | 'VirtualMemory'

export type RegisterName = 'EAX' | 'EBX' | 'ECX' | 'EDX' | 'ESI' | 'EDI' | 'ESP' | 'EBP'
export const RegisterNames: RegisterName[] = ['EAX', 'EBX', 'ECX', 'EDX', 'ESI', 'EDI', 'ESP', 'EBP'];

export abstract class MemoryLocation {
	abstract tag: MemoryTag;

	abstract get_value(system: vSystem): number

	abstract set_value(new_value: number, system: vSystem): void

	addEq(num2: MemoryLocation | number, sys: vSystem) {
		if (typeof num2 == 'number') {
			this.set_value(this.get_value(sys) + num2, sys);
		} else {
			this.set_value(this.get_value(sys) + num2.get_value(sys), sys);

		}
	}

	subEq(num2: MemoryLocation | number, sys: vSystem) {
		if (typeof num2 == 'number') {
			this.set_value(this.get_value(sys) + num2, sys);
		} else {
			this.set_value(this.get_value(sys) + num2.get_value(sys), sys);

		}
	}

	Eq(new_val: MemoryLocation | number, sys: vSystem) {
		if (typeof new_val == 'number') {
			this.set_value(new_val, sys);
		} else {
			this.set_value(new_val.get_value(sys), sys);
		}
	}
}

export class RegisterLocation extends MemoryLocation {
	tag: MemoryTag = 'Register';
	register: RegisterName;

	get_value(system: vSystem): number {
		return system.registers[this.register];
	}

	set_value(new_value: number, system: vSystem): void {
		system.registers[this.register] = new_value;
	}

	constructor(register: RegisterName) {
		super();
		this.register = register;
	}

}


