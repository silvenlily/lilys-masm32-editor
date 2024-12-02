import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory, type InstructionFactoryApplyParseReturnType, type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { PointerDataOperand, RegisterDataOperand } from '$lib/AsmInterpreter/system/DataOperand';
import { REGISTER_ADDRESS_MAP } from '$lib/AsmInterpreter/system/RegisterBuilders';
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

	apply_parse(line: UnparsedLOC, parse: ParseState): InstructionFactoryApplyParseReturnType {

		let parts = line.text.split(' ');
		let dest_str = parts[1].trim();

		console.log(`applying dec with dest ${dest_str}`);
		let try_register = REGISTER_ADDRESS_MAP.get(dest_str);
		if (try_register != undefined) {
			return {
				line: { type: 'instruction', runtime: new Dec({ type: 'RegisterDataOperand', value: try_register }) }
			};
		}

		let try_vars = parse.variables.get(dest_str);
		if (try_vars != undefined) {
			return {
				line: { type: 'invalid', message: 'variable decrement not yet supported', loc: line }
			};

			//return {
			//	line: { type: 'instruction', instruction: new Dec({ type: 'PointerDataOperand', address: {} }) }
			//};
		}

		return { line: { type: 'invalid', message: `invalid operand '${dest_str}'`, loc: line } };
	}
}

export class Dec extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;

	constructor(dest: RegisterDataOperand | PointerDataOperand) {
		super();
		this.dest = dest;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		if (this.dest.type == 'PointerDataOperand') {
			let address = this.dest.value
			let value = system.memory.get_int(trace, address);
			value += 1;
			system.memory.set_int(trace, address, value);
		} else if (this.dest.type == 'RegisterDataOperand') {
			let register = system.registers.get(this.dest.value.full_tag)!;
			register.add(1, this.dest.value.tag_category);
		} else {
			throw 'illegal operand';
		}
	}
}