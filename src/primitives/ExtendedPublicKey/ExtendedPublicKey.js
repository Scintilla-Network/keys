import { hmac, base58check, hash160 } from "@scintilla-network/hashes/utils";
import { secp256k1 as secp } from "@scintilla-network/signatures/classic";
import { sha512 } from "@scintilla-network/hashes/classic";

import ChainCode from "../ChainCode/ChainCode.js";
import PublicKey from "../PublicKey/PublicKey.js";
import ExtendedKey from "../ExtendedKey/ExtendedKey.js";
import utf8 from "../../utils/utf8.js";

class ExtendedPublicKey extends ExtendedKey {
    /**
     * Create an ExtendedPublicKey from an ExtendedPrivateKey
     * @param {ExtendedPrivateKey} extendedPrivateKey - The ExtendedPrivateKey to create the ExtendedPublicKey from
     * @returns {ExtendedPublicKey} The ExtendedPublicKey
     */
    static fromExtendedPrivateKey(extendedPrivateKey) {
        const publicKey = new PublicKey(
            secp.getPublicKey(extendedPrivateKey.getPrivateKey().getKey(), true)
        );
        return new ExtendedPublicKey(
            publicKey,
            extendedPrivateKey.chainCode,
            extendedPrivateKey.depth,
            extendedPrivateKey.parentFingerprint,
            extendedPrivateKey.index
        );
    }

    /**
     * Create an ExtendedPublicKey from a public key, chain code, depth, parent fingerprint, and index
     * @param {PublicKey} publicKey - The public key to create the ExtendedPublicKey from
     * @param {ChainCode} chainCode - The chain code to create the ExtendedPublicKey from
     * @param {number} depth - The depth of the ExtendedPublicKey
     * @param {number} parentFingerprint - The parent fingerprint of the ExtendedPublicKey
     * @param {number} index - The index of the ExtendedPublicKey
     */
    constructor(publicKey, chainCode, depth = 0, parentFingerprint = 0, index = 0) {
        super(chainCode, depth, parentFingerprint, index);

        if (!(publicKey instanceof PublicKey)) {
            throw new Error('Public key must be an instance of PublicKey');
        }

        Object.defineProperty(this, '_publicKey', {
            value: publicKey,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * Derive an ExtendedPublicKey from a path
     * @param {string} path - The path to derive the ExtendedPublicKey from
     * @returns {ExtendedPublicKey} The derived ExtendedPublicKey
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
                const m1 = m && m[1];
                if (!m || m.length !== 3 || typeof m1 !== 'string') {
                    throw new Error('Invalid path segment: ' + part);
                }

                let index = parseInt(m1);
                if (!Number.isSafeInteger(index) || index >= 0x80000000) {
                    throw new Error('Invalid index');
                }

                if (m[2] === "'") {
                    throw new Error('Cannot derive hardened child keys from public key');
                }
                key = key.deriveChild(index);
            }
            return key;
        } else {
            return this.deriveChild(path);
        }
    }

    /**
     * Derive a child ExtendedPublicKey from an index
     * @param {number} index - The index to derive the child ExtendedPublicKey from
     * @returns {ExtendedPublicKey} The derived child ExtendedPublicKey
     */
    deriveChild(index) {
        if (!this._publicKey || !this.chainCode) {
            throw new Error('No publicKey or chainCode set');
        }

        if (index >= 0x80000000) {
            throw new Error('Cannot derive hardened child keys from public key');
        }

        // Normal child: serP(point(kpar)) || ser32(index)
        const data = new Uint8Array([
            ...this._publicKey.getKey(),
            (index >>> 24) & 0xff,
            (index >>> 16) & 0xff,
            (index >>> 8) & 0xff,
            index & 0xff
        ]);
        
        const I = hmac(sha512, this.chainCode.toBuffer(), data);
        const IL = I.slice(0, 32);  // Child key factor
        const IR = I.slice(32);     // Child chain code

        // Validate IL as a private key
        if (!secp.isValidPrivateKey(IL)) {
            return this.deriveChild(index + 1);
        }

        try {
            // Convert IL to a point and add to current public key
            // const ILPoint = secp.ProjectivePoint.fromPrivateKey(IL);
            // const currentPoint = secp.ProjectivePoint.fromHex(this._publicKey.getKey());
            const ILPoint = secp.Point.fromBytes(secp.getPublicKey(IL, true));
            const currentPoint = secp.Point.fromBytes(this._publicKey.getKey());
            const childPoint = currentPoint.add(ILPoint);
            
            // Check for point at infinity
            if (childPoint.equals(secp.Point.ZERO)) {
                return this.deriveChild(index + 1);
            }

            // Convert to compressed public key bytes
            const childPublicKeyBytes = childPoint.toBytes(true);

            // Verify the public key format
            if (childPublicKeyBytes[0] !== 0x02 && childPublicKeyBytes[0] !== 0x03) {
                return this.deriveChild(index + 1);
            }

            return new ExtendedPublicKey(
                new PublicKey(childPublicKeyBytes),
                new ChainCode(IR),
                this.depth + 1,
                this.getFingerprint(),
                index
            );
        } catch (error) {
            // FIXME: THis or throw error ? Why index + 1 again ? 
            return this.deriveChild(index + 1);
            // throw error;
        }
    }

    /**
     * Get the public key
     * @returns {PublicKey} The public key
     */
    getPublicKey() {
        return this._publicKey;
    }

    /**
     * Get the extended key
     * @returns {Uint8Array} The extended key
     */
    getExtendedKey() {
        return this.serialize();
    }

    /**
     * Get the fingerprint
     * @returns {number} The fingerprint
     */
    getFingerprint() {
        const publicKeyBytes = this._publicKey.getKey();
        const hash = hash160(publicKeyBytes);
        const view = new DataView(new ArrayBuffer(4));
        view.setUint8(0, hash[0]);
        view.setUint8(1, hash[1]);
        view.setUint8(2, hash[2]);
        view.setUint8(3, hash[3]);
        return view.getUint32(0);
    }

    /**
     * Get the encoded extended key
     * @returns {string} The encoded extended key
     */
    getEncodedExtendedKey() {
        return base58check.encode(this.serialize());
        // return base58check.encode(utf8.toUint8Array(this.serialize()));
    }

    /**
     * Serialize the extended public key
     * @returns {string} The serialized extended public key
     */
    serialize() {
        return this.toBase58();
    }

    /**
     * Convert the extended public key to a string
     * @returns {string} The string
     */
    toString(){
        return this.getEncodedExtendedKey();
    }

    /**
     * Convert the extended public key to a base58 string
     * @returns {string} The base58 string
     */
    toBase58() {
        return base58check.encode(super.serialize(this.versions.public, this._publicKey.getKey()));
    }
}

export default ExtendedPublicKey; 