import uint8array from './uint8array.js';
import utf8 from './utf8.js';
/**
 * @module hex
 */
const hex = {
    /**
     * Check if the input is a hex string
     * @param {string | Uint8Array | ArrayBuffer} input - The input to check
     * @returns {boolean} Whether the input is a hex string
     */
    isHex: (input) => {
        if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
            return false;
        }
        if (typeof input === 'string') {
            return /^[0-9a-fA-F]+$/.test(input);
        }
        return false;
    },
    /**
     * Convert hex string to Uint8Array
     * @param {string} input - The hex string to convert
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array: (input) => {
        if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
            return uint8array.fromHex(input);
        }
        if (typeof input === 'string') {
            return uint8array.fromHex(input);
        }
    },
    /**
     * Convert Uint8Array to hex string
     * @param {Uint8Array} input - The Uint8Array to convert
     * @returns {string} The hex string
     */
    fromUint8Array: (input) => {
        if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
            return uint8array.toHex(input);
        }
        if (typeof input === 'string') {
            return uint8array.toHex(input);
        }
    },
    /**
     * Convert hex string to string
     * @param {string} input - The hex string to convert
     * @returns {string} The string
     */
    toString: (input) => {
        return utf8.fromHex(input);
    }
}

export default hex;