import {
	LineParser,
	type tagged_executable_line,
	type tagged_invalid_line,
	type tagged_linkable_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import type { LineOptions } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';

export type InstructionFactoryApplyParseReturnType = {
	line: tagged_executable_line | tagged_invalid_line | tagged_linkable_line,
	state?: ParseState
}

export interface InstructionLineOptions {
	description: string,
	name: string,
	tag: string | RegExp
	supported?: boolean,
	unsupported_err_message?: string
}

export class InstructionFactory extends LineParser {

	constructor(opts: InstructionLineOptions) {

		let lnOpts: LineOptions = {
			description: opts.description,
			legal_in_mode: ['procedure'],
			name: opts.name,
			supported: opts.supported ?? true,
			tag: opts.tag,
			unsupported_err_message: opts.unsupported_err_message ?? 'unsupported instruction'
		};

		super(lnOpts, 'Instruction');
	}

}