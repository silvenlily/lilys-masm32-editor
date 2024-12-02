import { overflow_add_byte, overflow_add_int, overflow_add_short } from '$lib/AsmInterpreter/system/math';

export type RegisterAddressingType = 'full' | 'partial' | 'unsegmented'
export type SegmentTag = 'int' | 'short' | 'byte_lower' | 'byte_upper';

export type RegisterAddress = {
	full_tag: string, requested_tag: string, tag_category: SegmentTag,
}

interface BaseRegisterAddressingOptions {
	segmentation_type: RegisterAddressingType;
	register_tag: string,
}

export interface RegisterFullySegmentedAddressingOptions extends BaseRegisterAddressingOptions {
	segmentation_type: 'full'
	half_tag: string,
	half_lower_tag: string,
	half_upper_tag: string,
}

export interface RegisterPartiallySegmentedAddressingOptions extends BaseRegisterAddressingOptions {
	segmentation_type: 'partial'
	half_tag: string,
}

export interface RegisterUnsegmentedAddressingOptions extends BaseRegisterAddressingOptions {
	segmentation_type: 'unsegmented';
}

export type RegisterSegmentationOptions =
	RegisterFullySegmentedAddressingOptions
	| RegisterPartiallySegmentedAddressingOptions
	| RegisterUnsegmentedAddressingOptions

export interface RegisterOptions {
	addressing_options: RegisterSegmentationOptions;
}

export class Register {
	segmentation_opts: RegisterSegmentationOptions;

	underlying: DataView;

	constructor(options: RegisterOptions) {
		this.segmentation_opts = options.addressing_options;
		this.underlying = new DataView(new ArrayBuffer(32, { maxByteLength: 32 }));
	}

	get_int(): number {
		return this.underlying.getUint32(0);
	}

	get_short(): number {
		return this.underlying.getUint16(16);
	}

	get_byte_upper(): number {
		return this.underlying.getUint8(16);
	}

	get_byte_lower(): number {
		return this.underlying.getUint8(24);
	}

	set_int(value: number) {
		this.underlying.setUint32(0, value);
	}

	set_short(value: number) {
		this.underlying.setUint16(16, value);
	}

	set_byte_upper(value: number) {
		this.underlying.setUint8(16, value);
	}

	set_byte_lower(value: number) {
		this.underlying.setUint8(24, value);
	}

	add(operand: number, segment: SegmentTag): boolean {
		switch (segment) {
			case 'int': {
				let current = this.get_int();
				let result = overflow_add_int(current, operand);
				this.set_int(result[0]);
				return result[1];
			}
			case 'short': {
				let current = this.get_short();
				let result = overflow_add_short(current, operand);
				this.set_short(result[0]);
				return result[1];
			}
			case 'byte_upper': {
				let current = this.get_byte_upper();
				let result = overflow_add_byte(current, operand);
				this.set_byte_upper(result[0]);
				return result[1];
			}
			case 'byte_lower': {
				let current = this.get_byte_lower();
				let result = overflow_add_byte(current, operand);
				this.set_byte_lower(result[0]);
				return result[1];
			}
			default:
				throw 'unknown register segment tag';
		}


	}


}


