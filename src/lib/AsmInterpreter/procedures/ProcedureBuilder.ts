import type {
	ParsingLine,
	tagged_directive_line,
	tagged_executable_line, tagged_invalid_line, tagged_linkable_line, tagged_unparsed_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import type { ProcReference } from '$lib/AsmInterpreter/parsing/SegmentType';

export class ProcedureBuilder {
	lines:ParsingLine[] = [];
	memory_footprint: number = 0;
	proc_label;
	model;
	scope?: 'public' | 'private';

	constructor(label: string, model: string) {
		this.proc_label = label;
		this.model = model;
	}

	add_ln(ln: ParsingLine) {
		this.lines.push(ln);
	}

	get_ref(): ProcReference {
		return {
			model: this.model, name: this.proc_label
		};
	}

}