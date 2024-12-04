import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import {
	ImmediateDataOperand,
	type PointerDataOperand,
	type ReferenceDataOperand,
	type RegisterDataOperand
} from '$lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class cmpBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'compares parameter 1 to parameter 2',
			name: 'compare',
			supported: true,
			tag: /^(\s*cmp\s*\w+,\s*\w+)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {

		try {

			let parts = line.text.split(' ');
			let param_1 = parts[1].trim();
			let param_2 = parts[2].trim();

			let last_char = param_1.charAt(param_1.length - 1);
			if (last_char != ',') {
				return { line: { type: 'invalid', message: 'could not parse mov instruction', loc: line } };
			}
			param_1 = param_1.substring(0, param_1.length - 1);


			let instruction = new cmp(param_1, param_2, line);
			return { line: { type: 'instruction', runtime: instruction, loc: line } };
		} catch {
			return { line: { type: 'invalid', message: 'cannot parse cmp instruction', loc: line } };
		}

	}

}

export class cmp extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;
	src: RegisterDataOperand | PointerDataOperand | ReferenceDataOperand | ImmediateDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, src: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']) as RegisterDataOperand | PointerDataOperand;
		this.src = this.resolve_operand(src, ['RegisterDataOperand', 'PointerDataOperand', 'ReferenceDataOperand', 'ImmediateDataOperand']) as any;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`cmp ${this.dest.value} ${this.src.value}`);

		let dest = this.dest.get(trace,system, this.requested_variable_address_resolutions);
		let src = this.src.get(trace,system, this.requested_variable_address_resolutions);

		system.status_greater_then = dest > src;
		system.status_less_then = dest < src;
		system.status_equal_to = dest == src;
		system.status_zero_res = dest == src;

	}
}