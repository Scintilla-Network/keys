import uint8array from './uint8array.js';
import utf8 from './utf8.js';
/**
 * @module hex
 */
const hex = {
    /**
     * Check if the input is a hex string
     * @param {string | Uint8Array} input - The input to check
     * @returns {boolean} Whether the input is a hex string
     */
    isHex: (input) => {
        if (input instanceof Uint8Array) {
            return false;
        }
        if (typeof input === 'string') {
            return /^[0-9a-fA-F]+$/.test(input);
        }
        return false;
    },
    /**
     * Convert hex string to Uint8Array
     * @param {string | Uint8Array} input - The hex string to convert
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array: (input) => {
        if (input instanceof Uint8Array) {
            return input;
        }
        if (typeof input === 'string') {
            return uint8array.fromHex(input);
        }
        return new Uint8Array();
    },
    /**
     * Convert Uint8Array to hex string
     * @param {Uint8Array | string} input - The Uint8Array to convert
     * @returns {string | undefined} The hex string
     */
    fromUint8Array: (input) => {
        if (input instanceof Uint8Array) {
            return uint8array.toHex(input);
        }
        if (typeof input === 'string') {
            return input;
        }
    },
    /**
     * Convert hex string to string
     * @param {string | Uint8Array} input - The hex string to convert
     * @returns {string | undefined} The string
     */
    toString: (input) => {
        if (input instanceof Uint8Array) {
            return utf8.fromHex(uint8array.toHex(input));
        }
        if (typeof input === 'string') {
            return utf8.fromHex(input);
        }
    }
}

export default hex;