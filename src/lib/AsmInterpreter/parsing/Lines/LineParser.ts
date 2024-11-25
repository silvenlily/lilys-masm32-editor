import { Parse } from '$lib/AsmInterpreter/parsing/Parse';
import type { InstructionLineOptions, LineType, Types, UnparsedLOC } from '$lib/AsmInterpreter/parsing/Types';
import type { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';

export type tagged_unparsed_line = {
	type: 'unparsed'; loc: UnparsedLOC;
}

export type tagged_directive_line = {
	type: 'directive'; instruction: LineParser;
}

export type tagged_executable_line = {
	type: 'directive'; instruction: ExecutableLine;
}

export type ParsingLine = tagged_directive_line | tagged_executable_line | tagged_unparsed_line

export class LineParser {
	type: LineType;
	name: string;
	description?: string;
	tag: RegExp | string;
	supported: boolean;
	unsupported_err_message: string;
	legal_in_mode: Types[];

	apply_parse(line: UnparsedLOC, parse: Parse): tagged_directive_line | tagged_executable_line {
		throw(`Unimplemented parser: ${this.name}`);
	}

	protected constructor(options: InstructionLineOptions, parser_type: LineType) {
		this.type = parser_type;
		this.name = options.name;
		this.description = options.description;
		this.tag = options.tag;
		this.supported = options.supported;
		this.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported instruction';
		this.legal_in_mode = options.legal_in_mode;
	}
}

export type LineKeyMap = { [key in Types]: LineParser[] }


