import type { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import {
	type DataOperand,
	ImmediateDataOperand,
	type LegalOperandTags,
	PointerDataOperand,
	ReferenceDataOperand,
	RegisterDataOperand
} from '$lib/AsmInterpreter/system/DataOperand';
import { REGISTER_ADDRESS_MAP } from '$lib/AsmInterpreter/system/RegisterBuilders';

export class ExecutableLine {
	originating_loc: UnparsedLOC;
	requested_variable_address_resolutions: Map<string, number | null>;

	constructor(originating_line: UnparsedLOC, requested_address_resolutions?: Map<string, number | null>) {
		this.requested_variable_address_resolutions = requested_address_resolutions ?? new Map();
		this.originating_loc = originating_line;
	}

	execute(trace: RuntimeTrace, system: vSystem): undefined {
	}

	get_reqested_address(req:string): number {
		let address = this.requested_variable_address_resolutions.get(req);
		if (typeof address != 'number') {
			throw `Interpreter integrity check failed, unresolved variable address reference ${req} instruction: ${JSON.stringify(this)}`;
		}
		return address
	}

	resolve_operand(operand: string, allowed_tags: LegalOperandTags[]): DataOperand {
		if (allowed_tags.includes('RegisterDataOperand')) {
			let try_register = REGISTER_ADDRESS_MAP.get(operand);
			if (try_register != undefined) {
				return new RegisterDataOperand(try_register)
			}
		}
		if (allowed_tags.includes('ImmediateDataOperand')) {
			let try_immediate = Number.parseInt(operand);
			if (Number.isInteger(try_immediate)) {
				return new ImmediateDataOperand(try_immediate)
			}
		}
		if (allowed_tags.includes('PointerDataOperand')) {
			if (operand.charAt(0) == '[' && operand.charAt(operand.length - 1) == ']') {
				let inner: RegisterDataOperand | ReferenceDataOperand | undefined = undefined;
				try {
					inner = this.resolve_operand(operand.substring(1, operand.length - 2), ['RegisterDataOperand', 'ReferenceDataOperand']) as RegisterDataOperand | ReferenceDataOperand;
				} catch {
				}
				if (inner != undefined) {
					return new PointerDataOperand(inner);
				}

			}
		}
		if (allowed_tags.includes('ReferenceDataOperand')) {
			this.requested_variable_address_resolutions.set(operand, null);
			return new ReferenceDataOperand(operand);
		}
		throw `cannot resolve operand`;
	}
}

export class ExecutableNoOpLine extends ExecutableLine {
	execute(trace: RuntimeTrace, system: vSystem): undefined {
	}
}
