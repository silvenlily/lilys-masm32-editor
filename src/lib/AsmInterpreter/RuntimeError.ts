import { RuntimeTrace } from '$lib/AsmInterpreter/Trace';

export class UnknownRuntimeException {
	exception: string;
	message?: string;
	file: string;
	line_number: number;

	constructor(exception: string, trace: RuntimeTrace, message?: string) {
		this.exception = exception;
		this.file = trace.file;
		this.line_number = trace.line_number;
		this.message = message;
	}

	toString(): string {
		if (this.message != undefined) {
			return `${this.exception} Exception at '${this.line_number}' in '${this.file}' : ${this.message}`;
		} else {
			return `${this.exception} Exception at '${this.line_number}' in '${this.file}'`;
		}
	}

}

export class IllegalMemoryAllocationException extends UnknownRuntimeException {
	constructor(trace: RuntimeTrace, address: number) {
		super('Illegal Memory Allocation', trace, `address 0x${address.toString(16)} may not be allocated (likely due to being already allocated elsewhere)`);
	}
}

export class IllegalMemoryAccessException extends UnknownRuntimeException {
	constructor(trace: RuntimeTrace, address: number) {
		super('Illegal Memory Access', trace, `address 0x${address.toString(16)} is not allocated`);
	}
}

export class StackOverflowException extends UnknownRuntimeException {
	constructor(trace: RuntimeTrace) {
		super('Stack Overflow', trace);
	}
}

export type RuntimeException = IllegalMemoryAccessException | StackOverflowException;
