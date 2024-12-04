import type { vSystem } from '${DS}lib/AsmInterpreter/system/vSystem';
import { ExecutableLine } from '${DS}lib/AsmInterpreter/parsing/Lines/Line';
import {
	InstructionFactory,
	type InstructionFactoryApplyParseReturnType,
	type InstructionLineOptions
} from '${DS}lib/AsmInterpreter/parsing/Lines/Instructions/InstructionFactory';
import type { UnparsedLOC } from '${DS}lib/AsmInterpreter/parsing/SegmentType';
import { type ParseState } from '${DS}lib/AsmInterpreter/parsing/ParseState';
import type { DataOperand } from '${DS}lib/AsmInterpreter/system/DataOperand';
import type { RuntimeTrace } from '${DS}lib/AsmInterpreter/Trace';

export class ${NAME}Builder extends InstructionFactory {

	constructor() {
		let opts: InstructionLineOptions = {
			description: '$description',
			name: '$name',
			supported: true,
			tag: /^(\s*${NAME}\s+\w+)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {
        try {
        	let parts = line.text.split(' ');
		    let param_1 = parts[1].trim();
            let instruction = new ${NAME}(param_1, line)
            return { line: { type: "instruction", runtime: instruction, loc: line } }
        } catch {
            return { line: { type: "invalid", message: "cannot parse ${NAME} instruction", loc: line } }
        }

	}

}

export class ${NAME} extends ExecutableLine {
	dest: DataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']);
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`${NAME} ${this.dest.value}`);
		
		// TODO: impliment instruction executor
		
	}
}