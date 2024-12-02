import type { Procedure } from '$lib/AsmInterpreter/procedures/Procedure';
import type { ProcReference } from '$lib/AsmInterpreter/parsing/SegmentType';

/**
 * Represents an executable program
 */
export interface Program {
	static_alloc: DataView;
	main: Procedure;
	procedures: Map<ProcReference, Procedure>;
}