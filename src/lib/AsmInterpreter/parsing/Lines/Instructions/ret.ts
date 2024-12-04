import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class retBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'increases the value in the operand by one', name: 'increment', supported: true, tag: /^(\s*ret\s*)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {

		try {
			let instruction = new ret(line);
			return { line: { type: 'instruction', runtime: instruction, loc: line } };
		} catch {
			return { line: { type: 'invalid', message: 'cannot parse ret instruction', loc: line } };
		}

	}

}

export class ret extends ExecutableLine {
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(line: UnparsedLOC) {
		super(line);
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`ret`);

		let addr = system.stack_pop(trace);
		system.instruction_pointer = addr;
	}
}