import ChainCode from "../ChainCode/ChainCode.js";
import { BITCOIN_VERSIONS } from "../../config.js";

class ExtendedKey {
    /**
     * Create an extended key from a chain code, depth, parent fingerprint, and index
     * @param {ChainCode} chainCode - The chain code to create the extended key from
     * @param {number} depth - The depth of the extended key
     * @param {number} parentFingerprint - The parent fingerprint of the extended key
     * @param {number} index - The index of the extended key
     */
    constructor(chainCode, depth = 0, parentFingerprint = 0, index = 0) {
        if (!chainCode) {
            throw new Error('Chain code is required');
        }

        this.depth = depth;
        this.parentFingerprint = parentFingerprint;
        this.index = index;
        this.chainCode = chainCode instanceof ChainCode ? chainCode : new ChainCode(chainCode);
        this.versions = BITCOIN_VERSIONS;
        this.useBIP84 = false;  // Default to legacy versions

        // Validate depth
        if (depth > 255) {
            throw new Error('Depth too high');
        }

        // Validate zero depth with non-zero parent fingerprint or index
        if (!depth && (parentFingerprint || index)) {
            throw new Error('Zero depth with non-zero index/parent fingerprint');
        }
    }

    /**
     * Set the BIP84 mode
     * @param {boolean} enabled - The enabled state of the BIP84 mode
     * @returns {ExtendedKey} The extended key
     */
    setBIP84Mode(enabled) {
        this.useBIP84 = enabled;
        return this;
    }

    /**
     * Serialize the extended key
     * @param {number} version - The version of the extended key
     * @param {Uint8Array} key - The key to serialize
     * @returns {Uint8Array} The serialized extended key
     */
    serialize(version, key) {
        if (!this.chainCode) {
            throw new Error('No chainCode set');
        }

        // Use BIP84 versions if enabled
        if (this.useBIP84) {
            if (version === this.versions.private) {
                version = this.versions.bip84Private;
            } else if (version === this.versions.public) {
                version = this.versions.bip84Public;
            }
        }

        // Validate version
        const validVersions = this.useBIP84 
            ? [this.versions.bip84Private, this.versions.bip84Public]
            : [this.versions.private, this.versions.public];
            
        if (!validVersions.includes(version)) {
            throw new Error('Invalid version');
        }

        // Validate key length
        if (key.length !== 33 && key.length !== 32) {
            throw new Error('Invalid key length');
        }

        // version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
        const buffer = new Uint8Array(78);
        let offset = 0;

        // Write version bytes (big-endian)
        buffer[offset++] = (version >>> 24) & 0xff;
        buffer[offset++] = (version >>> 16) & 0xff;
        buffer[offset++] = (version >>> 8) & 0xff;
        buffer[offset++] = version & 0xff;

        // Write depth
        buffer[offset++] = this.depth;

        // Write parent fingerprint (big-endian)
        buffer[offset++] = (this.parentFingerprint >>> 24) & 0xff;
        buffer[offset++] = (this.parentFingerprint >>> 16) & 0xff;
        buffer[offset++] = (this.parentFingerprint >>> 8) & 0xff;
        buffer[offset++] = this.parentFingerprint & 0xff;

        // Write index (big-endian)
        buffer[offset++] = (this.index >>> 24) & 0xff;
        buffer[offset++] = (this.index >>> 16) & 0xff;
        buffer[offset++] = (this.index >>> 8) & 0xff;
        buffer[offset++] = this.index & 0xff;

        // Write chain code
        buffer.set(this.chainCode.toBuffer(), offset);
        offset += 32;

        // Write key
        buffer.set(key, offset);

        return buffer;
    }

    /**
     * Convert a uint32 to bytes
     * @param {number} num - The number to convert to bytes
     * @returns {Uint8Array} The bytes
     */
    _uint32ToBytes(num) {
        const buffer = new Uint8Array(4);
        buffer[0] = (num >>> 24) & 0xff;
        buffer[1] = (num >>> 16) & 0xff;
        buffer[2] = (num >>> 8) & 0xff;
        buffer[3] = num & 0xff;
        return buffer;
    }

    /**
     * Convert bytes to a uint32
     * @param {Uint8Array} bytes - The bytes to convert to a uint32
     * @returns {number} The uint32
     */
    _bytesToUint32(bytes) {
        return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    }
}

export default ExtendedKey; 