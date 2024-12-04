import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory, type InstructionFactoryApplyParseReturnType, type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { ReferenceDataOperand, RegisterDataOperand } from '$lib/AsmInterpreter/system/DataOperand';
import { REGISTER_ADDRESS_MAP } from '$lib/AsmInterpreter/system/RegisterBuilders';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class PopBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'increases the value in the operand by one',
			name: 'increment',
			supported: true,
			tag: /^(\s*pop\s*\w*)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {

		let parts = line.text.split(' ');
		let dest_str = parts[1].trim();

		console.debug(`applying push with dest ${dest_str}`);



		return {
			line: { type: 'invalid', message: 'push is only valid for 32 bit values', loc: line }
		};

	}

}

export class Pop extends ExecutableLine {
	dest: RegisterDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand']) as any;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		let val = system.stack_pop(trace);
		this.dest.set(val, system, this.requested_variable_address_resolutions);
	}
}