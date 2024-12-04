
export interface VariableIdentifier {
	variable_name: string,
	model: string,
}

export class Variable {
	legal_models: string[] = [];

	to_bytes():number[] {
		throw `TODO: implement variables`
	}

	add_model_scope(model: string) {
		this.legal_models.push(model);
	}

	is_valid_in_scope(scope: string): boolean {
		return this.legal_models.includes(scope)
	}

}

