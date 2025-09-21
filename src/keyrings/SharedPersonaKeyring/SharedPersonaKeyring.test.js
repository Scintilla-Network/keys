import { describe, it, expect, beforeEach } from 'vitest';
import SharedPersonaKeyring from './SharedPersonaKeyring.js';
import AddressKeyring from '../AddressKeyring/AddressKeyring.js';
import ExtendedPrivateKey from '../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js';

describe('SharedPersonaKeyring', () => {
    // Test vectors
    const seed = Buffer.from('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', 'hex');
    const moniker1 = 'alice';
    const moniker2 = 'bob';
    let extendedPrivateKey;

    beforeEach(() => {
        extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
    });

    describe('constructor', () => {
        it('should create SharedPersonaKeyring with valid parameters', () => {
            const keyring = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
            expect(keyring).toBeInstanceOf(SharedPersonaKeyring);
            expect(keyring.getPublicKey()).toBeDefined();
            expect(keyring.getPrivateKey()).toBeDefined();
        });

        it('should throw error if no extended key provided', () => {
            expect(() => new SharedPersonaKeyring(null, moniker1, moniker2))
                .toThrow('Extended key is required');
        });

        it('should throw error if monikers are not provided', () => {
            expect(() => new SharedPersonaKeyring(extendedPrivateKey))
                .toThrow('Monikers are required');
            expect(() => new SharedPersonaKeyring(extendedPrivateKey, moniker1))
                .toThrow('Monikers are required');
        });

        it('should throw error if moniker is invalid', () => {
            expect(() => new SharedPersonaKeyring(extendedPrivateKey, '', moniker2))
                .toThrow('Monikers are required');
            expect(() => new SharedPersonaKeyring(extendedPrivateKey, moniker1, ''))
                .toThrow('Monikers are required');
        });

        it('should derive same key regardless of moniker order', () => {
            const keyring1 = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
            const keyring2 = new SharedPersonaKeyring(extendedPrivateKey, moniker2, moniker1);
            expect(keyring1.getPublicKey().toString()).toBe(keyring2.getPublicKey().toString());
        });
    });

    describe('getPersonaTypedKey', () => {
        let keyring;

        beforeEach(() => {
            keyring = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
        });

        it('should derive default type key', () => {
            const typedKey = keyring.getPersonaTypedKey();
            expect(typedKey).toBeDefined();
        });

        it('should derive proposer type key', () => {
            const typedKey = keyring.getPersonaTypedKey('proposer');
            expect(typedKey).toBeDefined();
        });

        it('should derive voter type key', () => {
            const typedKey = keyring.getPersonaTypedKey('voter');
            expect(typedKey).toBeDefined();
        });

        it('should derive stake type key', () => {
            const typedKey = keyring.getPersonaTypedKey('stake');
            expect(typedKey).toBeDefined();
        });

        it('should derive operator type key', () => {
            const typedKey = keyring.getPersonaTypedKey('operator');
            expect(typedKey).toBeDefined();
        });

        it('should throw error for invalid type', () => {
            expect(() => keyring.getPersonaTypedKey('invalid'))
                .toThrow('Invalid persona type');
        });

        it('should derive different keys for different types', () => {
            const defaultKey = keyring.getPersonaTypedKey('default');
            const proposerKey = keyring.getPersonaTypedKey('proposer');
            const voterKey = keyring.getPersonaTypedKey('voter');

            expect(defaultKey.getPublicKey().toString())
                .not.toBe(proposerKey.getPublicKey().toString());
            expect(proposerKey.getPublicKey().toString())
                .not.toBe(voterKey.getPublicKey().toString());
        });
    });

    describe('getAddressKeyring', () => {
        let keyring;

        beforeEach(() => {
            keyring = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
        });

        it('should create AddressKeyring with default options', () => {
            const addressKeyring = keyring.getAddressKeyring();
            expect(addressKeyring).toBeInstanceOf(AddressKeyring);
        });

        it('should create different AddressKeyrings for different indices', () => {
            const addressKeyring1 = keyring.getAddressKeyring(0);
            const addressKeyring2 = keyring.getAddressKeyring(1);
            expect(addressKeyring1.getPublicKey().toString())
                .not.toBe(addressKeyring2.getPublicKey().toString());
        });

        it('should handle change path correctly', () => {
            const normalAddress = keyring.getAddressKeyring(0, { change: 0 });
            const changeAddress = keyring.getAddressKeyring(0, { change: 1 });
            expect(normalAddress.getPublicKey().toString())
                .not.toBe(changeAddress.getPublicKey().toString());
        });

        it('should work after securing the keyring', () => {
            keyring.secure();
            const addressKeyring = keyring.getAddressKeyring(0);
            expect(addressKeyring).toBeInstanceOf(AddressKeyring);
            expect(addressKeyring.getPublicKey()).toBeDefined();
            expect(() => addressKeyring.getPrivateKey())
                .toThrow('Private key is not available');
        });
    });

    describe('key management', () => {
        let keyring;

        beforeEach(() => {
            keyring = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
        });

        it('should get public key', () => {
            expect(keyring.getPublicKey()).toBeDefined();
        });

        it('should get private key', () => {
            expect(keyring.getPrivateKey()).toBeDefined();
        });

        it('should throw error when getting private key after securing', () => {
            keyring.secure();
            expect(() => keyring.getPrivateKey())
                .toThrow('Private key is not available');
        });
    });

    describe('static methods', () => {
        it('should create watch-only keyring from extended public key', () => {
            const fullKeyring = new SharedPersonaKeyring(extendedPrivateKey, moniker1, moniker2);
            const extendedPublicKey = fullKeyring.getExtendedPublicKey();
            
            const watchOnlyKeyring = SharedPersonaKeyring.fromExtendedPublicKey(
                extendedPublicKey,
                moniker1,
                moniker2
            );

            expect(watchOnlyKeyring).toBeInstanceOf(SharedPersonaKeyring);
            expect(watchOnlyKeyring.getPublicKey().toString())
                .toBe(fullKeyring.getPublicKey().toString());
            expect(() => watchOnlyKeyring.getPrivateKey())
                .toThrow('Private key is not available');
        });
    });
}); 