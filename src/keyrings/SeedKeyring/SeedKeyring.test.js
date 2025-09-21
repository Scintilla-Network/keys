import { describe, it, expect, beforeEach } from 'vitest';
import SeedKeyring from './SeedKeyring.js';
import ChainKeyring from '../ChainKeyring/ChainKeyring.js';
import ExtendedPrivateKey from '../../primitives/ExtendedPrivateKey/ExtendedPrivateKey.js';

describe('SeedKeyring', () => {
    // Test vectors (using the "abandon" mnemonic from your e2e tests)
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const seed = Buffer.from('5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4', 'hex');
    const expectedRootKey = 'xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu';
    
    describe('constructor', () => {
        it('should create SeedKeyring with valid extended key', () => {
            const extendedKey = ExtendedPrivateKey.fromSeed(seed);
            const keyring = new SeedKeyring(extendedKey);
            expect(keyring).toBeInstanceOf(SeedKeyring);
            expect(keyring.getPublicKey()).toBeDefined();
            expect(keyring.getPrivateKey()).toBeDefined();
            expect(keyring.toBase58()).toBe(expectedRootKey);
        });

        it('should throw error if no extended key provided', () => {
            expect(() => new SeedKeyring()).toThrow('Extended key is required');
        });
    });

    describe('static methods', () => {
        describe('fromMnemonicToSeed', () => {
            it('should convert mnemonic to correct seed', () => {
                const derivedSeed = SeedKeyring.fromMnemonicToSeed(mnemonic);
                expect(Buffer.from(derivedSeed).toString('hex')).toBe(seed.toString('hex'));
            });

            // it('should throw error for invalid mnemonic', () => {
            //     expect(() => SeedKeyring.fromMnemonicToSeed('invalid mnemonic'))
            //         .toThrow();
            // });
        });

        describe('fromMnemonic', () => {
            it('should create keyring from mnemonic', () => {
                const keyring = SeedKeyring.fromMnemonic(mnemonic);
                expect(keyring).toBeInstanceOf(SeedKeyring);
                expect(keyring.toBase58()).toBe(expectedRootKey);
            });
        });

        describe('fromSeed', () => {
            it('should create keyring from seed', () => {
                const keyring = SeedKeyring.fromSeed(seed);
                expect(keyring).toBeInstanceOf(SeedKeyring);
                expect(keyring.toBase58()).toBe(expectedRootKey);
            });
        });
    });

    describe('getChainKeyring', () => {
        let seedKeyring;

        beforeEach(() => {
            seedKeyring = SeedKeyring.fromMnemonic(mnemonic);
        });

        it('should create ChainKeyring with default options', () => {
            const chainKeyring = seedKeyring.getChainKeyring();
            expect(chainKeyring).toBeInstanceOf(ChainKeyring);
            expect(chainKeyring.options).toEqual({
                purpose: 44,
                coinType: 8888
            });
        });

        it('should create ChainKeyring with custom options', () => {
            const chainKeyring = seedKeyring.getChainKeyring({
                purpose: 49,
                coinType: 0
            });
            expect(chainKeyring.options).toEqual({
                purpose: 49,
                coinType: 0
            });
        });

        it('should derive correct path for bitcoin', () => {
            const chainKeyring = seedKeyring.getChainKeyring({ chain: 'bitcoin' });
            expect(chainKeyring.options).toEqual({
                purpose: 44,
                coinType: 0
            });
            expect(chainKeyring.toBase58()).toBe('xprv9wnZLsHUEcR3UVuysrCTjAu7FWKXN2m5XVrgkEmeptHqi5yNkR8seouPutDWAJQcUPYDzTDgjK7G1h53M4QeA4myt6gUSUgdFhQSYw7XAV4');
        });

        it('should derive correct path for ethereum', () => {
            const chainKeyring = seedKeyring.getChainKeyring({ chain: 'ethereum' });
            expect(chainKeyring.options).toEqual({
                purpose: 44,
                coinType: 60
            });
        });

        it('should derive correct path for segwit', () => {
            const chainKeyring = seedKeyring.getChainKeyring({ chain: 'segwit' });
            expect(chainKeyring.options).toEqual({
                purpose: 49,
                coinType: 0
            });
        });

        it('should throw error for unsupported chain', () => {
            expect(() => seedKeyring.getChainKeyring({ chain: 'unsupported' }))
                .toThrow('Unsupported chain: unsupported');
        });

        it('should respect explicit purpose and coinType over chain defaults', () => {
            const chainKeyring = seedKeyring.getChainKeyring({
                chain: 'bitcoin',
                purpose: 84,
                coinType: 1
            });
            expect(chainKeyring.options).toEqual({
                purpose: 84,
                coinType: 1
            });
        });
    });

    describe('key management', () => {
        let keyring;

        beforeEach(() => {
            keyring = SeedKeyring.fromMnemonic(mnemonic);
        });

        it('should get public key', () => {
            expect(keyring.getPublicKey()).toBeDefined();
        });

        it('should get private key', () => {
            expect(keyring.getPrivateKey()).toBeDefined();
        });

        it('should throw error when getting private key after securing', () => {
            keyring.secure();
            expect(() => keyring.getPrivateKey()).toThrow('Private key is not available');
        });
    });
}); 