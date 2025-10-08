import uint8array from './uint8array.js';

/**
 * @module utf8
 */
const utf8 = {
    /**
     * Convert UTF-8 string to hex string
     * @param {string} message - The message to convert
     * @returns {string} The hex string
     */
    toHex: (message) => {
        return uint8array.toHex(new Uint8Array(new TextEncoder().encode(message)));
    },
    /**
     * Convert UTF-8 string to Uint8Array
     * @param {string} message - The message to convert
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array: (message) => {
        return new Uint8Array(new TextEncoder().encode(message));
    },

    /**
     * Convert Uint8Array to UTF-8 string
     * @param {Uint8Array} uint8Array - The Uint8Array to convert
     * @returns {string} The UTF-8 string
     */
    fromUint8Array: (uint8Array) => {
        return new TextDecoder().decode(uint8Array);
    },
    /**
     * Convert hex string to Uint8Array
     * @param {string} hex - The hex string to convert
     * @returns {string} The UTF-8 string
     */
    fromHex: (hex) => {
        const array = uint8array.fromHex(hex);
        return new TextDecoder().decode(array);
    },
    /**
     * Check if input is valid UTF-8
     * @param {string|Uint8Array|ArrayBuffer} input - The input to check
     * @returns {boolean} True if input is valid UTF-8
     */
    isUtf8: (input) => {
        try {
            if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
                return false;
            }
            if (typeof input === 'string') {
                const encoded = new TextEncoder().encode(input);
                const decoded = new TextDecoder().decode(encoded);
                return decoded === input;
            }
            return false;
        } catch (e) {
            return false;
        }
    }
}

export default utf8;