import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import { Print } from '$lib/AsmInterpreter/NativeProcs/Print';

export abstract class NativeProc {
	abstract execute(trace: RuntimeTrace, system: vSystem): void;
}

export const NativeProcs: Map<string, NativeProc> = new Map([['print@4', new Print()]]);
