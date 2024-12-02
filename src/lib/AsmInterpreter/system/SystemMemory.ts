import {
	BYTES_PER_PAGE, MAX_PAGE_ID, type MemoryAddress, page_starting_address, type PageId, split_address
} from '$lib/AsmInterpreter/system/MemoryAddress';
import { IllegalMemoryAccessException, UnknownRuntimeException } from '$lib/AsmInterpreter/RuntimeError';
import type { RuntimeTrace } from '$lib/AsmInterpreter/Trace';


export class SystemMemory {
	pages: Map<PageId, DataView> = new Map();
	stack_bottom: PageId;
	heap_top: PageId;
	static_top: PageId;

	constructor(static_allocation: DataView) {
		this.stack_bottom = MAX_PAGE_ID;
		let static_allocation_size = static_allocation.byteLength;
		this.static_top = static_allocation_size;
		this.heap_top = static_allocation_size + 1;

		for (let offset = 0; offset < static_allocation.byteLength; offset++) {
			this.sys_set_byte(offset, static_allocation.getUint8(offset));
		}

	}

	stack_alloc(trace: RuntimeTrace, length?: number): MemoryAddress {
		let pages;
		if (length != undefined) {
			pages = Math.ceil(length / BYTES_PER_PAGE);
		} else {
			pages = 1;
		}

		let page_id: PageId = this.stack_bottom;
		this.stack_bottom -= pages ?? 1;

		for (let i = 0; i < pages; i++) {
			if (this.pages.get(page_id + i) != undefined) {
				throw new UnknownRuntimeException('Illegal Memory Allocation', trace, 'Stack allocation failed due to memory address already being initialized');
			} else {
				this.pages.set(page_id + i, new DataView(new ArrayBuffer(BYTES_PER_PAGE)));
			}
		}

		return page_starting_address(page_id);
	}

	heap_alloc(trace: RuntimeTrace, length?: number): MemoryAddress {
		let pages;
		if (length != undefined) {
			pages = Math.ceil(length / BYTES_PER_PAGE);
		} else {
			pages = 1;
		}

		let page_id: PageId = this.heap_top;
		this.heap_top += pages;

		for (let i = 0; i < pages; i++) {
			if (this.pages.get(page_id + i) != undefined) {
				throw new UnknownRuntimeException('Illegal Memory Allocation', trace, 'Heap allocation failed due to memory address already being initialized');
			} else {
				this.pages.set(page_id + i, new DataView(new ArrayBuffer(BYTES_PER_PAGE)));
			}
		}

		return page_starting_address(page_id);
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
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		return page.getUint16(split_addr.page_offset);
	}

	get_int(trace: RuntimeTrace, address: MemoryAddress): number {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		return page.getUint32(split_addr.page_offset);
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
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		page.setUint16(split_addr.page_offset, value);
	}

	set_int(trace: RuntimeTrace, address: MemoryAddress, value: number) {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			throw new IllegalMemoryAccessException(trace, address);
		}

		page.setUint32(split_addr.page_offset, value);
	}

	sys_set_byte(address: MemoryAddress, value: number) {
		let split_addr = split_address(address);

		let page = this.pages.get(split_addr.page_id);
		if (page == undefined) {
			page = new DataView(new ArrayBuffer(BYTES_PER_PAGE));
			this.pages.set(split_addr.page_id, page);
		}

		page.setUint8(split_addr.page_offset, value);
	}

}