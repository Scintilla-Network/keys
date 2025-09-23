import { describe, it, expect } from '@scintilla-network/litest';
import AccountKeyring from './AccountKeyring.js';
import ExtendedPrivateKey from '../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js';

describe('AccountKeyring', () => {
    // Test vectors (abandon key)
    const accountExtendedPrivateKey = 'xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb';
    let extendedPrivateKey;
    
    describe('constructor', () => {
        it('should create AccountKeyring with valid seed', () => {
            // const keyring = new AccountKeyring(ExtendedPrivateKey.fromBase58(accountExtendedPrivateKey));
            // expect(keyring).toBeInstanceOf(AccountKeyring);
            // expect(keyring.getPublicKey()).toBeDefined();
            // expect(keyring.getPrivateKey()).toBeDefined();

            // expect(keyring.toBase58()).toBe('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb');

            // const extPubKey = keyring.getExtendedPublicKey();
            // console.log(extPubKey.serialize());
            // expect(extPubKey.serialize()).toBe('xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj');
            // console.log(extPubKey.getEncodedExtendedKey());

        //     const extPrivKey = keyring.getExtendedPrivateKey();
        //     console.log(extPrivKey.serialize());
        //     console.log(extPrivKey.getEncodedExtendedKey());
        //     console.log(extPrivKey.toWIF());
        });

        // it('should store public key correctly', () => {
        //     const keyring = new AccountKeyring(extendedPrivateKey);
        //     const publicKey = keyring.getPublicKey();
        //     expect(publicKey).toEqual(extendedPrivateKey.getPrivateKey().getPublicKey());
        // });

        // it('should store private key securely', () => {
        //     const keyring = new AccountKeyring(extendedPrivateKey);
        //     const props = Object.keys(keyring);
        //     keyring.secure();
        //     expect(props).not.toContain('_extendedKey');
        //     expect(props).not.toContain('_privateKey');
        // });
    });

    // describe('getPublicKey', () => {
    //     it('should return the correct public key', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const publicKey = keyring.getPublicKey();
    //         expect(publicKey).toEqual(extendedPrivateKey.getPrivateKey().getPublicKey());
    //     });

    //     it('should return public key even after securing', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const publicKeyBefore = keyring.getPublicKey();
    //         keyring.secure();
    //         const publicKeyAfter = keyring.getPublicKey();
    //         expect(publicKeyAfter).toEqual(publicKeyBefore);
    //     });
    // });

    // describe('getPrivateKey', () => {
    //     it('should return the correct private key', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const privateKey = keyring.getPrivateKey();
    //         expect(privateKey).toEqual(extendedPrivateKey.getPrivateKey());
    //     });

    //     it('should throw error after securing', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         keyring.secure();
    //         expect(() => keyring.getPrivateKey()).toThrow('Private key is not available');
    //     });
    // });

    // describe('getAddressKeyring', () => {
    //     it('should derive correct address keyring for index', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const addressKeyring = keyring.getAddressKeyring(0);
    //         expect(addressKeyring).toBeInstanceOf(AddressKeyring);
    //     });

    //     it('should derive different address keyrings for different indices', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const addressKeyring1 = keyring.getAddressKeyring(0);
    //         const addressKeyring2 = keyring.getAddressKeyring(1);
    //         expect(addressKeyring1.getPublicKey().toString())
    //             .not.toBe(addressKeyring2.getPublicKey().toString());
    //     });

    //     it('should handle change path correctly', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const normalAddress = keyring.getAddressKeyring(0, { change: 0 });
    //         const changeAddress = keyring.getAddressKeyring(0, { change: 1 });
    //         expect(normalAddress.getPublicKey().toString())
    //             .not.toBe(changeAddress.getPublicKey().toString());
    //     });

    //     it('should work after securing the keyring', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         keyring.secure();
    //         const addressKeyring = keyring.getAddressKeyring(0);
    //         expect(addressKeyring).toBeInstanceOf(AddressKeyring);
    //     });
    // });

    // describe('secure', () => {
    //     it('should remove private key', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         expect(keyring.getPrivateKey()).toBeDefined();
    //         keyring.secure();
    //         expect(() => keyring.getPrivateKey()).toThrow();
    //     });

    //     it('should maintain public key access', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const publicKey = keyring.getPublicKey();
    //         keyring.secure();
    //         expect(keyring.getPublicKey()).toEqual(publicKey);
    //     });

    //     it('should return this for chaining', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         expect(keyring.secure()).toBe(keyring);
    //     });

    //     it('should not affect address keyring derivation', () => {
    //         const keyring = new AccountKeyring(extendedPrivateKey);
    //         const addressBefore = keyring.getAddressKeyring(0);
    //         keyring.secure();
    //         const addressAfter = keyring.getAddressKeyring(0);
    //         expect(addressAfter.getPublicKey().toString())
    //             .toBe(addressBefore.getPublicKey().toString());
    //     });
    // });
}); 