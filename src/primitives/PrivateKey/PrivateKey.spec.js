import { describe, it, expect } from '@scintilla-network/litest';
import PrivateKey from './PrivateKey.js';
import PublicKey from '../PublicKey/PublicKey.js';
import { base58check } from "@scintilla-network/hashes/utils";

describe('PrivateKey', () => {
    // Test WIF private key and its corresponding hex representation
    const validWIF = 'KwaTdVRX5qxxeKKofv4MwvWjytxVZSZd4EftYvFauyEEsCeYDAgz';
    const validPrivKeyHex = '0aac91ea7cd859b80e87e8f9214e4be880d863159b703ddd3f2ff2708c2ee5bc';
    const validPrivKey = new Uint8Array(Buffer.from(validPrivKeyHex, 'hex'));
    const validPubKeyHex = '03ae62ade894b15c2b7aa2c61ac1103ee2de672f93668ab05a2760060d7f59b397';
    const validPubKey = new Uint8Array(Buffer.from(validPubKeyHex, 'hex'));

    describe('fromWIF', () => {
        it('should create a PrivateKey from valid WIF', () => {
            const privKey = PrivateKey.fromWIF(validWIF);
            expect(privKey).toBeInstanceOf(PrivateKey);
            expect(privKey.toHexString()).toBe(validPrivKeyHex);
        });

        it('should throw error if WIF is not provided', () => {
            expect(() => PrivateKey.fromWIF()).toThrow('WIF string is required');
        });

        it('should throw error if WIF is not a string', () => {
            expect(() => PrivateKey.fromWIF(123)).toThrow('WIF string is required');
        });

        it('should throw error if WIF format is invalid', () => {
            expect(() => PrivateKey.fromWIF('invalid')).toThrow();
        });

        it('should be reversible with toWIF', () => {
            const privKey = new PrivateKey(validPrivKey);
            const wif = privKey.toWIF();
            const fromWIF = PrivateKey.fromWIF(wif);
            expect(fromWIF.toHexString()).toBe(privKey.toHexString());
        });
    });

    describe('constructor', () => {
        it('should create a PrivateKey with valid hex string', () => {
            const privKey = new PrivateKey(validPrivKeyHex);
            expect(privKey).toBeInstanceOf(PrivateKey);
            expect(privKey.toHexString()).toBe(validPrivKeyHex);
        });

        it('should create a PrivateKey with valid Uint8Array', () => {
            const privKey = new PrivateKey(validPrivKey);
            expect(privKey).toBeInstanceOf(PrivateKey);
            expect(privKey.toHexString()).toBe(validPrivKeyHex);
        });

        it('should throw error if no key provided', () => {
            expect(() => new PrivateKey()).toThrow('Key is required');
        });

        it('should throw error if key is invalid', () => {
            const invalidKey = new Uint8Array(32).fill(0); // All zeros is invalid
            expect(() => new PrivateKey(invalidKey)).toThrow('Invalid private key');
        });
    });

    describe('getKey', () => {
        it('should return the private key bytes', () => {
            const privKey = new PrivateKey(validPrivKey);
            expect(privKey.getKey()).toEqual(validPrivKey);
        });
    });

    describe('getPublicKey', () => {
        it('should derive the correct public key', () => {
            const privKey = new PrivateKey(validPrivKey);
            const pubKey = privKey.getPublicKey();
            expect(pubKey).toBeInstanceOf(PublicKey);
            // Public key should be in compressed format (33 bytes)
            expect(pubKey.getKey().length).toBe(33);
            // First byte should be 0x02 or 0x03 for compressed format
            expect([0x02, 0x03]).toContain(pubKey.getKey()[0]);
            expect(pubKey.getKey()).toEqual(validPubKey);
        });
    });

    describe('toHexString', () => {
        it('should return hex string representation', () => {
            const privKey = new PrivateKey(validPrivKey);
            expect(privKey.toHexString()).toBe(validPrivKeyHex);
        });
    });

    describe('toWIF', () => {
        it('should convert to WIF format correctly', () => {
            const privKey = new PrivateKey(validPrivKey);
            expect(privKey.toWIF()).toBe(validWIF);
        });

        it('should use custom version byte if provided', () => {
            const privKey = new PrivateKey(validPrivKey);
            const testVersion = 0xef;
            const customWIF = privKey.toWIF(testVersion);
            const decoded = base58check.decode(customWIF);
            expect(decoded[0]).toBe(testVersion);
        });
    });

    describe('toString', () => {
        it('should return PrivateKey class name', () => {
            const privKey = new PrivateKey(validPrivKey);
            expect(privKey.toString()).toBe('PrivateKey');
        });
    });
}); 