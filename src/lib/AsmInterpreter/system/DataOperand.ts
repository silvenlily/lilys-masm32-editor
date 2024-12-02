import type { RegisterAddress } from '$lib/AsmInterpreter/system/Register';
import type { MemoryAddress } from '$lib/AsmInterpreter/system/MemoryAddress';


interface BaseDataOperand {
	type: string;
	value: RegisterAddress | number | MemoryAddress;
}

export interface PointerDataOperand extends BaseDataOperand {
	type: "PointerDataOperand";
	value: MemoryAddress;
}

export interface RegisterDataOperand extends BaseDataOperand {
	type: "RegisterDataOperand";
	value: RegisterAddress;
}

export interface ImmediateDataOperand extends BaseDataOperand {
	type: "ImmediateDataOperand";
	value: number;
}

export type DataOperand = RegisterDataOperand  | ImmediateDataOperand | PointerDataOperand;




