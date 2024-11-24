import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';
import { Parse } from '$lib/AsmInterpreter/parsing/Parse';
import type { InstructionLineOptions, LineType, Types, UnparsedLOC } from '$lib/AsmInterpreter/parsing/Types';

export class InstructionLine {
	type: LineType;
	name: string;
	description?: string;
	tag: RegExp | string;
	supported: boolean;
	unsupported_err_message: string;
	legal_in_mode: Types[];

	apply_parse(line: UnparsedLOC, parse: Parse): undefined {
	}

	execute(line: UnparsedLOC, parse: Parse, system: vSystem): undefined {
	}

	constructor(options: InstructionLineOptions, parser_type: LineType) {
		this.type = parser_type;
		this.name = options.name;
		this.description = options.description;
		this.tag = options.tag;
		this.supported = options.supported;
		this.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported instruction';
		this.legal_in_mode = options.legal_in_mode;
	}
}

export type LineKeyMap = { [key in Types]: InstructionLine[] }