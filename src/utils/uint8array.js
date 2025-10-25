/**
 * @module uint8array
 */
const uint8array = {
    /**
     * Check if the input is a Uint8Array
     * @param {any} input - The input to check
     * @returns {boolean} Whether the input is a Uint8Array
     */
    isUint8Array: (input) => {
        return input instanceof Uint8Array;
    },
    /**
     * Convert Uint8Array to hex string
     * @param {Uint8Array} input - The Uint8Array to convert
     * @returns {string} The hex string
     */
    toHex: (input) => {
        if(typeof input === 'string') return input;
        if(!input || input === null || input === undefined) return '';
        return input.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '') || '';
    },
    /**
     * Convert hex string to Uint8Array
     * @param {string} hex - The hex string to convert
     * @returns {Uint8Array} The Uint8Array
     */
    fromHex: (hex) => {
        // @ts-ignore
        if(hex instanceof Uint8Array) return hex;
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
    /**
         * Convert Uint8Array to bigint on 8 bytes
         * @param {Uint8Array} arr - The Uint8Array to convert
         * @returns {bigint} The bigint
         */
    toBigInt: (arr) => {
        let bigint = BigInt(0);
        for (let i = 0; i < 8; i++) {
            bigint += BigInt(arr[i]) << BigInt(i * 8);
        }
        return bigint;
    },
    /**
     * Convert 8 bytes bigint to Uint8Array 
     * @param {bigint} bigint - The bigint to convert
     * @returns {Uint8Array} The Uint8Array
     */
    fromBigInt: (bigint) => {
        const array = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            array[i] = Number((bigint >> BigInt(i * 8)) & 0xFFn);
        }
        return array;
    },
    /**
     * Convert Uint8Array to string
     * @param {Uint8Array} array - The Uint8Array to convert
     * @returns {string} The string
     */
    stringify: (array) => {
        // We want the bytes number 8 representation as a string (e.g: [127, 0, 0, 0, 0, 0, 0, 0])
        return array.map(byte => Number(byte)).join(',');
    },
    /**
     * Compare two Uint8Arrays for equality
     * @param {Uint8Array} array1 - The first Uint8Array to compare
     * @param {Uint8Array} array2 - The second Uint8Array to compare
     * @returns {boolean} Whether the two Uint8Arrays are equal
     */
    equals: (array1, array2) => {
        // If same reference, return true
        if (array1 === array2) return true;

        // Can we quit early ? 
        if (!array1 || !array2 || array1.length !== array2.length) return false;

        const len = array1.length;
        const fullChunks = Math.floor(len / 4);
        
        // We use Uint32Array to compare 32-bit chunks for efficiency
        const view1 = new Uint32Array(array1.buffer, array1.byteOffset, fullChunks);
        const view2 = new Uint32Array(array2.buffer, array2.byteOffset, fullChunks);

        for (let i = 0; i < fullChunks; i++) {
            if (view1[i] !== view2[i]) {
                return false;
            }
        }

        // Then, we individually compare the remaining bytes
        for (let i = fullChunks * 4; i < len; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }

        return true;
    }

   
}

export default uint8array;