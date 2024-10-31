import { Instruction, InstructionFactory, InstructionRegister } from '$lib/AsmInterpreter/Instruction/Instruction';
import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';
import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';
import type { InstructionLine, ParseError } from '$lib/AsmInterpreter/parsing/Parser';
import { movFactory } from '$lib/AsmInterpreter/Instruction/mov';

export class add implements Instruction {

	id: string = 'add';

	dest: MemoryLocation;
	src: MemoryLocation | number;

	constructor(dest: MemoryLocation, src: MemoryLocation | number) {
		this.dest = dest;
		this.src = src;
	}

	execute(sys: vSystem): vSystem {
		this.dest.addEq(this.src, sys);
		return sys;
	}

}

export class addFactory implements InstructionFactory {
	static singleton = new addFactory();

	create(line: InstructionLine): add {
		let src = line.param1;
		let dest = line.param2;

		if (typeof src === 'undefined' || typeof src === 'number' || typeof dest === 'undefined') {
			throw {
				message: 'Malformed instruction parameters', severity: 'fatal'
			};
		}

		return new add(src, dest);
	}

	getId(): string {
		return 'add';
	}

}

InstructionRegister.registerInstruction(addFactory.singleton);
