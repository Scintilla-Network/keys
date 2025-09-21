import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import ExtendedPublicKey from './ExtendedPublicKey.js';
import ExtendedPrivateKey from '../ExtendedPrivateKey/ExtendedPrivateKey.js';
import PublicKey from '../PublicKey/PublicKey.js';
import ChainCode from '../ChainCode/ChainCode.js';

describe('ExtendedPublicKey', () => {
    // Test vector from Ian Coleman's BIP39 tool
    // Seed: hour eyebrow close wasp build win drink cloth never any replace shrimp bicycle goose train soda process video emerge taxi tennis pull ozone improve
    const seed = Buffer.from('a622f513c38ed2c2c6a98711582dc3064815897273c42ffe96d24774cb5d4b276e5e9316dfe3bc4a886ade2db0393df3c70da42ec58574e71fe973eb7cac95ba', 'hex');
    const validPubKeyHex = '02158ac3b1e354957f78f29f5832d953573ca0e0a4f874b571471ab76c32464446';
    const validChainCodeHex = '873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508';
    const validPubKey = new PublicKey(Buffer.from(validPubKeyHex, 'hex'));
    const validChainCode = new ChainCode(Buffer.from(validChainCodeHex, 'hex'));

    describe('constructor', () => {
        it('should create ExtendedPublicKey with valid parameters', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode);
            expect(extKey).toBeInstanceOf(ExtendedPublicKey);
            expect(extKey.getPublicKey()).toBe(validPubKey);
            expect(extKey.chainCode).toBe(validChainCode);
        });

        it('should create ExtendedPublicKey with custom parameters', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode, 1, 0x12345678, 5);
            expect(extKey.depth).toBe(1);
            expect(extKey.parentFingerprint).toBe(0x12345678);
            expect(extKey.index).toBe(5);
        });

        it('should throw error if public key is not PublicKey instance', () => {
            expect(() => new ExtendedPublicKey('invalid', validChainCode))
                .toThrow('Public key must be an instance of PublicKey');
        });
    });

    describe('fromExtendedPrivateKey', () => {
        it('should create corresponding extended public key', () => {
            const master = ExtendedPrivateKey.fromSeed(seed);
            const extPubKey = ExtendedPublicKey.fromExtendedPrivateKey(master);
            expect(extPubKey).toBeInstanceOf(ExtendedPublicKey);
            expect(extPubKey.depth).toBe(master.depth);
            expect(extPubKey.parentFingerprint).toBe(master.parentFingerprint);
            expect(extPubKey.index).toBe(master.index);
        });
    });

    describe('derive', () => {
        let masterPriv;
        let masterPub;

        beforeEach(() => {
            masterPriv = ExtendedPrivateKey.fromSeed(seed);
            masterPub = ExtendedPublicKey.fromExtendedPrivateKey(masterPriv);
        });

        it('should derive child key using path M/44/0/0/0', () => {
            const childPriv = masterPriv.derive("m/44/0/0/0");
            const childPub = masterPub.derive("M/44/0/0/0");
            expect(childPub.getPublicKey().getKey()).toEqual(childPriv.getExtendedPublicKey().getPublicKey().getKey());
        });

        it('should handle normal derivation', () => {
            const child = masterPub.derive("M/44");
            expect(child).toBeInstanceOf(ExtendedPublicKey);
            expect(child.depth).toBe(1);
        });

        it('should throw error for hardened derivation', () => {
            expect(() => masterPub.derive("M/44'"))
                .toThrow('Cannot derive hardened child key');
        });
    });

    describe('deriveChild', () => {
        let masterPub;

        beforeEach(() => {
            const masterPriv = ExtendedPrivateKey.fromSeed(seed);
            masterPub = ExtendedPublicKey.fromExtendedPrivateKey(masterPriv);
        });

        it('should derive normal child key', () => {
            const child = masterPub.deriveChild(0);
            expect(child).toBeInstanceOf(ExtendedPublicKey);
            expect(child.depth).toBe(1);
            expect(child.index).toBe(0);
        });

        it('should throw error for hardened child key', () => {
            const hardenedIndex = 0x80000000;
            expect(() => masterPub.deriveChild(hardenedIndex))
                .toThrow('Cannot derive hardened child key');
        });

        it('should throw error if no public key or chain code', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode);
            extKey.chainCode = null;
            expect(() => extKey.deriveChild(0))
                .toThrow('No publicKey or chainCode set');
        });
    });

    describe('getFingerprint', () => {
        it('should return correct fingerprint', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode);
            const fingerprint = extKey.getFingerprint();
            expect(typeof fingerprint).toBe('number');
            expect(fingerprint).toBeGreaterThanOrEqual(0);
            expect(fingerprint).toBeLessThan(0xffffffff);
        });
    });

    describe('getExtendedKey', () => {
        it('should return base58 encoded extended key', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode);
            const xpub = extKey.getExtendedKey();
            expect(typeof xpub).toBe('string');
            expect(xpub.startsWith('xpub')).toBe(true);
        });

        it('should handle BIP84 version when enabled', () => {
            const extKey = new ExtendedPublicKey(validPubKey, validChainCode);
            extKey.versions = { public: 0x04b24746 }; // zpub version bytes
            const zpub = extKey.getExtendedKey();
            expect(zpub.startsWith('zpub')).toBe(true);
        });
    });
}); 