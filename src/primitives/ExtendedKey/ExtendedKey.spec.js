import { describe, it, expect } from '@scintilla-network/litest';
import ExtendedKey from './ExtendedKey.js';
import ChainCode from '../ChainCode/ChainCode.js';
import { BITCOIN_VERSIONS } from "../../config.js";

describe('ExtendedKey', () => {
    // Test vectors
    const validChainCodeHex = 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35';
    const validChainCode = new ChainCode(validChainCodeHex);
    const validKey = new Uint8Array(33).fill(1); // Dummy key for testing

    describe('constructor', () => {
        it('should create ExtendedKey with valid chain code', () => {
            const extKey = new ExtendedKey(validChainCode);
            expect(extKey).toBeInstanceOf(ExtendedKey);
            expect(extKey.chainCode).toBe(validChainCode);
            expect(extKey.depth).toBe(0);
            expect(extKey.parentFingerprint).toBe(0);
            expect(extKey.index).toBe(0);
        });

        it('should create ExtendedKey with hex string chain code', () => {
            const extKey = new ExtendedKey(validChainCodeHex);
            expect(extKey.chainCode.toString()).toBe(validChainCodeHex);
        });

        it('should create ExtendedKey with custom parameters', () => {
            const extKey = new ExtendedKey(validChainCode, 1, 0x12345678, 5);
            expect(extKey.depth).toBe(1);
            expect(extKey.parentFingerprint).toBe(0x12345678);
            expect(extKey.index).toBe(5);
        });

        it('should throw error if no chain code provided', () => {
            expect(() => new ExtendedKey()).toThrow('Chain code is required');
        });

        it('should throw error if depth is too high', () => {
            expect(() => new ExtendedKey(validChainCode, 256))
                .toThrow('Depth too high');
        });

        it('should throw error if zero depth with non-zero parent fingerprint', () => {
            expect(() => new ExtendedKey(validChainCode, 0, 1))
                .toThrow('Zero depth with non-zero index/parent fingerprint');
        });

        it('should throw error if zero depth with non-zero index', () => {
            expect(() => new ExtendedKey(validChainCode, 0, 0, 1))
                .toThrow('Zero depth with non-zero index/parent fingerprint');
        });
    });

    describe('setBIP84Mode', () => {
        it('should enable BIP84 mode', () => {
            const extKey = new ExtendedKey(validChainCode);
            extKey.setBIP84Mode(true);
            expect(extKey.useBIP84).toBe(true);
        });

        it('should disable BIP84 mode', () => {
            const extKey = new ExtendedKey(validChainCode);
            extKey.setBIP84Mode(true);
            extKey.setBIP84Mode(false);
            expect(extKey.useBIP84).toBe(false);
        });

        it('should return this for chaining', () => {
            const extKey = new ExtendedKey(validChainCode);
            expect(extKey.setBIP84Mode(true)).toBe(extKey);
        });
    });

    describe('serialize', () => {
        it('should serialize with legacy private version', () => {
            const extKey = new ExtendedKey(validChainCode);
            const serialized = extKey.serialize(BITCOIN_VERSIONS.private, validKey);
            expect(serialized).toBeInstanceOf(Uint8Array);
            expect(serialized.length).toBe(78);
            expect(serialized[0]).toBe((BITCOIN_VERSIONS.private >>> 24) & 0xff);
        });

        it('should serialize with legacy public version', () => {
            const extKey = new ExtendedKey(validChainCode);
            const serialized = extKey.serialize(BITCOIN_VERSIONS.public, validKey);
            expect(serialized[0]).toBe((BITCOIN_VERSIONS.public >>> 24) & 0xff);
        });

        it('should serialize with BIP84 versions when enabled', () => {
            const extKey = new ExtendedKey(validChainCode).setBIP84Mode(true);
            const serialized = extKey.serialize(BITCOIN_VERSIONS.private, validKey);
            expect(serialized[0]).toBe((BITCOIN_VERSIONS.bip84Private >>> 24) & 0xff);
        });

        it('should throw error if no chain code set', () => {
            const extKey = new ExtendedKey(validChainCode);
            extKey.chainCode = null;
            expect(() => extKey.serialize(BITCOIN_VERSIONS.private, validKey))
                .toThrow('No chainCode set');
        });

        it('should throw error for invalid version', () => {
            const extKey = new ExtendedKey(validChainCode);
            expect(() => extKey.serialize(0x99999999, validKey))
                .toThrow('Invalid version');
        });

        it('should throw error for invalid key length', () => {
            const extKey = new ExtendedKey(validChainCode);
            const invalidKey = new Uint8Array(35); // Wrong length
            expect(() => extKey.serialize(BITCOIN_VERSIONS.private, invalidKey))
                .toThrow('Invalid key length');
        });
    });

    describe('utility methods', () => {
        it('should convert uint32 to bytes', () => {
            const extKey = new ExtendedKey(validChainCode);
            const bytes = extKey._uint32ToBytes(0x12345678);
            expect(bytes).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78]));
        });

        it('should convert bytes to uint32', () => {
            const extKey = new ExtendedKey(validChainCode);
            const num = extKey._bytesToUint32(new Uint8Array([0x12, 0x34, 0x56, 0x78]));
            expect(num).toBe(0x12345678);
        });

        it('should be reversible between uint32 and bytes', () => {
            const extKey = new ExtendedKey(validChainCode);
            const original = 0x12345678;
            const bytes = extKey._uint32ToBytes(original);
            const restored = extKey._bytesToUint32(bytes);
            expect(restored).toBe(original);
        });
    });
}); 