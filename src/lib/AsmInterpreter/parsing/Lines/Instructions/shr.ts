import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { DataOperand } from '$lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class shrBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'bitwise right shift',
			name: 'shr',
			supported: true,
			tag: /^(\s*shr\s*\w+,\s*\w+)$/
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
				return { line: { type: 'invalid', message: 'could not parse shr instruction', loc: line } };
			}
			param_1 = param_1.substring(0, param_1.length - 1);

			let instruction = new shr(param_1, param_2, line);

			return { line: { type: 'instruction', runtime: instruction, loc: line } };
		} catch {
			return { line: { type: 'invalid', message: 'cannot parse shr instruction', loc: line } };
		}

	}

}

export class shr extends ExecutableLine {
	param1: DataOperand;
	param2: DataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(param1: string, param2: string, line: UnparsedLOC) {
		super(line);
		this.param1 = this.resolve_operand(param1, ['RegisterDataOperand', 'PointerDataOperand']);
		this.param2 = this.resolve_operand(param2, ['RegisterDataOperand', 'ImmediateDataOperand']);
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`shr ${this.param1.value} ${this.param2.value}`);

		let shift_by = this.param2.get(trace,system,this.requested_variable_address_resolutions)
		if (shift_by >= 32) {
			shift_by = shift_by % 32
		}

		let value = Math.round(this.param1.get(trace,system,this.requested_variable_address_resolutions))
		let divisor = Math.round(Math.pow(2,shift_by));

		let result = value / divisor

		let remainder = value % divisor;
		if (Math.abs(remainder) < 0.000001) {
			// in this case we assume that the imprecision is due to floating point and round instead of floor
			result = Math.round(result)
		} else {
			// bits that overflow to the right get dropped so we floor here
			result = Math.floor(result)

		}

		this.param1.set(trace,result,system,this.requested_variable_address_resolutions)
	}
}