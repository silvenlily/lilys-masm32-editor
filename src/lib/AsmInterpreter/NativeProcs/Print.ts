import { NativeProc } from '$lib/AsmInterpreter/NativeProcs/NativeProc';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';

export class Print implements NativeProc {
	execute(trace: RuntimeTrace, system: vSystem) {
		let ptr = system.stack_pop(trace)
		let msg = ""
		while (true) {
			let byte = system.memory.get_byte(trace,ptr)
			if (byte == 0) {
				system.console_output.push(msg)
				break;
			}
			if (byte == "\n".charCodeAt(0)) {
				system.console_output.push(msg)
				msg = ""
			}
			msg += String.fromCodePoint(byte)
		}
	}
}