/**
 * @module uint8array
 */
const uint8array = {
    /**
     * Convert Uint8Array to hex string
     * @param {Uint8Array} input - The Uint8Array to convert
     * @returns {string} The hex string
     */
    toHex: (input) => {
        if(!input || input === null || input === undefined) return '';
        return input.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '') || '';
    },
    /**
     * Convert hex string to Uint8Array
     * @param {string} hex - The hex string to convert
     * @returns {Uint8Array} The Uint8Array
     */
    fromHex: (hex) => {
        if(!hex || hex === null || hex === undefined) return new Uint8Array();
        return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) || new Uint8Array();
    },
    /**
     * Convert object to Uint8Array
     * @param {object} object - The object to convert
     * @returns {Uint8Array} The Uint8Array
     */
    fromObject: (object) => {
        const stringified = JSON.stringify(object, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
                return uint8array.toHex(new Uint8Array(value));
            }
            return value;
        });
        return new Uint8Array(new TextEncoder().encode(stringified));
    },
    /**
     * Convert Uint8Array to object
     * @param {Uint8Array} uint8array - The Uint8Array to convert
     * @returns {object} The object
     * @dev This will not properly parse Uint8Array and ArrayBuffer, only convert them to hex string. Similar for BigInt.
     */
    toObject: (uint8array) => {
        const decoded = new TextDecoder().decode(uint8array);
        const parsed = JSON.parse(decoded);
        return parsed;
    },
    /**
     * Convert string to Uint8Array
     * @param {string} string - The string to convert
     * @returns {Uint8Array} The Uint8Array
     */
    fromString: (string) => {
        return new Uint8Array(new TextEncoder().encode(string));
    },

    /**
     * Convert Uint8Array to string
     * @param {Uint8Array} uint8array - The Uint8Array to convert
     * @returns {string} The string
     */
    toString: (uint8array) => {
        return new TextDecoder().decode(uint8array);
    },
}

export default uint8array;