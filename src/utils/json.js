import uint8array from './uint8array.js';
const json = {
    /**
     * Stringifies an object with bigint and Uint8Array support
     * @param {any} input - The object to stringify
     * @returns {string} - The stringified object
     */
    stringify: (input) => {
        // Handle bigint and Uint8Array
        return JSON.stringify(input, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
                return uint8array.toHex(new Uint8Array(value));
            }
            return value;
        });
    },
    /**
     * Parses a JSON string with bigint and Uint8Array support
     * @param {string} input - The JSON string to parse
     * @param {object} options - The options to parse the JSON string
     * @param {boolean} options.shouldBigInt - Whether to parse bigint
     * @param {boolean} options.shouldUint8Array - Whether to parse Uint8Array
     * @default {
     *      shouldBigInt: true,
     *      shouldUint8Array: false
     * }
     * @returns {any} - The parsed object
     */
    parse: (input, options) => {
        if(!options) {
            options = {
                shouldBigInt: true,
                shouldUint8Array: false
            };
        }
        return JSON.parse(input, (key, value) => {
            if (typeof value === 'string' && /^[0-9a-fA-F]+$/.test(value) && value.length === 64) {
                if(options.shouldUint8Array){
                    return uint8array.fromHex(value);
                }
                return value;
            }
            if (options.shouldBigInt && typeof value === 'string' && /^[0-9]+$/.test(value)) {
                return BigInt(value);
            }
            if (options.shouldUint8Array && (value instanceof Uint8Array || value instanceof ArrayBuffer)) {
                return value;
            }
            return value;
        });
    },
    /**
     * Sorts an object by its keys
     * @param {any} obj - The object to sort
     * @returns {any} - The sorted object
     */
    sortObjectByKey: (obj) => {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(json.sortObjectByKey);
        }
        const sortedKeys = Object.keys(obj).sort();
        const result = {};
        sortedKeys.forEach((key) => {
            result[key] = json.sortObjectByKey(obj[key]);
        });
        return result;
    },
    /**
     * Sorts an object by its keys and returns a JSON string
     * @param {any} obj - The object to sort
     * @returns {string} - The sorted JSON string
     */
    sortedJsonByKeyStringify: (obj) => {
        return json.stringify(json.sortObjectByKey(obj));
    }
}

export default json;