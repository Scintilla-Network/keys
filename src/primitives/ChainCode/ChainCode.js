import { randomBytes, bytesToHex, fromHex } from "@scintilla-network/hashes/utils";

/**
 * @module ChainCode
 * @example
 * ```js
 * import ChainCode from "./src/ChainCode/ChainCode.js";
 * const chainCode = ChainCode.generate();
 * ```
 * 
 * Mind that chain code needs to be kept secure 
 */
class ChainCode {
    constructor(code) {
        if (!code) {
            throw new Error('Chain code is required');
        }

        const codeBytes = code instanceof Uint8Array ? code : 
                         typeof code === 'string' ? fromHex(code) : 
                         new Uint8Array(code);

        // Validate chain code 
        if (codeBytes.length !== 32) {
            throw new Error('Chain code must be 32 bytes');
        }

        // Check for all zeros by looking for any non-zero byte
        let hasNonZero = false;
        for (let i = 0; i < codeBytes.length; i++) {
            if (codeBytes[i] !== 0) {
                hasNonZero = true;
                break;
            }
        }
        if (!hasNonZero) {
            throw new Error('Invalid chain code: all bytes are zero');
        }

        Object.defineProperty(this, '_code', {
            value: codeBytes,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * Generate a random chain code
     * @returns {ChainCode} The random chain code
     */
    static generate() {
        return new ChainCode(randomBytes(32));
    }

    /**
     * Convert the chain code to a buffer
     * @returns {Uint8Array} The chain code buffer
     */
    toBuffer() {
        return new Uint8Array(this._code);
    }

    /**
     * Convert the chain code to a string
     * @returns {string} The chain code string
     */
    toString() {
        return bytesToHex(this._code);
    }
}

export default ChainCode; 