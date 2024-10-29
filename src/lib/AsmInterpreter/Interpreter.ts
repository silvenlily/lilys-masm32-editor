/**
 * Parses and executes masm32 asm
 */
export class Interpreter {
	registers: {
		EAX: number;
		EBX: number;
		ECX: number;
		EDX: number;
		ESI: number;
		EDI: number;
		ESP: number;
		EBP: number;
	}

	virtual_memory: Map<number,number>

	constructor() {
		this.virtual_memory = new Map();

		this.registers = {
			EAX: 0,
			EBX: 0,
			ECX: 0,
			EDX: 0,
			ESI: 0,
			EDI: 0,
			ESP: 0,
			EBP: 0,
		}

	}

}