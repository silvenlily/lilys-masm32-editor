import type { Procedure } from '$lib/AsmInterpreter/Procedure';

import {
	SegmentTypes,
	type Types,
	type UnparsedLOC,
	type ParseError,
} from '$lib/AsmInterpreter/parsing/Types';

export class Parse {
	main?: Procedure;
	procedures: Map<String, Procedure>;
	variables: Map<String, number[]>;
	errors: ParseError[];

	segment: Types;

	constructor() {
		this.procedures = new Map();
		this.variables = new Map();
		this.segment = SegmentTypes[0];
		this.errors = [];
	}

}