import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory, type InstructionFactoryApplyParseReturnType, type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type {
	PointerDataOperand, ReferenceDataOperand, RegisterDataOperand
} from '$lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class IncBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'increases the value in the operand by one',
			name: 'increment',
			supported: true,
			tag: /^(\s*inc\s*\w*)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {

		let parts = line.text.split(' ');
		let dest_str = parts[1].trim();

		try {
			let inc = new Inc(dest_str, line);
			return { line: { type: 'instruction', runtime: inc, loc: line } };
		} catch {
			return { line: {type: 'invalid', message: 'could not parse increment line' ,loc: line}}
		}
	}

}

export class Inc extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']) as RegisterDataOperand | PointerDataOperand;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`inc ${this.dest.value}`);
		this.dest.add(1, system, this.requested_variable_address_resolutions);
	}
}