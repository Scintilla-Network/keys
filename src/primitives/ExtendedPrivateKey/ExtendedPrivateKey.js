import ChainCode from "../ChainCode/ChainCode.js";
import PrivateKey from "../PrivateKey/PrivateKey.js";
import ExtendedPublicKey from "../ExtendedPublicKey/ExtendedPublicKey.js";
import ExtendedKey from "../ExtendedKey/ExtendedKey.js";

import { mod, bytesToNumberBE, numberToBytesBE } from "@scintilla-network/signatures/utils";
import { hash160, base58check, hmac } from "@scintilla-network/hashes/utils";
import { secp256k1 as secp } from "@scintilla-network/signatures/classic";
import { sha512 } from "@scintilla-network/hashes/classic";

class ExtendedPrivateKey extends ExtendedKey {
    /**
     * Create an extended private key from a private key, chain code, depth, parent fingerprint, and index
     * @param {PrivateKey} privateKey - The private key to create the extended private key from
     * @param {ChainCode} chainCode - The chain code to create the extended private key from
     * @param {number} depth - The depth of the extended private key
     * @param {number} parentFingerprint - The parent fingerprint of the extended private key
     * @param {number} index - The index of the extended private key
     */
    constructor(privateKey, chainCode, depth = 0, parentFingerprint = 0, index = 0) {
        super(chainCode, depth, parentFingerprint, index);

        if (!(privateKey instanceof PrivateKey)) {
            throw new Error('Private key must be an instance of PrivateKey');
        }

        // Validate the private key
        const privateKeyBytes = privateKey.getKey();
        if (!secp.isValidPrivateKey(privateKeyBytes)) {
            throw new Error('Invalid private key');
        }

        Object.defineProperty(this, '_privateKey', {
            value: privateKey,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * Create an extended private key from a seed
     * @param {Uint8Array} seed - The seed to create the extended private key from
     * @returns {ExtendedPrivateKey} The extended private key
     */
    static fromSeed(seed) {
        // const I = hmac(sha512, Buffer.from('Bitcoin seed', 'utf8'), seed);
        const I = hmac(sha512, new TextEncoder().encode('Bitcoin seed'), seed);
        const IL = I.slice(0, 32);  // Master private key
        const IR = I.slice(32);     // Master chain code

        // Validate the master private key
        const masterKey = bytesToNumberBE(IL);
        if (masterKey <= 0 || masterKey >= secp.CURVE.n) {
            throw new Error('Invalid master key');
        }

        return new ExtendedPrivateKey(new PrivateKey(IL), new ChainCode(IR));
    }


    /**
     * Create an extended private key from a hex string
     * @param {string} extendedKeyHex - The hex string to create the extended private key from
     * @returns {ExtendedPrivateKey} The extended private key
     */
    static fromHex(extendedKeyHex) {
        // if string, then to Uint8Array
        if (typeof extendedKeyHex === 'string') {
            // extendedKeyHex = Buffer.from(extendedKeyHex, 'hex');
            extendedKeyHex = new Uint8Array(extendedKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        }

        return new ExtendedPrivateKey(new PrivateKey(extendedKeyHex), new ChainCode(extendedKeyHex.slice(32)));
    }

    /**
     * Create an extended private key from a base58 string
     * @param {string} extendedKeyString - The base58 string to create the extended private key from
     * @returns {ExtendedPrivateKey} The extended private key
     */
    static fromBase58(extendedKeyString) {
        // If Uint8Array, then to string
        if (extendedKeyString instanceof Uint8Array) {
            extendedKeyString = extendedKeyString.toString('hex');
        }

        // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
        const keyBuffer = base58check.decode(extendedKeyString);
        const version = (keyBuffer[0] << 24) | (keyBuffer[1] << 16) | (keyBuffer[2] << 8) | keyBuffer[3];
        const depth = keyBuffer[4];
        const parentFingerprint = (keyBuffer[5] << 24) | (keyBuffer[6] << 16) | (keyBuffer[7] << 8) | keyBuffer[8];
        const index = (keyBuffer[9] << 24) | (keyBuffer[10] << 16) | (keyBuffer[11] << 8) | keyBuffer[12];
        const chainCode = new ChainCode(keyBuffer.slice(13, 45));
        
        const keyData = keyBuffer.slice(45);
        if (keyData[0] !== 0) {
            throw new Error('Not a private key');
        }
        
        const privateKey = new PrivateKey(keyData.slice(1));
        
        return new ExtendedPrivateKey(privateKey, chainCode, depth, parentFingerprint, index);
    }

    /**
     * Derive a key from a path
     * @param {string} path - The path to derive the key from
     * @returns {ExtendedPrivateKey} The derived key
     */
    derive(path) {
        if (typeof path === 'string') {
            if (path === 'm' || path === 'M') {
                return this;
            }

            if (!/^[mM]'?/.test(path)) {
                throw new Error('Path must start with "m" or "M"');
            }

            if (/^[mM]'?$/.test(path)) {
                return this;
            }

            const parts = path.replace(/^[mM]'?\//, '').split('/');
            let key = this;
            for (const part of parts) {
                const m = /^(\d+)('?)$/.exec(part);
                if (!m || m.length !== 3) {
                    throw new Error('Invalid path segment: ' + part);
                }

                let index = parseInt(m[1]);
                if (!Number.isSafeInteger(index) || index >= 0x80000000) {
                    throw new Error('Invalid index');
                }

                if (m[2] === "'") {
                    index += 0x80000000;
                }

                key = key.deriveChild(index);
            }
            return key;
        } else {
            return this.deriveChild(path);
        }
    }

    /**
     * Derive a child key
     * @param {number} index - The index of the child key
     * @returns {ExtendedPrivateKey} The derived child key
     */
    deriveChild(index) {
        if (!this._privateKey || !this.chainCode) {
            throw new Error('No privateKey or chainCode set');
        }

        let data;
        if (index >= 0x80000000) { // Hardened
            // Hardened child: 0x00 || ser256(kpar) || ser32(index)
            const privateKeyBytes = this._privateKey.getKey();
            // data = Buffer.concat([
            //     Buffer.from([0]),
            //     Buffer.from(privateKeyBytes),
            //     Buffer.from([
            //         (index >>> 24) & 0xff,
            //         (index >>> 16) & 0xff,
            //         (index >>> 8) & 0xff,
            //         index & 0xff
            //     ])
            // ]);
            data = new Uint8Array([
                0,
                 ...privateKeyBytes,
                (index >>> 24) & 0xff,
                (index >>> 16) & 0xff,
                (index >>> 8) & 0xff,
                index & 0xff
            ]);
        } else {
            // Normal child: serP(point(kpar)) || ser32(index)
            const publicKeyBytes = this._privateKey.getPublicKey().getKey();
            // data = Buffer.concat([
            //     Buffer.from(publicKeyBytes),
            //     Buffer.from([
            //         (index >>> 24) & 0xff,
            //         (index >>> 16) & 0xff,
            //         (index >>> 8) & 0xff,
            //         index & 0xff
            //     ])
            // ]);
            data = new Uint8Array([
                ...publicKeyBytes,
                (index >>> 24) & 0xff,
                (index >>> 16) & 0xff,
                (index >>> 8) & 0xff,
                index & 0xff
            ]);
        }

        const I = hmac(sha512, this.chainCode.toBuffer(), data);
        const IL = I.slice(0, 32);  // Child key factor
        const IR = I.slice(32);     // Child chain code

        // Convert IL to number and validate
        const childTweak = bytesToNumberBE(IL);
        if (!secp.isValidPrivateKey(IL)) {
            return this.deriveChild(index + 1);
        }

        // Add to current private key (mod n)
        const currentKey = bytesToNumberBE(this._privateKey.getKey());
        const childKey = mod(currentKey + childTweak, secp.CURVE.n);

        // Validate the resulting private key
        const childKeyBytes = numberToBytesBE(childKey, 32);
        if (!secp.isValidPrivateKey(childKeyBytes)) {
            return this.deriveChild(index + 1);
        }

        // Create new extended private key
        return new ExtendedPrivateKey(
            new PrivateKey(childKeyBytes),
            new ChainCode(IR),
            this.depth + 1,
            this.getFingerprint(),
            index
        );
    }

    /**
     * Get the extended public key
     * @returns {ExtendedPublicKey} The extended public key
     */
    getExtendedPublicKey() {
        return new ExtendedPublicKey(
            this._privateKey.getPublicKey(),
            this.chainCode,
            this.depth,
            this.parentFingerprint,
            this.index
        );
    }

    /**
     * Get the private key
     * @returns {PrivateKey} The private key
     */
    getPrivateKey() {
        return this._privateKey;
    }

    /**
     * Get the public key
     * @returns {PublicKey} The public key
     */
    getPublicKey() {
        return this._privateKey.getPublicKey();
    }

    /**
     * Get the fingerprint
     * @returns {number} The fingerprint
     */
    getFingerprint() {
        const publicKeyBytes = this._privateKey.getPublicKey().getKey();
        const hash = hash160(publicKeyBytes);
        return (hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3];
    }

    /**
     * Get the encoded extended key
     * @returns {string} The encoded extended key
     */
    getEncodedExtendedKey() {
        return base58check.encode(this.serialize());
    }

    /**
     * Serialize the extended private key
     * @returns {Uint8Array} The serialized extended private key
     */
    serialize() {
        return super.serialize(this.versions.private, this._privateKey.getKey());
    }

    /**
     * Convert the extended private key to a base58 string
     * @returns {string} The base58 string
     */
    toBase58() {
        return this.getEncodedExtendedKey();
    }

    /**
     * Convert the extended private key to a base58 string
     * @returns {string} The base58 string
     */
    toBase58() {
        const key = new Uint8Array(33);
        key[0] = 0x00;  // Version byte for private key
        key.set(this._privateKey.getKey(), 1);
        return base58check.encode(super.serialize(this.versions.private, key));
    }

    /**
     * Convert the extended private key to a buffer
     * @returns {Uint8Array} The buffer
     */
    toBuffer() {
        return this._privateKey.getKey();
    }
}

export default ExtendedPrivateKey; 