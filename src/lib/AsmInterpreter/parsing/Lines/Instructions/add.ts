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

export class addBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'adds parameter 2 to parameter 1', name: 'add', supported: true, tag: /^(\s*add\s*\[?\w+]?,\s*\[?\w+]?)$/
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
				return { line: { type: 'invalid', message: 'could not parse add instruction', loc: line } };
			}
			param_1 = param_1.substring(0, param_1.length - 1);


			let instruction = new add(param_1, param_2, line);
			return { line: { type: 'instruction', runtime: instruction, loc: line } };
		} catch {
			return { line: { type: 'invalid', message: 'cannot parse add instruction', loc: line } };
		}

	}

}

export class add extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;
	src: RegisterDataOperand | PointerDataOperand | ReferenceDataOperand | ImmediateDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, src: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']) as RegisterDataOperand | PointerDataOperand;
		this.src = this.resolve_operand(src, ['RegisterDataOperand', 'PointerDataOperand', 'ReferenceDataOperand', 'ImmediateDataOperand']) as any;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`add ${this.dest.value} ${this.src.value}`);
		this.dest.add(trace,this.src.get(trace,system, this.requested_variable_address_resolutions), system, this.requested_variable_address_resolutions);
	}
}