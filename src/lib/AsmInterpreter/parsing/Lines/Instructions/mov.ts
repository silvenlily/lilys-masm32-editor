import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory, type InstructionFactoryApplyParseReturnType, type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import {
	ImmediateDataOperand, type PointerDataOperand, type ReferenceDataOperand, type RegisterDataOperand
} from '$lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class MovBuilder extends InstructionFactory {

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
		let src_str = parts[2].trim();

		try {
			let mov = new Mov(dest_str, src_str, line);
			return { line: { type: 'instruction', runtime: mov, loc: line } };

		} catch {
			return { line: { type: 'invalid', message: 'could not parse mov instruction', loc: line } };
		}

	}

}

export class Mov extends ExecutableLine {
	dest: RegisterDataOperand | PointerDataOperand;
	src: RegisterDataOperand | PointerDataOperand | ReferenceDataOperand | ImmediateDataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, src: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']) as RegisterDataOperand | PointerDataOperand;
		this.src = this.resolve_operand(src, ['RegisterDataOperand', 'PointerDataOperand', 'ReferenceDataOperand', 'ImmediateDataOperand']) as any;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`inc ${this.dest.value}`);
		let src_val = this.src.get(system, this.requested_variable_address_resolutions);
		this.dest.set(src_val, system, this.requested_variable_address_resolutions);
	}
}