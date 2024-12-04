import { Register, type RegisterAddress, type RegisterOptions } from '$lib/AsmInterpreter/system/Register';

export const registers_options: RegisterOptions[] = [{
	addressing_options: {
		register_tag: 'eax', segmentation_type: 'full', half_tag: 'ax', half_lower_tag: 'ah', half_upper_tag: 'al'
	}
}, {
	addressing_options: {
		register_tag: 'ebx', segmentation_type: 'full', half_tag: 'bx', half_lower_tag: 'bh', half_upper_tag: 'bl'
	}
}, {
	addressing_options: {
		register_tag: 'ecx', segmentation_type: 'full', half_tag: 'cx', half_lower_tag: 'ch', half_upper_tag: 'cl'
	}
}, {
	addressing_options: {
		register_tag: 'edx', segmentation_type: 'full', half_tag: 'dx', half_lower_tag: 'dh', half_upper_tag: 'dl'
	}
}, {
	addressing_options: {
		register_tag: 'esi',
		segmentation_type: 'partial',
		half_tag: 'si'
	}
}, {
	addressing_options: {
		register_tag: 'edi',
		segmentation_type: 'partial',
		half_tag: 'di'
	}
}, {
	addressing_options: {
		register_tag: 'ebp',
		segmentation_type: 'partial',
		half_tag: 'bp'
	}
}, {
	addressing_options: {
		register_tag: 'esp',
		segmentation_type: 'partial',
		half_tag: 'sp'
	}
}, { addressing_options: { register_tag: 'eip', segmentation_type: 'unsegmented' } }];

export function generate_registers(): Map<string, Register> {
	let registers: Map<string, Register> = new Map();

	let reg_names: string[] = []
	for (let i = 0; i < registers_options.length; i++) {
		let reg_ops = registers_options[i];
		registers.set(reg_ops.addressing_options.register_tag, new Register(reg_ops));
		reg_names.push(reg_ops.addressing_options.register_tag)
	}

	console.debug(`generated registers: [${reg_names.join(", ")}]`)
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
