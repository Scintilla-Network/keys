import { describe, it, expect } from '@scintilla-network/litest';
import PublicKey from './PublicKey.js';

describe('PublicKey', () => {
    // Valid test public key (compressed format)
    const validPubKeyHex = '03ae62ade894b15c2b7aa2c61ac1103ee2de672f93668ab05a2760060d7f59b397';
    const validPubKey = new Uint8Array(Buffer.from(validPubKeyHex, 'hex'));

    describe('constructor', () => {
        it('should create a PublicKey with valid compressed key', () => {
            const pubKey = new PublicKey(validPubKey);
            expect(pubKey).toBeInstanceOf(PublicKey);
            expect(pubKey.toHexString()).toBe('03ae62ade894b15c2b7aa2c61ac1103ee2de672f93668ab05a2760060d7f59b397');
            expect(pubKey.getKey()).toEqual(validPubKey);
        });
        it('should throw error if no key provided', () => {
            expect(() => new PublicKey()).toThrow('Key is required');
        });
        it('should throw error if key is not Uint8Array', () => {
            expect(() => new PublicKey('invalid')).toThrow('Public key must be a 33-byte compressed format');
        });

        it('should throw error if key length is not 33 bytes', () => {
            const invalidKey = new Uint8Array(32);
            expect(() => new PublicKey(invalidKey)).toThrow('Public key must be a 33-byte compressed format');
        });

        it('should throw error if key prefix is invalid', () => {
            const invalidPrefixKey = new Uint8Array(33);
            invalidPrefixKey[0] = 0x04; // Invalid prefix
            expect(() => new PublicKey(invalidPrefixKey)).toThrow('Public key must be in compressed format (0x02 or 0x03)');
        });

        it('should throw error if point is invalid', () => {
            const invalidPointKey = new Uint8Array(33);
            invalidPointKey[0] = 0x02; // Valid prefix but invalid point
            expect(() => new PublicKey(invalidPointKey)).toThrow('Invalid public key: not a valid curve point');
        });
    });
    
    describe('getKey', () => {
        it('should return the public key bytes', () => {
            const pubKey = new PublicKey(validPubKey);
            expect(pubKey.getKey()).to.deep.equal(validPubKey);
        });
    });

    describe('toHexString', () => {
        it('should return hex string representation', () => {
            const pubKey = new PublicKey(validPubKey);
            expect(pubKey.toHexString()).to.equal(validPubKeyHex.toLowerCase());
        });
    });

    describe('toString', () => {
        it('should return same as toHexString', () => {
            const pubKey = new PublicKey(validPubKey);
            expect(pubKey.toString()).to.equal(pubKey.toHexString());
        });
    });
});
