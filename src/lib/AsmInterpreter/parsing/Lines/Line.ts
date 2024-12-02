import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export abstract class ExecutableLine {
	abstract execute(trace: RuntimeTrace, system: vSystem): undefined
}

export class ExecutableNoOpLine implements ExecutableLine {
	execute(trace: RuntimeTrace, system: vSystem): undefined {}
}
