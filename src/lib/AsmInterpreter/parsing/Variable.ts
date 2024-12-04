
export interface VariableIdentifier {
	variable_name: string,
	model: string,
}

export class Variable {
	legal_models: string[] = [];
	bytes: number[];
	inc_size: number;

	constructor(bytes: number[], inc_size: number) {
		this.bytes = bytes;
		this.inc_size = inc_size
	}

	to_bytes():number[] {
		return this.bytes;
	}

	add_model_scope(model: string) {
		this.legal_models.push(model);
	}

	is_valid_in_scope(scope: string): boolean {
		return this.legal_models.includes(scope)
	}

}

