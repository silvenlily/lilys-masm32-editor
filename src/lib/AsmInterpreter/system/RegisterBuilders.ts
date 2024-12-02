import { Register, type RegisterAddress, type RegisterOptions } from '$lib/AsmInterpreter/system/Register';

export const registers_options: RegisterOptions[] = [{
	addressing_options: {
		register_tag: 'eax', segmentation_type: 'full', half_tag: 'AX', half_lower_tag: 'AH', half_upper_tag: 'AL'
	}
}, {
	addressing_options: {
		register_tag: 'ebx', segmentation_type: 'full', half_tag: 'BX', half_lower_tag: 'BH', half_upper_tag: 'BL'
	}
}, {
	addressing_options: {
		register_tag: 'ECX', segmentation_type: 'full', half_tag: 'CX', half_lower_tag: 'CH', half_upper_tag: 'CL'
	}
}, {
	addressing_options: {
		register_tag: 'EDX', segmentation_type: 'full', half_tag: 'DX', half_lower_tag: 'DH', half_upper_tag: 'DL'
	}
}, {
	addressing_options: {
		register_tag: 'ESI',
		segmentation_type: 'partial',
		half_tag: 'SI'
	}
}, {
	addressing_options: {
		register_tag: 'EDI',
		segmentation_type: 'partial',
		half_tag: 'DI'
	}
}, {
	addressing_options: {
		register_tag: 'EBI',
		segmentation_type: 'partial',
		half_tag: 'BP'
	}
}, {
	addressing_options: {
		register_tag: 'ESP',
		segmentation_type: 'partial',
		half_tag: 'SP'
	}
}, { addressing_options: { register_tag: 'EIP', segmentation_type: 'unsegmented' } }];

export function generate_registers(): Map<string, Register> {
	let registers: Map<string, Register> = new Map();

	for (let i = 0; i < registers_options.length; i++) {
		let reg_ops = registers_options[i];
		registers.set(reg_ops.addressing_options.register_tag, new Register(reg_ops));
	}

	return registers;
}

export type RegisterAddressMap = Map<string, RegisterAddress>
export const REGISTER_ADDRESS_MAP: RegisterAddressMap = generate_register_address_map();

function checked_set(map: RegisterAddressMap, tag: string, addr: RegisterAddress): RegisterAddressMap {
	if (map.has(tag)) {
		throw `register tag duplication ${tag}`;
	}
	map.set(tag, addr);
	return map;
}

export function generate_register_address_map(): RegisterAddressMap {

	let map = new Map<string, RegisterAddress>();

	for (let i = 0; i < registers_options.length; i++) {
		let reg = registers_options[i];
		let addr_opts = reg.addressing_options;

		map = checked_set(map, addr_opts.register_tag, {
			full_tag: addr_opts.register_tag, tag_category: 'int', requested_tag: addr_opts.register_tag
		});

		if (addr_opts.segmentation_type == 'unsegmented') {
			continue;
		}

		map = checked_set(map, addr_opts.half_tag, {
			full_tag: addr_opts.register_tag, tag_category: 'short', requested_tag: addr_opts.half_tag
		});

		if (addr_opts.segmentation_type == 'partial') {
			continue;
		}

		map = checked_set(map, addr_opts.half_upper_tag, {
			full_tag: addr_opts.register_tag, tag_category: 'byte_upper', requested_tag: addr_opts.half_upper_tag
		});

		map = checked_set(map, addr_opts.half_lower_tag, {
			full_tag: addr_opts.register_tag, tag_category: 'byte_lower', requested_tag: addr_opts.half_lower_tag
		});

	}

	// the fact that this is the best way I can think of to solve this probably means I've had far too much monster and not nearly enough sleep
	return map;
}
