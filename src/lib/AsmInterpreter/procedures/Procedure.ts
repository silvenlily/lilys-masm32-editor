import type { RuntimeLine } from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { ProcedureBuilder } from '$lib/AsmInterpreter/procedures/ProcedureBuilder';
import type { ProcReference } from '$lib/AsmInterpreter/parsing/SegmentType';
import { ExecutableNoOpLine } from '$lib/AsmInterpreter/parsing/Lines/Line';

export class Procedure {
	memory_footprint: number;
	lines: RuntimeLine[];
	label_map: Map<string, number>;
	ref: ProcReference;

	constructor(builder: ProcedureBuilder) {
		this.lines = [];
		for (let line_index = 0; line_index < builder.lines.length; line_index++) {
			let line = builder.lines[line_index];
			if (line.type == 'instruction' || line.type == 'directive') {
				this.lines[line_index] = line;
			} else {
				this.lines[line_index] = { type: 'instruction', runtime: new ExecutableNoOpLine(line.loc), loc: line.loc };
			}
		}

		this.label_map = builder.label_map;
		this.memory_footprint = builder.memory_footprint;
		this.ref = builder.get_ref();
	}

	get_executor() {
		return new ProcedureExecutor(this.lines, this.label_map, this.memory_footprint);
	}

}

export class ProcedureExecutor {
	memory_footprint: number;
	lines: RuntimeLine[];
	label_map: Map<string, number>;
	current_line: number;

	constructor(lines: RuntimeLine[], labels: Map<string, number>, memory_footprint: number) {
		this.lines = lines;
		this.current_line = 0;
		this.label_map = labels;
		this.memory_footprint = memory_footprint;
	}

	execute_next_line(sys: vSystem) {

	}

}
