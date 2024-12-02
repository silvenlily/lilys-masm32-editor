import type { InstructionFactory } from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import { DecBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/dec';

export function get_instructions() {
	let instructions: InstructionFactory[] = [new DecBuilder()];
	console.debug(`store loaded ${instructions.length} instructions`)
	return instructions;
}