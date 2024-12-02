// total number of bits in a memory address
export const MEMORY_ADDRESS_SPACE = 32 as const;
// number of bits in the page id
export const PAGE_ID_SIZE = 20 as const;
export const PAGE_ID_MASK = 0b11111111_11111111_11110000_00000000;
// number of bits in the page offset
export const PAGE_OFFSET_SIZE = 12 as const;
export const PAGE_OFFSET_MASK = 0b00000000_00000000_00001111_11111111;

// if these any of these fail the above config is invalid
console.assert(MEMORY_ADDRESS_SPACE === PAGE_ID_SIZE + PAGE_OFFSET_SIZE, 'Improper memory address space config');
console.assert(Math.pow(2, MEMORY_ADDRESS_SPACE) === (PAGE_ID_MASK ^ PAGE_OFFSET_MASK), 'Improper memory address space config');
console.assert(Math.pow(2, PAGE_OFFSET_SIZE) === PAGE_OFFSET_MASK, 'Improper memory address space config');
console.assert(Math.pow(2, PAGE_ID_SIZE) === (PAGE_ID_MASK >> PAGE_OFFSET_SIZE), 'Improper memory address space config');

// how many bytes make up the page offset
export const BYTES_PER_PAGE = Math.pow(2, PAGE_OFFSET_SIZE);
export const BITS_PER_PAGE = BYTES_PER_PAGE * 8;
// how many total pages are available in the address space
export const MAX_PAGE_ID = Math.pow(2, PAGE_ID_SIZE);
export const TOTAL_MEMORY_ADDRESSES = Math.pow(2, MEMORY_ADDRESS_SPACE);

export type PageId = number;
export type PageOffset = number;
export type MemoryAddress = number;

/**
 * computes the memory address of the first byte of the page
 */
export function page_starting_address(page_id: PageId): MemoryAddress {
	return page_id << PAGE_OFFSET_SIZE;
}

/**
 * joins page_id and page_offset into a memory address
 */
export function join_address(id: PageId, offset: PageOffset): MemoryAddress {
	let page_id = id << PAGE_OFFSET_SIZE;
	return page_id | offset;
}

/**
 * splits a memory address into its page_id and page_offset components
 */
export function split_address(address: MemoryAddress): { page_id: PageId, page_offset: PageOffset } {
	// 0x iiiiiiii iiiiiiii ffffffff ffffffff
	let addr = Math.round(address);

	let page_offset = addr & PAGE_OFFSET_MASK;
	let page_id = addr & PAGE_ID_MASK;
	page_id >>= PAGE_OFFSET_SIZE;

	// we round here to deal with floating point weirdness
	return { page_id: page_id, page_offset: page_offset };
}