import type { Procedure } from '$lib/AsmInterpreter/Procedure';

import {
	type Types,
	SegmentTypes,
	type UnparsedLOC,
	type ParseError,
} from '$lib/AsmInterpreter/parsing/Types';

export class Parse {
	main?: Procedure;
	procedures: Map<String, Procedure>;
	variables: Map<String, number[]>;
	errors: ParseError[];

	segment: Types;
	parse_lines: UnparsedLOC[];

	constructor(lines: string[]) {
		this.procedures = new Map();
		this.variables = new Map();
		this.segment = SegmentTypes[0];
		this.parse_lines = [];
		this.errors = [];

		for (let i = 0; i < lines.length; i++) {
			this.parse_lines.push({ text: lines[i], line_number: i + 1 });
		}

	}

}