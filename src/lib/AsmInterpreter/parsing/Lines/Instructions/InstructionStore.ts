import type { InstructionFactory } from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import { DecBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/dec';
import { IncBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/inc';
import { PushBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/push';
import { PopBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/pop';
import { MovBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/mov';
import { addBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/add';
import { subBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/sub';
import { jmpBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jmp';
import { callBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/call';
import { retBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/ret';
import { cmpBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/cmp';
import { jeBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/je';
import { jgBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jg';
import { jgeBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jge';
import { jlBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jl';
import { jleBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jle';
import { jneBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jne';
import { jzBuilder } from '$lib/AsmInterpreter/parsing/Lines/Instructions/jz';

export function get_instructions() {
	let instructions: InstructionFactory[] = [
		new DecBuilder(),
		new IncBuilder(),
		new PushBuilder(),
		new PopBuilder(),
		new MovBuilder(),
		new addBuilder(),
		new subBuilder(),
		new callBuilder(),
		new retBuilder(),
		new cmpBuilder(),
		new jmpBuilder(),
		new jeBuilder(),
		new jgBuilder(),
		new jgeBuilder(),
		new jlBuilder(),
		new jleBuilder(),
		new jneBuilder(),
		new jzBuilder(),
	];
	console.debug(`store loaded ${instructions.length} instructions`);
	return instructions;
}