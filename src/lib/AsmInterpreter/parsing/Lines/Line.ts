import { Parse } from '$lib/AsmInterpreter/parsing/Parse';
import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';

export abstract class ExecutableLine {
	abstract execute(parse: Parse, system: vSystem): undefined
}