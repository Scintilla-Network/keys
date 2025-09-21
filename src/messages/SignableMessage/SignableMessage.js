import { secp256k1 } from "@scintilla-network/signatures/classic";
import { xchacha20 } from "@scintilla-network/ciphers";
import uint8array from "../../utils/uint8array.js";

/**
 * Class representing a message that can be signed and verified
 */
class SignableMessage {
    /**
     * Algorithms supported by the signable message
     */
    static ALGORITHMS = {
        SECP256K1: 'secp256k1',
    }

    /**
     * Ciphers supported by the signable message
     */
    static CIPHERS = {
        XCHACHA20: 'xchacha20'
    }

    /**
     * Supported formats for the ciphers
     */
    static CIPHER_SUPPORTED_FORMATS = {
        bytes: 'bytes',
        hex: 'hex'
    };

    /**
     * Supported outputs for the ciphers
     */
    static DECIPHER_SUPPORTED_OUTPUTS = {
        bytes: 'bytes',
        hex: 'hex',
        utf8: 'utf8'
    };
    /**
     * Create a signable message
     * @param {Uint8Array} input - The message to be signed
     */
    constructor(input) {
        if(input instanceof Uint8Array === false) {
            throw new Error('Input must be a Uint8Array. Use fromHex, fromObject, or fromString to create a SignableMessage.');
        }
        this.input = input;
    }

    // if(typeof message === 'object') {
    //     // Is Buffer ? 
    //     if(message instanceof Buffer) {
    //         message = message.toString('hex')
    //     } else if(message instanceof Uint8Array) {
    //         message = uInt8ArrayToHex(message);
    //     } else {
    //         message = jsonStringify(message);
    //     }
    // }

    static fromHex(hex) {
        const array = uint8array.fromHex(hex);
        return new SignableMessage(array);
    }

    static fromObject(object) {
        const array = uint8array.fromObject(object);
        return new SignableMessage(array);
    }

    static fromString(string) {
        const array = uint8array.fromString(string);
        return new SignableMessage(array);
    }

    /**
     * Convert message to hex string
     * @returns {string} Hex string representation of message
     */
    toHex() {
        return uint8array.toHex(this.input);
    }

    toUint8Array() {
        return this.input;
    }

    /**
     * Sign the message using the provided signer
     * @param {Signer} signer - The signer to use
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use
     * @param {string} options.format - The format to use
     * @returns {[string, string]} Tuple of [signature, publicKey]
     */
    sign(signer, options) {
        let SIG_SUPPORTED_FORMATS = {
            bytes: 'bytes',
            hex: 'hex'
        };
        if(!options){
            options = {
                algorithm: SignableMessage.ALGORITHMS.SECP256K1,
                format: SIG_SUPPORTED_FORMATS.bytes
            };
        }
        if(!options.algorithm){
            options.algorithm = SignableMessage.ALGORITHMS.SECP256K1;
        }
        if(!options.format){
            options.format = SIG_SUPPORTED_FORMATS.bytes;
        }
        if (options.algorithm !== SignableMessage.ALGORITHMS.SECP256K1) {
            throw new Error(`Unsupported algorithm: ${options.algorithm} (supported: ${Object.values(SignableMessage.ALGORITHMS).join(', ')})`);
        }
        if(!Array.from(Object.values(SIG_SUPPORTED_FORMATS)).includes(options.format)){
            throw new Error(`Unsupported format: ${options.format} (supported: ${Object.values(SIG_SUPPORTED_FORMATS).join(', ')})`);
        }
            
        const privateKey = signer.privateKey;
        const publicKey = secp256k1.getPublicKey(privateKey);
        const signature = secp256k1.sign(this.input, privateKey);
        const sig = options.format === SIG_SUPPORTED_FORMATS.bytes ? signature : uint8array.toHex(signature);
        return [sig, publicKey];
    }

    /**
     * Verify a signature for this message
     * @param {string} signature - The signature to verify
     * @param {string} publicKey - The public key to verify against
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: secp256k1)
     * @returns {boolean} Whether the signature is valid
     */
    verify(signature, publicKey, options) {
        if(!options){
            options = {
                algorithm: SignableMessage.ALGORITHMS.SECP256K1
            };
        }
        if(!options.algorithm){
            options.algorithm = SignableMessage.ALGORITHMS.SECP256K1;
        }
        if (options.algorithm !== SignableMessage.ALGORITHMS.SECP256K1) {
            throw new Error(`Unsupported algorithm: ${options.algorithm} (supported: ${Object.values(SignableMessage.ALGORITHMS).join(', ')})`);
        }
        const message = this.toHex();
        // We might have the signature and public key as hex strings, so we need to convert them to Uint8Arrays
        if (typeof signature === 'string') {
            signature = Uint8Array.from(Buffer.from(signature, 'hex'));
        }
        if (typeof publicKey === 'string') {
            publicKey = Uint8Array.from(Buffer.from(publicKey, 'hex'));
        }
        return secp256k1.verify(signature, message, publicKey);
    }

    /**
     * Encrypt the message using the provided signer
     * @param {Signer} signer - The signer to use
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: xchacha20)
     * @param {string} options.nonce - The nonce to use
     * @param {string} options.format - The format to use (default: bytes)
     * @returns {string} The encrypted message
     */
    encrypt(signer, options) {
        if(!options){
            options = {
                algorithm: SignableMessage.CIPHERS.XCHACHA20,
                nonce: undefined,
                format: SignableMessage.CIPHER_SUPPORTED_FORMATS.bytes
            };
        }
        if(!options.nonce){
            options.nonce = undefined;
        }
        if(!options.algorithm){
            options.algorithm = SignableMessage.CIPHERS.XCHACHA20;
        }
        if(!options.format){
            options.format = SignableMessage.CIPHER_SUPPORTED_FORMATS.bytes;
        }
        if (options.algorithm !== SignableMessage.CIPHERS.XCHACHA20) {
            throw new Error(`Unsupported cipher: ${options.algorithm} (supported: ${Object.values(SignableMessage.CIPHERS).join(', ')})`);
        }
        if(!Array.from(Object.values(SignableMessage.CIPHER_SUPPORTED_FORMATS)).includes(options.format)){
            throw new Error(`Unsupported format: ${options.format} (supported: ${Object.values(SignableMessage.CIPHER_SUPPORTED_FORMATS).join(', ')})`);
        }
        const encrypted = xchacha20.encrypt(this.input, signer.privateKey, options.nonce);
        return options.format === SignableMessage.CIPHER_SUPPORTED_FORMATS.bytes ? encrypted : uint8array.toHex(encrypted);
    }

    /**
     * Decrypt the message using the provided signer
     * @param {string} encryptedMessage - The encrypted message to decrypt
     * @param {Signer} signer - The signer to use
     * @param {object} options - The options to use
     * @param {string} options.algorithm - The algorithm to use (default: xchacha20)
     * @param {string} options.output - The output format to use (default: bytes)
     * @returns {string} The decrypted message
     */
    decrypt(encryptedMessage, signer, options) {
        if(!options){
            options = {
                algorithm: SignableMessage.CIPHERS.XCHACHA20,
                output: SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.bytes
            };
        }   
        if(!options.output){
            options.output = SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.bytes;
        }
        if(!options.algorithm){
            options.algorithm = SignableMessage.CIPHERS.XCHACHA20;
        }
        if (options.algorithm !== SignableMessage.CIPHERS.XCHACHA20) {
            throw new Error(`Unsupported cipher: ${options.algorithm} (supported: ${Object.values(SignableMessage.CIPHERS).join(', ')})`);
        }
        if(typeof encryptedMessage === 'string'){
            encryptedMessage = uint8array.fromHex(encryptedMessage);
        }
        const decrypted = xchacha20.decrypt(encryptedMessage, signer.privateKey);
        if(options.output === SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.bytes){
            return decrypted;
        }
        if(options.output === SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.hex){
            return uint8array.toHex(decrypted);
        }
        if(options.output === SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.utf8){
            return new TextDecoder().decode(decrypted);
        }
        throw new Error(`Unsupported output format: ${options.output} (supported: ${Object.values(SignableMessage.DECIPHER_SUPPORTED_OUTPUTS).join(', ')})`);
    }
}

export default SignableMessage;