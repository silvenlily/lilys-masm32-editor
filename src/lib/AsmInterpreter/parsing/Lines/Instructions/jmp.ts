import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import { type UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';

import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class jmpBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'increases the value in the operand by one',
			name: 'increment',
			supported: true,
			tag: /^(\s*jmp\s+\w+)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, parse: ParseState): InstructionFactoryApplyParseReturnType {

		try {

			let parts = line.text.split(' ');
			let param_1 = parts[1].trim();

			let instruction = new jmp(param_1, line);
			return { line: { type: 'instruction', runtime: instruction, loc: line } };
		} catch {
			return { line: { type: 'invalid', message: 'cannot parse jmp instruction', loc: line } };
		}

	}

}

export class jmp extends ExecutableLine {
	dest: string;

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = dest;
		this.requested_ln_ref_address_resolutions.set(dest, null);
	}

	execute(_trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`jmp ${this.dest}`);

		system.instruction_pointer = this.get_requested_ln_ref_address(this.dest);

	}
}