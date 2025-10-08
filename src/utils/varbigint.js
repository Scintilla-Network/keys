import uint8array from './uint8array.js';

const varbigint = {
    /**
     * Encodes a number or bigint into an extended varint buffer supporting up to 32 bytes.
     * Extended varint encoding rules:
     * - 0 to 250: single byte (0x00-0xFA)
     * - 251 to 65535: 0xFB + 2 bytes little-endian
     * - 65536 to 4294967295: 0xFC + 4 bytes little-endian
     * - 4294967296 to 18446744073709551615: 0xFD + 8 bytes little-endian
     * - 18446744073709551616 to 2^128-1: 0xFE + 16 bytes little-endian
     * - 2^128 to 2^256-1: 0xFF + 32 bytes little-endian
     * @param {bigint} num - The BigInt to encode.
     * @param {string} format - Output format: 'hex' or 'uint8array'
     * @returns {string | Uint8Array} - The encoded varbigint buffer.
     */
    encodeVarBigInt: (num, format = 'uint8array') => {
        // Only accept BigInt inputs
        if (typeof num !== 'bigint') {
            throw new Error(`Input must be a BigInt. Use BigInt() to convert numbers. ${num} is ${typeof num}`);
        }

        // Handle negative numbers by converting to positive
        if (num < 0) {
            num = -num;
        }

        let buffer;

        if (num <= 250n) {
            // Single byte: 0-250
            buffer = new Uint8Array([Number(num)]);
        } else if (num <= 65535n) {
            // 0xFB prefix + 2 bytes little-endian: 251-65535
            buffer = new Uint8Array(3);
            buffer[0] = 0xFB;
            buffer[1] = Number(num & 0xFFn);
            buffer[2] = Number((num >> 8n) & 0xFFn);
        } else if (num <= 4294967295n) {
            // 0xFC prefix + 4 bytes little-endian: 65536-4294967295
            buffer = new Uint8Array(5);
            buffer[0] = 0xFC;
            for (let i = 0; i < 4; i++) {
                buffer[i + 1] = Number((num >> BigInt(i * 8)) & 0xFFn);
            }
        } else if (num <= 18446744073709551615n) {
            // 0xFD prefix + 8 bytes little-endian: 4294967296-18446744073709551615
            buffer = new Uint8Array(9);
            buffer[0] = 0xFD;
            for (let i = 0; i < 8; i++) {
                buffer[i + 1] = Number((num >> BigInt(i * 8)) & 0xFFn);
            }
        } else if (num < (1n << 128n)) {
            // 0xFE prefix + 16 bytes little-endian: up to 2^128-1
            buffer = new Uint8Array(17);
            buffer[0] = 0xFE;
            for (let i = 0; i < 16; i++) {
                buffer[i + 1] = Number((num >> BigInt(i * 8)) & 0xFFn);
            }
        } else if (num < (1n << 256n)) {
            // 0xFF prefix + 32 bytes little-endian: up to 2^256-1
            buffer = new Uint8Array(33);
            buffer[0] = 0xFF;
            for (let i = 0; i < 32; i++) {
                buffer[i + 1] = Number((num >> BigInt(i * 8)) & 0xFFn);
            }
        } else {
            throw new Error('Value too large for varbigint encoding (max 2^256-1)');
        }

        return format === 'hex' ? uint8array.toHex(buffer) : buffer;
    },

    /**
     * Decodes an extended varint buffer into a BigInt.
     * @param {Uint8Array | string} input - The varbigint buffer to decode (Uint8Array or hex string).
     * @returns {Object} - The decoded BigInt and the length of the buffer.
     * @property {bigint} value - The decoded BigInt.
     * @property {number} length - The length of the buffer consumed.
     */
    decodeVarBigInt: (input) => {
        let buffer;
        
        // Handle hex string input
        if (typeof input === 'string') {
            buffer = uint8array.fromHex(input);
        } else {
            buffer = input;
        }

        if (!buffer || buffer.length === 0) {
            throw new Error('Empty buffer provided to decodeVarBigInt');
        }

        const firstByte = buffer[0];

        if (firstByte <= 0xFA) {
            // Single byte: 0-250 - always return as BigInt
            return { value: BigInt(firstByte), length: 1 };
        } else if (firstByte === 0xFB) {
            // 2-byte little-endian: 251-65535
            if (buffer.length < 3) {
                throw new Error('Insufficient buffer length for 0xFB varbigint');
            }
            const value = buffer[1] | (buffer[2] << 8);
            return { value: BigInt(value), length: 3 };
        } else if (firstByte === 0xFC) {
            // 4-byte little-endian: 65536-4294967295
            if (buffer.length < 5) {
                throw new Error('Insufficient buffer length for 0xFC varbigint');
            }
            const value = buffer[1] | 
                         (buffer[2] << 8) | 
                         (buffer[3] << 16) | 
                         (buffer[4] << 24);
            // Use >>> to ensure unsigned 32-bit result, then convert to BigInt
            return { value: BigInt(value >>> 0), length: 5 };
        } else if (firstByte === 0xFD) {
            // 8-byte little-endian: 4294967296-18446744073709551615
            if (buffer.length < 9) {
                throw new Error('Insufficient buffer length for 0xFD varbigint');
            }
            
            let value = BigInt(0);
            for (let i = 0; i < 8; i++) {
                value |= BigInt(buffer[i + 1]) << BigInt(i * 8);
            }
            
            return { value, length: 9 };
        } else if (firstByte === 0xFE) {
            // 16-byte little-endian: up to 2^128-1
            if (buffer.length < 17) {
                throw new Error('Insufficient buffer length for 0xFE varbigint');
            }
            
            let value = BigInt(0);
            for (let i = 0; i < 16; i++) {
                value |= BigInt(buffer[i + 1]) << BigInt(i * 8);
            }
            
            return { value, length: 17 };
        } else if (firstByte === 0xFF) {
            // 32-byte little-endian: up to 2^256-1
            if (buffer.length < 33) {
                throw new Error('Insufficient buffer length for 0xFF varbigint');
            }
            
            let value = BigInt(0);
            for (let i = 0; i < 32; i++) {
                value |= BigInt(buffer[i + 1]) << BigInt(i * 8);
            }
            
            return { value, length: 33 };
        } else {
            throw new Error(`Invalid varbigint prefix: 0x${firstByte.toString(16)}`);
        }
    },

    /**
     * Gets the minimum number of bytes needed to encode a given value.
     * @param {bigint} num - The BigInt to analyze.
     * @returns {number} - The minimum bytes needed for encoding.
     */
    getEncodingLength: (num) => {
        if (typeof num !== 'bigint') {
            throw new Error('Input must be a BigInt. Use BigInt() to convert numbers.');
        }

        if (num < 0) {
            num = -num;
        }

        if (num <= 250n) return 1;
        if (num <= 65535n) return 3;
        if (num <= 4294967295n) return 5;
        if (num <= 18446744073709551615n) return 9;
        if (num < (1n << 128n)) return 17;
        if (num < (1n << 256n)) return 33;
        
        throw new Error('Value too large for varbigint encoding');
    },

    /**
     * Checks if a value can be encoded as varbigint.
     * @param {bigint} num - The BigInt to check.
     * @returns {boolean} - True if the value can be encoded.
     */
    canEncode: (num) => {
        try {
            if (typeof num !== 'bigint') {
                return false;
            }
            return num >= 0n && num < (1n << 256n);
        } catch {
            return false;
        }
    }
};

export default varbigint;
