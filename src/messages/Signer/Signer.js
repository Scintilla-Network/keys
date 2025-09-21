import { secp256k1 } from "@scintilla-network/signatures/classic";
import PrivateKey from "../../primitives/PrivateKey/PrivateKey.js";
import {AddressKeyring, PublicKey, SignableMessage} from "@scintilla-network/keys";
/**
 * Class representing a signer that can sign messages
 */
class Signer {
    static ALGORITHMS = SignableMessage.ALGORITHMS;
    static CIPHERS = SignableMessage.CIPHERS;
    /**
     * Create a signer
     * @param {PrivateKey|ExtendedPrivateKey|AddressKeyring} key - The key to sign with
     */
    constructor(key, moniker = null) {
        if (!key) {
            throw new Error('Key is required');
        }

        this.isWatchOnly = key instanceof PublicKey;

        if(this.isWatchOnly){
            Object.defineProperty(this, '_privateKey', {
                value: null,
                enumerable: false,
                writable: false,
                configurable: false
            });
            this.publicKey = key;
        } else {
            let privateKey;
            if (typeof key.getKey === 'function' && typeof key.getPublicKey === 'function') {
                privateKey = key;
            } else if (typeof key.getPrivateKey === 'function') {
                privateKey = key.getPrivateKey();
            } else if(key instanceof Uint8Array) {
                privateKey = new PrivateKey(key);
            }  else {
                throw new Error('Invalid key type');
            }

            Object.defineProperty(this, '_privateKey', {
                value: privateKey,
                enumerable: false,
                writable: false,
                configurable: false
            });
        }

        this.moniker = moniker;
    }

    /**
     * Create a signer from a public key
     * @param {PublicKey} publicKey - The public key to create the signer from
     * @param {string} moniker - The moniker of the signer
     * @returns {Signer} The signer
     */
    static fromPublicKey(publicKey, moniker = null) {
        return new Signer(new PublicKey(publicKey), moniker);
    }

    /**
     * Get the private key bytes
     * @returns {Uint8Array} Private key bytes
     */
    get privateKey() {
        if(this.isWatchOnly){
            throw new Error('Private key is not available for watch-only keys');
        }
        return this._privateKey.getKey();
    }

    /**
     * Get the public key
     * @returns {PublicKey} Public key
     */
    getPublicKey() {
        if(this.isWatchOnly){
            return this.publicKey;
        }
        return this._privateKey.getPublicKey();
    }

    /**
     * Sign a message
     * @param {SignableMessage} message - Message to sign
     * @param {string} algorithm - Algorithm to use (default: secp256k1)
     * @returns {[string, string]} Tuple of [signature, publicKey]
     */
    sign(message, algorithm = Signer.ALGORITHMS.SECP256K1) {
        if(this.isWatchOnly){
            throw new Error('Watch-only keys cannot sign messages');
        }
        if (!message || typeof message.toHex !== 'function') {
            throw new Error('Invalid message');
        }

        if (algorithm !== Signer.ALGORITHMS.SECP256K1) {
            throw new Error(`Unsupported algorithm: ${algorithm} (supported: ${Object.values(Signer.ALGORITHMS).join(', ')})`);
        }

        return message.sign(this, {algorithm});
    }

    // signMessageWithSecp256k1(message) {
    //     // If not Uint8Array, convert to Uint8Array
    //     if (!(message instanceof Uint8Array)) {
    //         throw new Error('Invalid message');
    //     }
    //     return this.sign(new SignableMessage(message), Signer.ALGORITHMS.SECP256K1);
    // }

    /**
     * Get the address from the signer
     * @returns {string} The address
     */
    toAddress() {
        if(this.isWatchOnly){
            throw new Error('Watch-only keys cannot be used to create addresses');
        }
        const keyring = new AddressKeyring(this._privateKey);
        return keyring.getAddress().toString();
    }

    /**
     * Get the moniker from the signer
     * @returns {string} The moniker
     */
    getMoniker() {
        return this.moniker;
    }

    /**
     * Verify a signature for a message
     * @param {SignableMessage} message - The message to verify
     * @param {string} signature - The signature to verify
     * @param {string} publicKey - The public key to verify against
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: secp256k1)
     * @param {string} options.format - The format to use (default: bytes)
     * @returns {boolean} Whether the signature is valid
     */
    verify(message, signature, publicKey, options) {
        if (!message || typeof message.toHex !== 'function') {
            throw new Error('Invalid message');
        }
        if(!options){
            options = {
                algorithm: Signer.ALGORITHMS.SECP256K1
            };
        }
        if(!options.algorithm){
            options.algorithm = Signer.ALGORITHMS.SECP256K1;
        }
        if (options.algorithm !== Signer.ALGORITHMS.SECP256K1) {
            throw new Error(`Unsupported algorithm: ${options.algorithm} (supported: ${Object.values(Signer.ALGORITHMS).join(', ')})`);
        }
        return message.verify(signature, publicKey, options);
    }

    /**
     * Encrypt a message
     * @param {SignableMessage} message - The message to encrypt
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: xchacha20)
     * @param {string} options.nonce - The nonce to use
     * @param {string} options.format - The format to use (default: bytes)
     * @returns {string} The encrypted message
     */
    encrypt(message, options) {
        return message.encrypt(this, options);
    }
    
    /**
     * Decrypt a message
     * @param {string} encryptedMessage - The encrypted message to decrypt
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: xchacha20)
     * @param {string} options.output - The output format to use (default: bytes)
     * @returns {string} The decrypted message
     */
    decrypt(encryptedMessage, options) {
        return new SignableMessage(new Uint8Array()).decrypt(encryptedMessage, this, options);
    }
}

export default Signer; 