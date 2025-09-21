import { describe, it, expect } from '@scintilla-network/litest';

import ExtendedPrivateKey from './ExtendedPrivateKey.js';
import ChainCode from '../ChainCode/ChainCode.js';
import PrivateKey from '../PrivateKey/PrivateKey.js';

describe('ExtendedPrivateKey', () => {
    // Test vector from Ian Coleman's BIP39 tool
    const seedAbandon = Buffer.from('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', 'hex');
    
    const validRootPrivKeyHex = 'xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu';
    const validRootPubKeyHex = 'xpub661MyMwAqRbcFkPHucMnrGNzDwb6teAX1RbKQmqtEF8kK3Z7LZ59qafCjB9eCRLiTVG3uxBxgKvRgbubRhqSKXnGGb1aoaqLrpMBDrVxga8';
    // Test factor of account 0 for BIP44 coin 0
    const validExtendedPrivateKeyHex = 'xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb';
    const validExtendedPublicKeyHex = 'xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj';
    
    // Also for account 0 
    const validPrivateKeyHex = 'fe64af825b5b78554c33a28b23085fc082f691b3c712cc1d4e66e133297da87a';
    const validPublicKeyHex = '03774c910fcf07fa96886ea794f0d5caed9afe30b44b83f7e213bb92930e7df4bd';

    // const validPrivKeyHex = 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35';
    const validChainCodeHex = '7923408dadd3c7b56eed15567707ae5e5dca089de972e07f3b860450e2a3b70e';
    const validPubKeyHex = '03774c910fcf07fa96886ea794f0d5caed9afe30b44b83f7e213bb92930e7df4bd';
    // const validPrivKey = new PrivateKey(Buffer.from(validPrivKeyHex, 'hex'));
    const validChainCode = new ChainCode(Buffer.from(validChainCodeHex, 'hex'));

    // Key: m/44'/0'/0'/0/0
    // const expectedWIF = 'L4p2b9VAf8k5aUahF1JCJUzZkgNEAqLfq8DDdQiyAprQAKSbu8hf';

    describe('constructor', () => {
        it('should create ExtendedPrivateKey from seed', () => {
            const extKey = ExtendedPrivateKey.fromSeed(seedAbandon);
            expect(extKey.chainCode).to.deep.equal(validChainCode);
            expect(extKey.toBase58()).to.equal(validRootPrivKeyHex);
            expect(extKey.getExtendedPublicKey().toBase58()).to.equal(validRootPubKeyHex);
        });

        it('should create ExtendedPrivateKey from base58', () => {
            const extKey = ExtendedPrivateKey.fromBase58(validRootPrivKeyHex);
            expect(extKey.chainCode).to.deep.equal(validChainCode);
            expect(extKey.toBase58()).to.equal(validRootPrivKeyHex);
            expect(extKey.getExtendedPublicKey().toBase58()).to.equal(validRootPubKeyHex);
        });

        it('should construct ExtendedPrivateKey', ()=>{
            const pk = new PrivateKey(Buffer.from('1837c1be8e2995ec11cda2b066151be2cfb48adf9e47b151d46adab3a21cdf67', 'hex'));
            const extKey = new ExtendedPrivateKey(pk, validChainCode);
            expect(extKey.toBase58()).to.equal(validRootPrivKeyHex);
            expect(extKey.chainCode).to.deep.equal(validChainCode);
            expect(extKey.getExtendedPublicKey().toBase58()).to.equal(validRootPubKeyHex);
        })
        it('should throw error if private key is not PrivateKey instance', () => {
            expect(() => new ExtendedPrivateKey('invalid', validChainCode))
                .toThrow('Private key must be an instance of PrivateKey');
        });
        it('should throw error if private key is invalid', () => {
            // Create an invalid key that's larger than the curve order
            const invalidKeyBytes = Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 'hex');
            expect(() => new ExtendedPrivateKey(new PrivateKey(invalidKeyBytes), validChainCode))
                .toThrow('Invalid private key');
        });
        it('should be able to derive a child key from a seed', () => {
            const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seedAbandon);

            // The magic 0x80000000 is used to indicate that the key is hardened
            const childPrivateKey = extendedPrivateKey.deriveChild(44 + 0x80000000 + 0).deriveChild(0 + 0x80000000 + 0).deriveChild(0 + 0x80000000 + 0);
            expect(childPrivateKey).toBeDefined();
            expect(childPrivateKey.toBase58()).to.equal('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb');
        
            const childPrivateKey2 = extendedPrivateKey.derive(`m/44'/0'/0'`);
            expect(childPrivateKey2).toBeDefined();
            expect(childPrivateKey2.toBase58()).to.equal('xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb');
        });
    });
});