import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import PersonaKeyring from './PersonaKeyring.js';
import AddressKeyring from '../AddressKeyring/AddressKeyring.js';
import ExtendedPrivateKey from '../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js';

describe('PersonaKeyring', () => {
    // Test vectors
    const seed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
    let extendedPrivateKey;
    
    beforeEach(() => {
        extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
    });

    describe('constructor', () => {
        it('should create PersonaKeyring with valid extended private key and moniker', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            expect(keyring).toBeInstanceOf(PersonaKeyring);
            expect(keyring.getPublicKey()).toBeDefined();
            expect(keyring.getPrivateKey()).toBeDefined();
            expect(keyring.getMoniker()).toBe('sct.alice');
        });

        it('should throw error when moniker is missing', () => {
            expect(() => new PersonaKeyring(extendedPrivateKey)).toThrow('Moniker is required');
        });

        it('should throw error when extended key is missing', () => {
            expect(() => new PersonaKeyring(null, 'sct.alice')).toThrow('Extended key is required');
        });

        it('should throw error for empty moniker', () => {
            expect(() => new PersonaKeyring(extendedPrivateKey, '')).toThrow('Moniker is required');
        });

        it('should handle very long moniker', () => {
            // This is non-standard within the protocol.
            const longMoniker = 'x'.repeat(1024);
            const keyring = new PersonaKeyring(extendedPrivateKey, longMoniker);
            expect(keyring).toBeInstanceOf(PersonaKeyring);
        });

        it('should handle unicode characters in moniker', () => {
            const unicodeMoniker = 'sct.αλιςε';
            const keyring = new PersonaKeyring(extendedPrivateKey, unicodeMoniker);
            expect(keyring).toBeInstanceOf(PersonaKeyring);
        });

        it('should handle emoji in moniker', () => {
            const emojiMoniker = 'sct.alice🚀';
            const keyring = new PersonaKeyring(extendedPrivateKey, emojiMoniker);
            expect(keyring).toBeInstanceOf(PersonaKeyring);
        });

        it('should handle special characters in moniker', () => {
            const specialMoniker = 'sct.alice!@#$%^&*()';
            const keyring = new PersonaKeyring(extendedPrivateKey, specialMoniker);
            expect(keyring).toBeInstanceOf(PersonaKeyring);
        });
    });

    describe('moniker derivation', () => {
        it('should derive consistent paths for same moniker', () => {
            const moniker = 'sct.alice';
            const keyring1 = new PersonaKeyring(extendedPrivateKey, moniker);
            const keyring2 = new PersonaKeyring(extendedPrivateKey, moniker);
            expect(keyring1.getPublicKey().toString()).toBe(keyring2.getPublicKey().toString());
        });

        it('should derive different paths for different monikers', () => {
            const keyring1 = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const keyring2 = new PersonaKeyring(extendedPrivateKey, 'sct.bob');
            expect(keyring1.getPublicKey().toString()).not.toBe(keyring2.getPublicKey().toString());
        });

        it('should be case sensitive', () => {
            const keyring1 = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const keyring2 = new PersonaKeyring(extendedPrivateKey, 'SCT.ALICE');
            expect(keyring1.getPublicKey().toString()).not.toBe(keyring2.getPublicKey().toString());
        });
    });

    describe('persona types', () => {
        let keyring;
        beforeEach(() => {
            keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
        });

        it('should derive different keys for different persona types', () => {
            const types = ['default', 'proposer', 'voter', 'stake', 'operator', 'owner', 'spender'];
            const keys = types.map(type => keyring.getPersonaTypedKey(type).getExtendedPublicKey().toBase58());
            
            // Check that all keys are different
            const uniqueKeys = new Set(keys);
            const expectedUniqueTypes = 5; // Owner, spender and default are the same
            expect(uniqueKeys.size).toBe(expectedUniqueTypes);
        });

        it('should throw error for invalid persona type', () => {
            expect(() => keyring.getPersonaTypedKey('invalid')).toThrow('Invalid persona type');
        });
    });

    describe('getPublicKey', () => {
        it('should return the correct public key', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const publicKey = keyring.getPublicKey();
            expect(publicKey).toEqual(extendedPrivateKey.getPrivateKey().getPublicKey());
        });

        it('should return public key even after securing', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const publicKeyBefore = keyring.getPublicKey();
            keyring.secure();
            const publicKeyAfter = keyring.getPublicKey();
            expect(publicKeyAfter).toEqual(publicKeyBefore);
        });
    });

    describe('getPrivateKey', () => {
        it('should return the correct private key', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const privateKey = keyring.getPrivateKey();
            expect(privateKey).toEqual(extendedPrivateKey.getPrivateKey());
        });

        it('should throw error after securing', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            keyring.secure();
            expect(() => keyring.getPrivateKey()).toThrow('Private key is not available');
        });
    });

    describe('getAddressKeyring', () => {
        it('should derive correct address keyring for index', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const addressKeyring = keyring.getAddressKeyring(0);
            expect(addressKeyring).toBeInstanceOf(AddressKeyring);
        });

        it('should derive different address keyrings for different indices', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const addressKeyring1 = keyring.getAddressKeyring(0);
            const addressKeyring2 = keyring.getAddressKeyring(1);
            expect(addressKeyring1.getPublicKey().toString())
                .not.toBe(addressKeyring2.getPublicKey().toString());
        });

        it('should handle change path correctly', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const normalAddress = keyring.getAddressKeyring(0, { change: 0 });
            const changeAddress = keyring.getAddressKeyring(0, { change: 1 });
            expect(normalAddress.getPublicKey().toString())
                .not.toBe(changeAddress.getPublicKey().toString());
        });

        it('should work after securing the keyring', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            keyring.secure();
            const addressKeyring = keyring.getAddressKeyring(0);
            expect(addressKeyring).toBeInstanceOf(AddressKeyring);
        });

        it('should derive consistent addresses', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const address1 = keyring.getAddressKeyring(0);
            const address2 = keyring.getAddressKeyring(0);
            expect(address1.getPublicKey().toString())
                .toBe(address2.getPublicKey().toString());
        });
    });

    describe('secure', () => {
        it('should remove private key', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            expect(keyring.getPrivateKey()).toBeDefined();
            keyring.secure();
            expect(() => keyring.getPrivateKey()).toThrow();
        });

        it('should maintain public key access', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const publicKey = keyring.getPublicKey();
            keyring.secure();
            expect(keyring.getPublicKey()).toEqual(publicKey);
        });

        it('should return this for chaining', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            expect(keyring.secure()).toBe(keyring);
        });

        it('should not affect address keyring derivation', () => {
            const keyring = new PersonaKeyring(extendedPrivateKey, 'sct.alice');
            const addressBefore = keyring.getAddressKeyring(0);
            keyring.secure();
            const addressAfter = keyring.getAddressKeyring(0);
            expect(addressAfter.getPublicKey().toString())
                .toBe(addressBefore.getPublicKey().toString());
        });
    });
}); 