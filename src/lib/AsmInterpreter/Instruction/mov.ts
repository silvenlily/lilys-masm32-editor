import { Instruction, InstructionFactory, InstructionRegister } from '$lib/AsmInterpreter/Instruction/Instruction';
import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';
import type { InstructionLine } from '$lib/AsmInterpreter/parsing/Parser';
import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';

export class mov implements Instruction {
	id: string = 'mov';

	dest: MemoryLocation;
	src: MemoryLocation | number;

	constructor(dest: MemoryLocation, src: MemoryLocation | number) {
		this.dest = dest;
		this.src = src;
	}

	execute(sys: vSystem): vSystem {


		return sys;
	}
}

export class movFactory extends InstructionFactory {

	static singleton: movFactory = new movFactory();

	create(line: InstructionLine): mov {
		let src = line.param1;
		let dest = line.param2;

		if (typeof src === 'undefined' || typeof src === 'number' || typeof dest === 'undefined') {
			throw {
				message: 'Malformed instruction parameters', severity: 'fatal'
			};
		}

		return new mov(src, dest);

	}

	getId(): string {
		return 'mov';
	}

}

InstructionRegister.registerInstruction(movFactory.singleton);
