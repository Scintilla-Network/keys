import { describe, it, expect, beforeEach } from 'vitest';
import ExtendedPrivateKey from '../ExtendedPrivateKey/ExtendedPrivateKey.js';
import Keyring from './Keyring.js';

describe('Keyring', () => {
    let extendedKey;
    let keyring;

    beforeEach(() => {
        // Test vector
        const seed = Buffer.from('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', 'hex');
        extendedKey = ExtendedPrivateKey.fromSeed(seed);
        keyring = new Keyring(extendedKey);
    });

    describe('constructor', () => {
        it('should create a Keyring instance', () => {
            expect(keyring).toBeInstanceOf(Keyring);
        });

        it('should throw error if no extended key provided', () => {
            expect(() => new Keyring()).toThrow('Extended key is required');
        });
    });

    describe('key management', () => {
        it('should get public key', () => {
            expect(keyring.getPublicKey()).toBeDefined();
            expect(keyring.getPublicKey()).toBe(keyring.publicKey);
        });

        it('should get private key', () => {
            expect(keyring.getPrivateKey()).toBeDefined();
            expect(keyring.getPrivateKey()).toBe(keyring._privateKey);
        });

        it('should get extended private key', () => {
            expect(keyring.getExtendedPrivateKey()).toBeDefined();
            expect(keyring.getExtendedPrivateKey()).toBe(extendedKey);
        });

        it('should get extended public key', () => {
            const extendedPublicKey = keyring.getExtendedPublicKey();
            expect(extendedPublicKey).toBeDefined();
        });
    });

    describe('security', () => {
        it('should secure keyring by removing private key', () => {
            expect(keyring._privateKey).toBeDefined();
            keyring.secure();
            expect(() => keyring.getPrivateKey()).toThrow('Private key is not available');
        });
    });

    describe('serialization', () => {
        it('should serialize to base58', () => {
            const base58 = keyring.toBase58();
            expect(base58).toBeDefined();
            expect(typeof base58).toBe('string');
        });
    });
});