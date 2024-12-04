import type { InstructionFactory } from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import { DecBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/dec';
import { IncBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/inc';
import { PushBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/push';
import { PopBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/pop';

export function get_instructions() {
	let instructions: InstructionFactory[] = [new DecBuilder(), new IncBuilder(), new PushBuilder(), new PopBuilder()];
	console.debug(`store loaded ${instructions.length} instructions`)
	return instructions;
}