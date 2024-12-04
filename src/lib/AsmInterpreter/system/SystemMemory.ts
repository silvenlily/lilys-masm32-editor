import {
	MAX_PAGE_ID,
	MAX_PAGE_OFFSET_BYTES,
	type MemoryAddress,
	page_starting_address,
	type PageId,
	split_address
} from '$lib/AsmInterpreter/system/MemoryAddress';
import { IllegalMemoryAccessException } from '$lib/AsmInterpreter/RuntimeError';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';


export class SystemMemory {
	pages: Map<PageId, DataView> = new Map();
	stack_top: PageId;
	heap_bottom: PageId;
	static_top: PageId;
	static_bottom: PageId;

	constructor(static_allocation: DataView, static_offset: PageId) {

		let static_allocation_size_bytes = static_allocation.byteLength;
		let split_static_alloc_size = split_address(static_allocation_size_bytes);

		this.static_bottom = static_offset;
		this.static_top = this.static_bottom + split_static_alloc_size.page_id + 1;

		this.heap_bottom = this.static_top + Math.round(Math.random() * 1024);
		this.stack_top = MAX_PAGE_ID - Math.round(Math.random() * 1024);

		// copy static alloc from program into memory
		for (let offset = 0; offset < static_allocation.byteLength; offset++) {
			this.sys_set_byte(offset + page_starting_address(this.static_bottom), static_allocation.getUint8(offset));
		}

	}

	get_bytes(trace: RuntimeTrace, address: MemoryAddress, bytes: number): number {

		let current_value = 0;

		for (let offset_address = bytes-1; offset_address >= 0; offset_address--) {
			//console.log(`getting byte at 0x${(address + offset_address).toString(16).padStart(8, '0')}`);
			let next_byte = this.get_byte(trace, address + offset_address);
			current_value = current_value * Math.pow(2, 8);
			current_value = current_value | next_byte;
			//console.log(`value 0b${(next_byte).toString(2).padStart(32, '0')}`);
			//console.log(`total 0b${(current_value).toString(2).padStart(32, '0')}`);
		}

		return current_value;
	}

	get_byte(trace: RuntimeTrace, address: MemoryAddress): number {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		return page.getUint8(split_addr.page_offset);
	}

	get_short(trace: RuntimeTrace, address: MemoryAddress): number {
		return this.get_bytes(trace, address, 2);
	}

	get_int(trace: RuntimeTrace, address: MemoryAddress): number {
		return this.get_bytes(trace, address, 4);
	}

	set_bytes(trace: RuntimeTrace, address: MemoryAddress, value: number, bytes: number) {
		let mask = 0b1111_1111;
		for (let byte_shift = 0; byte_shift < bytes; byte_shift++) {
			let byte_mask = mask * Math.pow(2, byte_shift * 8);
			let masked_value = value & byte_mask;
			masked_value = Math.floor(masked_value / Math.pow(2, (byte_shift * 8)));

			this.set_byte(trace, address + byte_shift, masked_value);
		}
	}

	set_byte(trace: RuntimeTrace, address: MemoryAddress, value: number) {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		page.setUint8(split_addr.page_offset, value);
	}

	set_short(trace: RuntimeTrace, address: MemoryAddress, value: number) {
		this.set_bytes(trace, address, value, 2);
	}

	set_int(trace: RuntimeTrace, address: MemoryAddress, value: number) {
		this.set_bytes(trace, address, value, 4);
	}

	sys_set_byte(address: MemoryAddress, value: number) {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			page = new DataView(new ArrayBuffer(MAX_PAGE_OFFSET_BYTES));
			this.pages.set(split_addr.page_id, page);
		}

		//console.log(`setting byte 0x${address.toString(16).padStart(8, '0')} to 0b${value.toString(2).padStart(8, '0')}`);
		page.setUint8(split_addr.page_offset, value);
	}

	sys_set_bytes(address: MemoryAddress, value: number, bytes: number) {
		//console.log(`setting ${bytes} bytes at 0x${address.toString(16).padStart(8, '0')} 0b${value.toString(2).padStart(32, '0')}`);
		let mask = 0b1111_1111;
		for (let byte_shift = 0; byte_shift < bytes; byte_shift++) {
			let bitshift = byte_shift * 8;
			//console.log(`byte shift ${byte_shift}`);
			let byte_mask = mask * Math.pow(2, bitshift);
			//console.log(`byte mask 0b${byte_mask.toString(2).padStart(32, '0')}`);
			let masked_value = value & byte_mask;
			masked_value = Math.floor(masked_value / Math.pow(2, bitshift));
			//console.log(`setting byte to 0b${masked_value.toString(2).padStart(8, '0')}`);
			this.sys_set_byte(address + (byte_shift), masked_value);
		}
	}

	sys_get_byte(address: MemoryAddress): number {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			return 0;
		}

		return page.getUint8(split_addr.page_offset);
	}

	sys_get_bytes(address: MemoryAddress, bytes: number): number {

		let current_value = 0;

		for (let offset_address = bytes-1; offset_address >= 0; offset_address--) {
			//console.log(`getting byte at 0x${(address + offset_address).toString(16).padStart(8, '0')}`);
			let next_byte = this.sys_get_byte(address + offset_address);
			current_value = current_value * Math.pow(2, 8);
			current_value = current_value | next_byte;
			//console.log(`value 0b${(next_byte).toString(2).padStart(32, '0')}`);
			//console.log(`total 0b${(current_value).toString(2).padStart(32, '0')}`);
		}

		return current_value;
	}

}