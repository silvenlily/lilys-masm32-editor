import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';

export interface InstructionLine {
	instruction: string;
	param1?: MemoryLocation | number;
	param2?: MemoryLocation | number;
}

export interface ParseError {
	severity: string;
	message: string;
}



/**
 * parses a set of asm files into programs
 */
export class Parser {

}