import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';

export class ExecutableLine {
	originating_loc: UnparsedLOC;
	requested_variable_address_resolutions?: Map<string, number | null>;

	constructor(originating_line: UnparsedLOC) {
		this.originating_loc = originating_line;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
	}
}

export class ExecutableNoOpLine extends ExecutableLine {
	execute(trace: RuntimeTrace, system: vSystem): undefined {
	}
}
