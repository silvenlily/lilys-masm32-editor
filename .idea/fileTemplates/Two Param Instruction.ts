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
			tag: /^(\s*${NAME}\s*\w+,\s*\w+)$/
		};
		super(opts);
	}

	apply_parse(line: UnparsedLOC, _parse: ParseState): InstructionFactoryApplyParseReturnType {
        try {
            let parts = line.text.split(' ');
		    let param_1 = parts[1].trim();
		    let param_2 = parts[2].trim();
    
		    let last_char = param_1.charAt(param_1.length - 1);
		    if (last_char != ',') {
		    	return { line: { type: 'invalid', message: 'could not parse ${NAME} instruction', loc: line } };
		    }
		    param_1 = param_1.substring(0, param_1.length - 1);

            let instruction = new ${NAME}(param_1, param_2, line)
            return { line: { type: "instruction", runtime: instruction, loc: line } }
        } catch {
            return { line: { type: "invalid", message: "cannot parse ${NAME} instruction", loc: line } }
        }

	}

}

export class ${NAME} extends ExecutableLine {
	dest: DataOperand;
	src: DataOperand;
	requested_variable_address_resolutions: Map<string, number | null> = new Map();

	constructor(dest: string, src: string, line: UnparsedLOC) {
		super(line);
		this.dest = this.resolve_operand(dest, ['RegisterDataOperand', 'PointerDataOperand']);
		this.src = this.resolve_operand(src, ['RegisterDataOperand', 'PointerDataOperand', 'ReferenceDataOperand', 'ImmediateDataOperand']);
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
		console.debug(`${NAME} ${this.dest.value} ${this.src.value}`);
		
		// TODO: impliment instruction executor
		
	}
}