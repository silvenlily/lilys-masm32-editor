import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';
import { languages } from 'monaco-editor';
import register = languages.register;
import type { InstructionLine } from '$lib/AsmInterpreter/parsing/Parser';

export abstract class Instruction {
	abstract id:string;
	abstract execute(sys: vSystem): vSystem
}

export abstract class InstructionFactory {
	abstract getId(): string;
	abstract create(line:InstructionLine): Instruction;
}

export class InstructionRegister {
	private static singleton: InstructionRegister;
	instructions: Map<String, InstructionFactory>;

	private constructor() {
		this.instructions = new Map()
	}

	public static getInstance(): InstructionRegister {
		return InstructionRegister.singleton ?? new InstructionRegister();
	}

	public static registerInstruction(instruction: InstructionFactory):boolean {
		let reg = InstructionRegister.getInstance()

		if(reg.instructions.has(instruction.getId())) {
			return false;
		}

		reg.instructions.set(instruction.getId(), instruction);

		return true

	}

	public static getInstruction(id: string):InstructionFactory|undefined {
		let reg = InstructionRegister.getInstance();
		return reg.instructions.get(id)
	}

}
