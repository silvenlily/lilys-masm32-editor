import type { RuntimeLine } from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import type { ProcReference } from '$lib/AsmInterpreter/parsing/SegmentType';

export class ProcedureBuilder {
	lines: RuntimeLine[] = [];
	label_map: Map<string, number> = new Map();
	memory_footprint: number = 0;
	proc_label;
	model;
	scope?: 'public' | 'private';

	constructor(label: string, model: string) {
		this.proc_label = label;
		this.model = model;
	}

	add_ln(ln: RuntimeLine) {
		this.lines.push(ln);
	}

	get_ref(): ProcReference {
		return {
			model: this.model, name: this.proc_label
		};
	}

}