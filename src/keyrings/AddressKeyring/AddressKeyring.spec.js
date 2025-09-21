import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import AddressKeyring from './AddressKeyring.js';
import PrivateKey from '../../primitives/PrivateKey/PrivateKey.js';
import PublicKey from '../../primitives/PublicKey/PublicKey.js';

describe('AddressKeyring', () => {
    // Test vectors
    const validPrivKeyHex = 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35';
    const validPrivKey = new PrivateKey(validPrivKeyHex);

    describe('constructor', () => {
        it('should create AddressKeyring with valid private key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            expect(keyring).toBeInstanceOf(AddressKeyring);
            expect(keyring.getPublicKey()).toBeDefined();
            expect(keyring.getPrivateKey()).toBeDefined();
        });

        it('should store public key correctly', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const publicKey = keyring.getPublicKey();
            expect(publicKey).toEqual(validPrivKey.getPublicKey());
        });

        it('should store private key securely', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const props = Object.keys(keyring);
            expect(props).not.toContain('_privateKey');
        });

        it('should accept options parameter', () => {
            const options = { change: 1 };
            const keyring = new AddressKeyring(validPrivKey, options);
            expect(keyring).toBeInstanceOf(AddressKeyring);
        });
    });

    describe('getPublicKey', () => {
        it('should return the correct public key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const publicKey = keyring.getPublicKey();
            expect(publicKey).toEqual(validPrivKey.getPublicKey());
        });

        it('should return PublicKey instance', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const publicKey = keyring.getPublicKey();
            expect(publicKey).toBeInstanceOf(PublicKey);
        });

        it('should return consistent public key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const publicKey1 = keyring.getPublicKey();
            const publicKey2 = keyring.getPublicKey();
            expect(publicKey1).toEqual(publicKey2);
        });
    });

    describe('getPrivateKey', () => {
        it('should return the correct private key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const privateKey = keyring.getPrivateKey();
            expect(privateKey).toBe(validPrivKey);
        });

        it('should return PrivateKey instance', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const privateKey = keyring.getPrivateKey();
            expect(privateKey).toBeInstanceOf(PrivateKey);
        });

        it('should return consistent private key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const privateKey1 = keyring.getPrivateKey();
            const privateKey2 = keyring.getPrivateKey();
            expect(privateKey1).toBe(privateKey2);
        });
    });

    describe('immutability', () => {
        it('should not allow modifying private key', () => {
            const keyring = new AddressKeyring(validPrivKey);
            expect(() => {
                keyring._privateKey = new PrivateKey(validPrivKeyHex);
            }).toThrow();
        });

        it('should not expose private key through enumeration', () => {
            const keyring = new AddressKeyring(validPrivKey);
            const props = Object.keys(keyring);
            expect(props).not.toContain('_privateKey');
        });
    });
}); 