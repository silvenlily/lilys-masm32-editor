export class RuntimeTrace {
	file: string = "unknown";
	method: string = "unknown";
	line_number: number = -1

	inc_ln(): boolean {
		if(this.line_number != -1) {
			this.line_number += 1;
			return true
		}
		return false;
	}

}