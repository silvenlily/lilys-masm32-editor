import type { LineReference, ParseError, ProcReference, SegmentType } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ProcedureBuilder } from '$lib/AsmInterpreter/procedures/ProcedureBuilder';
import { Variable, type VariableIdentifier } from '$lib/AsmInterpreter/parsing/Variable';

export class ParseState {
	file?: string;
	segment: SegmentType;
	variables: Map<VariableIdentifier, Variable>;
	errors: ParseError[];
	buildable: boolean;

	procedures: Map<ProcReference, ProcedureBuilder>;
	line_references: Map<string, LineReference>;
	current_proc?: ProcedureBuilder;
	static_alloc?: DataView;

	constructor(file_path?: string) {
		this.procedures = new Map();
		this.variables = new Map();
		this.segment = 'uninitialized';
		this.errors = [];
		this.buildable = true;
		this.file = file_path;
		this.line_references = new Map();
	}

}