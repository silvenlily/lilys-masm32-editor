import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory, type InstructionFactoryApplyParseReturnType, type InstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import { type NativeProc, NativeProcs } from '$lib/AsmInterpreter/NativeProcs/NativeProc';

export class callBuilder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: 'increases the value in the operand by one',
			name: 'increment',
			supported: true,
			tag: /^(\s*call\s+.+)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, parse: ParseState): InstructionFactoryApplyParseReturnType {

		try {

			let parts = line.text.split(' ');
			let param_1 = parts[1].trim();

			if(parse.enabled_native_procs.includes(param_1)) {
				let native_proc = NativeProcs.get(param_1)
				if(native_proc == undefined) {
					return { line: { type: 'invalid', message: 'unknown external procedure', loc: line } };
				}

				let instruction = new callNative(native_proc, line);
				return { line: { type: 'instruction', runtime: instruction, loc: line } };
			} else {
				let instruction = new call(param_1, line);
				return { line: { type: 'instruction', runtime: instruction, loc: line } };
			}

		} catch {
			return { line: { type: 'invalid', message: 'cannot parse call instruction', loc: line } };
		}

	}

}

export class call extends ExecutableLine {
	dest: string;

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = dest;
		this.requested_proc_address_resolutions.set(dest, null);
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`call ${this.dest}`);

		let addr = this.get_requested_proc_address(this.dest);
		system.stack_push(system.instruction_pointer);
		system.instruction_pointer = addr;

	}
}

export class callNative extends ExecutableLine {
	native: NativeProc;

	constructor(native: NativeProc, line: UnparsedLOC) {
		super(line);
		this.native = native;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		this.native.execute(trace, system);
	}
}
