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

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {

		let parts = line.text.split(' ');
		let dest_str = parts[1].trim();

		console.log(`applying dec with dest ${dest_str}`);
		let try_register = REGISTER_ADDRESS_MAP.get(dest_str);
		if (try_register != undefined) {
			return {
				line: { type: 'instruction', runtime: new Dec({ type: 'RegisterDataOperand', value: try_register }, line) }
			};
		}

		return {
			line: { type: 'instruction', runtime: new Dec({ type: 'ReferenceDataOperand', value: dest_str }, line) }
		};

	}

}

export class Dec extends ExecutableLine {
	dest: RegisterDataOperand | ReferenceDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: RegisterDataOperand | ReferenceDataOperand, line: UnparsedLOC) {
		super(line);
		this.dest = dest;
		if (this.dest.type == 'ReferenceDataOperand') {
			this.requested_variable_address_resolutions.set(this.dest.value, null);
		}
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		if (this.dest.type == 'ReferenceDataOperand') {
			let address = this.requested_variable_address_resolutions.get(this.dest.value);
			if(typeof address != "number") {
				throw `Interpreter integrity check failed, unresolved variable address reference ${this.dest.value} instruction: ${JSON.stringify(this)}`
			}
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