import { describe, it, expect } from '@scintilla-network/litest';
import Signer from './Signer.js';
import SignableMessage from '../SignableMessage/SignableMessage.js';
import PrivateKey from '../../primitives/PrivateKey/PrivateKey.js';
import ExtendedPrivateKey from '../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js';
import { secp256k1 } from "@scintilla-network/signatures/classic";

import hex from '../../utils/hex.js';
import uint8array from '../../utils/uint8array.js';

describe('Signer', () => {
    // Test vectors
    const testPrivKeyHex = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const testMessage = 'Hello, World!';
    let privateKey = uint8array.fromHex(testPrivKeyHex);
    let privateKeyInstance = new PrivateKey(privateKey);
    
    describe('constructor', () => {
        it('should create Signer with PrivateKey', () => {
            const signer = new Signer(privateKeyInstance);
            expect(signer).toBeInstanceOf(Signer);
            expect(signer.privateKey).toEqual(privateKeyInstance.getKey());
        });

        it('should create Signer with ExtendedPrivateKey', () => {
            const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
            const extendedKey = ExtendedPrivateKey.fromSeed(seed);
            const signer = new Signer(extendedKey);
            expect(signer).toBeInstanceOf(Signer);
            expect(signer.privateKey).toEqual(extendedKey.getPrivateKey().getKey());
        });

        it('should throw error if no key provided', () => {
            expect(() => new Signer()).toThrow('Key is required');
        });

        it('should throw error for invalid key type', () => {
            expect(() => new Signer('invalid')).toThrow('Invalid key type');
        });
    });

    describe('getPublicKey', () => {
        it('should return correct public key', () => {
            const signer = new Signer(privateKeyInstance);
            const publicKey = signer.getPublicKey();
            expect(publicKey.toString()).toBe(Buffer.from(secp256k1.getPublicKey(privateKeyInstance.getKey())).toString('hex'));
        });
    });

    describe('sign', () => {
        it('should sign message and return valid signature', () => {
            const signer = new Signer(privateKey);
            const message = SignableMessage.fromString(testMessage);
            const [signature, publicKey] = signer.sign(message);

            expect(signature).toBeDefined();
            // expect(signature instanceof Uint8Array).toBe(true);
            expect(signature.length).toBeGreaterThan(0);

            expect(publicKey).toBeDefined();
            // expect(publicKey instanceof Uint8Array).toBe(true);
            // expect(Buffer.from(publicKey).toString('hex')).toBe(signer.getPublicKey().toString());

            // Verify the signature
            const isValid = message.verify(
                Buffer.from(signature, 'hex'),
                Buffer.from(publicKey, 'hex')
            );
            expect(isValid).toBe(true);
        });

        it('should throw error for invalid message', () => {
            const signer = new Signer(privateKey);
            expect(() => signer.sign('invalid')).toThrow('Invalid message');
            expect(() => signer.sign(null)).toThrow('Invalid message');
            expect(() => signer.sign({})).toThrow('Invalid message');
        });
    });

    describe('toAddress', () => {
        it('should return correct address', () => {
            const signer = new Signer(privateKey);
            const address = signer.toAddress();
            expect(address).toBeDefined();
        });
    });

    describe('encrypt', () => {
        it('should encrypt message', () => {
            const signer = new Signer(privateKey);
            const message = SignableMessage.fromString(testMessage);
            const encryptedMessage = signer.encrypt(message, {algorithm: SignableMessage.CIPHERS.XCHACHA20, nonce: Uint8Array.from(Buffer.from('e9ea218b38086ddd7371dd7ad178f995236d01a3896e508a', 'hex')), format: SignableMessage.CIPHER_SUPPORTED_FORMATS.hex});
            console.log(encryptedMessage);
            expect(encryptedMessage).toBeDefined();
            expect(encryptedMessage).toEqual('e9ea218b38086ddd7371dd7ad178f995236d01a3896e508a574bd5affeb6d26abcfa264b865f15ebce74eac68b0422a858e7c03b68')
        });
    });

    describe('decrypt', () => {
        it('should decrypt message', () => {
            const signer = new Signer(privateKey);
            const message = SignableMessage.fromString(testMessage);
            const encryptedMessage = signer.encrypt(message, {algorithm: SignableMessage.CIPHERS.XCHACHA20, nonce: Uint8Array.from(Buffer.from('e9ea218b38086ddd7371dd7ad178f995236d01a3896e508a', 'hex'))});
            const decryptedMessage = signer.decrypt(encryptedMessage, {
                algorithm: SignableMessage.CIPHERS.XCHACHA20, 
                output: SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.utf8
            });
            expect(decryptedMessage).toBeDefined();
            expect(decryptedMessage).toEqual(testMessage);
        });
    });
}); 