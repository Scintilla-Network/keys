import uint8array from './uint8array.js';

const varint = {
    /**
     * Encodes a number or bigint into a Bitcoin varint buffer.
     * Bitcoin varint encoding rules (per Bitcoin protocol specification):
     * - 0 to 252: single byte (0x00 to 0xFC)
     * - 253 to 65535: 0xFD + 2 bytes little-endian
     * - 65536 to 4294967295: 0xFE + 4 bytes little-endian
     * - 4294967296 to 18446744073709551615: 0xFF + 8 bytes little-endian
     * @param {number | bigint} num - The number or bigint to encode.
     * @param {string} format - Output format: 'hex' or 'uint8array'
     * @returns {string | Uint8Array} - The encoded varint buffer.
     */
    encodeVarInt: (num, format = 'uint8array') => {
        // Validate input type
        if (typeof num !== 'number' && typeof num !== 'bigint') {
            throw new Error('Input must be a number or BigInt');
        }

        // Convert to BigInt for consistent handling
        if (typeof num !== 'bigint') {
            num = BigInt(num);
        }

        // Bitcoin varints must be non-negative
        if (num < 0) {
            throw new Error('Bitcoin varint values must be non-negative');
        }

        // Check maximum value (Bitcoin protocol limit)
        if (num > 18446744073709551615n) {
            throw new Error('Value exceeds maximum Bitcoin varint value (2^64 - 1)');
        }

        let buffer;

        if (num <= 252n) {
            // Single byte: 0-252
            buffer = new Uint8Array([Number(num)]);
        } else if (num <= 65535n) {
            // 0xFD prefix + 2 bytes little-endian: 253-65535
            buffer = new Uint8Array(3);
            buffer[0] = 0xFD;
            buffer[1] = Number(num & 0xFFn);
            buffer[2] = Number((num >> 8n) & 0xFFn);
        } else if (num <= 4294967295n) {
            // 0xFE prefix + 4 bytes little-endian: 65536-4294967295
            buffer = new Uint8Array(5);
            buffer[0] = 0xFE;
            buffer[1] = Number(num & 0xFFn);
            buffer[2] = Number((num >> 8n) & 0xFFn);
            buffer[3] = Number((num >> 16n) & 0xFFn);
            buffer[4] = Number((num >> 24n) & 0xFFn);
        } else if (num <= 18446744073709551615n) {
            // 0xFF prefix + 8 bytes little-endian: 4294967296-18446744073709551615
            buffer = new Uint8Array(9);
            buffer[0] = 0xFF;
            for (let i = 0; i < 8; i++) {
                buffer[i + 1] = Number((num >> BigInt(i * 8)) & 0xFFn);
            }
        } else {
            throw new Error('Value too large for Bitcoin varint encoding (max 2^64 - 1)');
        }

        return format === 'hex' ? uint8array.toHex(buffer) : buffer;
    },

    /**
     * Decodes a Bitcoin varint buffer into a number or bigint.
     * @param {Uint8Array | string} input - The varint buffer to decode (Uint8Array or hex string).
     * @returns {Object} - The decoded number or bigint and the length of the buffer.
     * @property {number | bigint} value - The decoded number or bigint.
     * @property {number} length - The length of the buffer consumed.
     */
    decodeVarInt: (input) => {
        let buffer;
        
        // Handle hex string input
        if (typeof input === 'string') {
            buffer = uint8array.fromHex(input);
        } else {
            buffer = input;
        }

        if (!buffer || buffer.length === 0) {
            throw new Error('Empty buffer provided to decodeVarInt');
        }

        const firstByte = buffer[0];

        if (firstByte <= 0xFC) {
            // Single byte: 0-252
            return { value: firstByte, length: 1 };
        } else if (firstByte === 0xFD) {
            // 2-byte little-endian: 253-65535
            if (buffer.length < 3) {
                throw new Error('Insufficient buffer length for 0xFD varint');
            }
            const value = buffer[1] | (buffer[2] << 8);
            
            // Validate canonical encoding (Bitcoin protocol requirement)
            if (value < 253) {
                throw new Error('Non-canonical varint encoding: value could be encoded as single byte');
            }
            
            return { value, length: 3 };
        } else if (firstByte === 0xFE) {
            // 4-byte little-endian: 65536-4294967295
            if (buffer.length < 5) {
                throw new Error('Insufficient buffer length for 0xFE varint');
            }
            const value = buffer[1] | 
                         (buffer[2] << 8) | 
                         (buffer[3] << 16) | 
                         (buffer[4] << 24);
            // Use >>> to ensure unsigned 32-bit result
            const result = value >>> 0;
            
            // Validate canonical encoding
            if (result <= 65535) {
                throw new Error('Non-canonical varint encoding: value could be encoded with smaller prefix');
            }
            
            return { value: result, length: 5 };
        } else if (firstByte === 0xFF) {
            // 8-byte little-endian: 4294967296-18446744073709551615
            if (buffer.length < 9) {
                throw new Error('Insufficient buffer length for 0xFF varint');
            }
            
            let value = BigInt(0);
            for (let i = 0; i < 8; i++) {
                value |= BigInt(buffer[i + 1]) << BigInt(i * 8);
            }
            
            // Validate canonical encoding
            if (value <= 4294967295n) {
                throw new Error('Non-canonical varint encoding: value could be encoded with smaller prefix');
            }
            
            // Return as regular number if it fits in safe integer range
            if (value <= BigInt(Number.MAX_SAFE_INTEGER)) {
                return { value: Number(value), length: 9 };
            }
            
            return { value, length: 9 };
        } else {
            throw new Error(`Invalid varint prefix: 0x${firstByte.toString(16)}`);
        }
    },

    /**
     * Gets the minimum number of bytes needed to encode a given value.
     * @param {number | bigint} num - The number to analyze.
     * @returns {number} - The minimum bytes needed for encoding.
     */
    getEncodingLength: (num) => {
        if (typeof num !== 'number' && typeof num !== 'bigint') {
            throw new Error('Input must be a number or BigInt');
        }

        if (typeof num !== 'bigint') {
            num = BigInt(num);
        }

        if (num < 0) {
            throw new Error('Bitcoin varint values must be non-negative');
        }

        if (num <= 252n) return 1;
        if (num <= 65535n) return 3;
        if (num <= 4294967295n) return 5;
        if (num <= 18446744073709551615n) return 9;
        
        throw new Error('Value too large for Bitcoin varint encoding');
    },

    /**
     * Checks if a value can be encoded as Bitcoin varint.
     * @param {number | bigint} num - The number to check.
     * @returns {boolean} - True if the value can be encoded.
     */
    canEncode: (num) => {
        try {
            if (typeof num !== 'number' && typeof num !== 'bigint') {
                return false;
            }
            
            if (typeof num !== 'bigint') {
                num = BigInt(num);
            }
            
            return num >= 0n && num <= 18446744073709551615n;
        } catch {
            return false;
        }
    }
}

export default varint;