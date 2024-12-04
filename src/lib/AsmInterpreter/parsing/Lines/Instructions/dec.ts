import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { PointerDataOperand, RegisterDataOperand } from '$lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class DecBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'decreases the value in the operand by one',
			name: 'decrement',
			supported: true,
			tag: /^(\s*dec\s*\w*)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {
		try {
			let parts = line.text.split(' ');
			let dest_str = parts[1].trim();

			console.log(`applying dec with dest ${dest_str}`);

			let runtime = new Dec(dest_str, line);
			return {
				line: { type: 'instruction', runtime: runtime, loc: line }
			};
		} catch {
			return {
				line: { type: 'invalid', message: 'cannot parse decrement instruction', loc: line }
			};
		}


	}

}

export class Dec extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']) as RegisterDataOperand | PointerDataOperand;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`dec ${this.dest.value}`);
		this.dest.add(trace,-1, system, this.requested_variable_address_resolutions);
	}
}