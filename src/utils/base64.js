import uint8array from './uint8array.js';

const base64 = {
    /**
     * Convert base64 string to hex string
     * @param {string} base64String - The base64 string to convert
     * @returns {string} The hex string
     */
    toHex: (base64String) => {
        const bytes = base64.toUint8Array(base64String);
        return uint8array.toHex(bytes);
    },

    /**
     * Convert hex string to base64 string
     * @param {string} hex - The hex string to convert
     * @returns {string} The base64 string
     */
    fromHex: (hex) => {
        const bytes = uint8array.fromHex(hex);
        return base64.fromUint8Array(bytes);
    },

    /**
     * Convert base64 string to UTF-8 string
     * @param {string} base64String - The base64 string to convert
     * @returns {string} The decoded string
     */
    toString: (base64String) => {
        const bytes = base64.toUint8Array(base64String);
        return uint8array.toString(bytes);
    },

    /**
     * Convert UTF-8 string to base64 string
     * @param {string} string - The string to convert
     * @returns {string} The base64 string
     */
    fromString: (string) => {
        const bytes = uint8array.fromString(string);
        return base64.fromUint8Array(bytes);
    },

    /**
     * Convert Uint8Array to base64 string
     * Implements RFC 4648 Base64 encoding
     * @param {Uint8Array} bytes - The Uint8Array to convert
     * @returns {string} The base64 string
     */
    fromUint8Array: (bytes) => {
        if (!bytes || bytes.length === 0) {
            return '';
        }

        // Use built-in btoa for base64 encoding (available in browsers and Node.js 16+)
        try {
            let binaryString = '';
            for (let i = 0; i < bytes.length; i++) {
                binaryString += String.fromCharCode(bytes[i]);
            }
            return btoa(binaryString);
        } catch (error) {
            // Fallback for environments without btoa
            return base64._encodeBase64Manual(bytes);
        }
    },

    /**
     * Manual base64 encoding fallback (RFC 4648)
     * @private
     * @param {Uint8Array} bytes - The bytes to encode
     * @returns {string} The base64 string
     */
    _encodeBase64Manual: (bytes) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;

        while (i < bytes.length) {
            const a = bytes[i++];
            const b = i < bytes.length ? bytes[i++] : 0;
            const c = i < bytes.length ? bytes[i++] : 0;

            const bitmap = (a << 16) | (b << 8) | c;

            result += chars.charAt((bitmap >> 18) & 63);
            result += chars.charAt((bitmap >> 12) & 63);
            result += i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
            result += i - 1 < bytes.length ? chars.charAt(bitmap & 63) : '=';
        }

        return result;
    },

    /**
     * Manual base64 decoding fallback (RFC 4648)
     * @private
     * @param {string} base64 - The base64 string to decode
     * @returns {Uint8Array} The decoded bytes
     */
    _decodeBase64Manual: (base64) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = Object.create(null);
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charAt(i)] = i;
        }

        // Remove padding and whitespace
        base64 = base64.replace(/[=\s]/g, '');
        
        const bytes = [];
        let i = 0;

        while (i < base64.length) {
            const encoded1 = lookup[base64.charAt(i++)];
            const encoded2 = lookup[base64.charAt(i++)];
            const encoded3 = lookup[base64.charAt(i++)];
            const encoded4 = lookup[base64.charAt(i++)];

            const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

            bytes.push((bitmap >> 16) & 255);
            if (encoded3 !== undefined) bytes.push((bitmap >> 8) & 255);
            if (encoded4 !== undefined) bytes.push(bitmap & 255);
        }

        return new Uint8Array(bytes);
    },
    /**
     * Convert base64 string to Uint8Array
     * Implements RFC 4648 Base64 decoding
     * @param {string} base64String - The base64 string to convert
     * @returns {Uint8Array} The decoded Uint8Array
     */
    toUint8Array: (base64String) => {
        if (!base64String || base64String.length === 0) {
            return new Uint8Array([]);
        }
        
        // Use built-in atob for base64 decoding (available in browsers and Node.js 16+)
        try {
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (error) {
            // Fallback for environments without atob or invalid base64
            return base64._decodeBase64Manual(base64String);    
        }
    },

}

export default base64;