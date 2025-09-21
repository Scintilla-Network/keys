import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import SignableMessage from './SignableMessage.js';
import { secp256k1 } from "@scintilla-network/signatures/classic";

import uint8array from '../../utils/uint8array.js';

describe('SignableMessage', () => {
    // Test vectors
    const testMessage = 'Hello, World!';
    const testPrivateKey = new Uint8Array(Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'));
    const testPublicKey = secp256k1.getPublicKey(testPrivateKey);
    
    describe('constructor', () => {
        it('should create SignableMessage with Uint8Array message', () => {
            const bufferMessage = uint8array.fromString(testMessage);
            const message = new SignableMessage(bufferMessage);
            expect(message).toBeInstanceOf(SignableMessage);
            expect(message.input).toEqual(bufferMessage);
        });
    });

    describe('fromHex', () => {
        it('should create SignableMessage from hex', () => {
            const message = SignableMessage.fromHex(Buffer.from(testMessage, 'utf-8').toString('hex'));
            expect(message).toBeInstanceOf(SignableMessage);
            expect(message.input).toEqual(uint8array.fromString(testMessage));
            expect(message.input).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
        });
    });

    describe('fromObject', () => {
        it('should create SignableMessage from object', () => {
            const message = SignableMessage.fromObject({ message: testMessage });
            expect(message).toBeInstanceOf(SignableMessage);
            expect(message.input).toEqual(new Uint8Array([
                123,  34, 109, 101, 115, 115,  97, 103, 101,  34,  58,  34, // { "message": "
                72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33, // Hello, World!
                34, 125 // "}"
            ]));
        });
    });

    describe('fromString', () => {
        it('should create SignableMessage from string', () => {
            const message = SignableMessage.fromString(testMessage);
            expect(message).toBeInstanceOf(SignableMessage);
            expect(message.input).toEqual(uint8array.fromString(testMessage));
            expect(message.input).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
        });
    });


    describe('toHex', () => {
        it('should convert string message to hex', () => {
            const message = SignableMessage.fromString(testMessage);
            const hex = message.toHex();
            expect(hex).toBe(Buffer.from(new TextEncoder().encode(testMessage)).toString('hex'));
        });

        it('should convert uint8array message to hex', () => {
            const bufferMessage = uint8array.fromString(testMessage);
            const message = new SignableMessage(bufferMessage);
            const hex = message.toHex();
            expect(hex).toBe(uint8array.toHex(bufferMessage));
        });
    });

    describe('sign', () => {
        const mockSigner = {
            privateKey: testPrivateKey
        };

        it('should return valid signature and public key', () => {
            const message = SignableMessage.fromString(testMessage);
            const [signature, publicKey] = message.sign(mockSigner);
            expect(signature).toBeDefined();
            expect(signature instanceof Uint8Array).toBe(true);
            expect(signature.length).toBeGreaterThan(0);
            
            expect(publicKey).toBeDefined();
            expect(publicKey instanceof Uint8Array).toBe(true);
            expect(publicKey).toEqual(testPublicKey);
        });
        it('should return valid signature and public key in hex', () => {
            const message = SignableMessage.fromString(testMessage);
            const [signature, publicKey] = message.sign(mockSigner, { format: 'hex' });
            expect(signature).toBeDefined();
            expect(typeof signature).toBe('string');
            expect(signature.length).toBeGreaterThan(0);
        });

        it('should generate verifiable signature', () => {
            const message = SignableMessage.fromString(testMessage);
            const [signature, publicKey] = message.sign(mockSigner);
            
            const isValid = message.verify(signature, publicKey);
            expect(isValid).toBe(true);
        });

        it('should throw error if signer is invalid', () => {
            const message = SignableMessage.fromString(testMessage);
            expect(() => message.sign({})).toThrow();
        });
    });

    describe('verify', () => {
        let validSignature;
        let validPublicKey;
        
        beforeEach(() => {
            const message = SignableMessage.fromString(testMessage);
            const mockSigner = { privateKey: testPrivateKey };
            const [sig, pubkey] = message.sign(mockSigner);
            validSignature = sig;
            validPublicKey = pubkey;
        });

        it('should verify valid signature', () => {
            const message = SignableMessage.fromString(testMessage);
            const isValid = message.verify(validSignature, validPublicKey);
            expect(isValid).toBe(true);
        });

        it('should reject invalid signature', () => {
            const message = SignableMessage.fromString(testMessage);
            let invalidSignature = validSignature;
            // Random permute of bytes
            invalidSignature = uint8array.fromHex(uint8array.toHex(validSignature).split('').sort(() => Math.random() - 0.5).join(''));
            const isValid = message.verify(invalidSignature, validPublicKey);
            expect(isValid).toBe(false);
        });

        it('should reject invalid public key', () => {
            const message = SignableMessage.fromString(testMessage);
            let invalidPublicKey = validPublicKey;
            // Random permute of bytes
            invalidPublicKey = uint8array.fromHex(uint8array.toHex(validPublicKey).split('').sort(() => Math.random() - 0.5).join(''));
            const isValid = message.verify(validSignature, invalidPublicKey);
            expect(isValid).toBe(false);
        });

        it('should reject when verifying different message', () => {
            const differentMessage = SignableMessage.fromString('Different message');
            const isValid = differentMessage.verify(validSignature, validPublicKey);
            expect(isValid).toBe(false);
        });
    });

    // const vectorNonce = randomBytes(24);
    const nonce = uint8array.fromHex('e9ea218b38086ddd7371dd7ad178f995236d01a3896e508a');
    describe('encrypt', () => {
        it('should encrypt message', () => {
            const message = SignableMessage.fromString(testMessage);
            const encryptedMessage = message.encrypt({ privateKey: testPrivateKey }, { nonce: nonce, format: 'hex', algorithm: SignableMessage.CIPHERS.XCHACHA20 });
            expect(encryptedMessage).toBeDefined();
            const expectedResult = 'e9ea218b38086ddd7371dd7ad178f995236d01a3896e508a574bd5affeb6d26abcfa264b865f15ebce74eac68b0422a858e7c03b68';
            expect(encryptedMessage).toEqual(expectedResult);
        });
    });

    describe('decrypt', () => {
        it('should decrypt message', () => {
            const message = SignableMessage.fromString(testMessage);
            const encryptedMessage = message.encrypt({ privateKey: testPrivateKey }, { nonce: nonce, format: 'hex', algorithm: SignableMessage.CIPHERS.XCHACHA20 });
            const decryptedMessage = message.decrypt(encryptedMessage, {privateKey: testPrivateKey}, {algorithm: SignableMessage.CIPHERS.XCHACHA20});
            expect(decryptedMessage).toBeDefined();
            expect(decryptedMessage).toEqual(message.input);



            const decryptedMessageAsString = message.decrypt(encryptedMessage, {privateKey: testPrivateKey}, {algorithm: SignableMessage.CIPHERS.XCHACHA20, output: SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.utf8});
            expect(decryptedMessageAsString).toBeDefined();
            expect(decryptedMessageAsString).toEqual(testMessage);

            const decryptedMessageAsHex = message.decrypt(encryptedMessage, {privateKey: testPrivateKey}, {algorithm: SignableMessage.CIPHERS.XCHACHA20, output: SignableMessage.DECIPHER_SUPPORTED_OUTPUTS.hex});
            expect(decryptedMessageAsHex).toBeDefined();
            expect(decryptedMessageAsHex).toEqual(uint8array.toHex(message.input));
            expect(decryptedMessageAsHex).toEqual('48656c6c6f2c20576f726c6421');
        });
    });
}); 