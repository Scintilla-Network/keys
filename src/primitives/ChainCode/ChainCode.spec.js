import { describe, it, expect } from '@scintilla-network/litest';
import ChainCode from './ChainCode.js';

describe('ChainCode', () => {
    // Test vectors
    const validChainCodeHex = 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35';
    const validChainCodeBytes = new Uint8Array(Buffer.from(validChainCodeHex, 'hex'));

    describe('constructor', () => {
        it('should create ChainCode with valid hex string', () => {
            const chainCode = new ChainCode(validChainCodeHex);
            expect(chainCode).toBeInstanceOf(ChainCode);
            expect(chainCode.toString()).toBe(validChainCodeHex);
        });

        it('should create ChainCode with valid Uint8Array', () => {
            const chainCode = new ChainCode(validChainCodeBytes);
            expect(chainCode).toBeInstanceOf(ChainCode);
            expect(chainCode.toString()).toBe(validChainCodeHex);
        });

        it('should throw error if no code provided', () => {
            expect(() => new ChainCode()).toThrow('Chain code is required');
        });

        it('should throw error if code length is not 32 bytes', () => {
            const invalidCode = new Uint8Array(31);
            expect(() => new ChainCode(invalidCode)).toThrow('Chain code must be 32 bytes');
        });

        it('should throw error if code is all zeros', () => {
            const zeroCode = new Uint8Array(32);
            expect(() => new ChainCode(zeroCode)).toThrow('Invalid chain code: all bytes are zero');
        });
    });

    describe('generate', () => {
        it('should generate valid random chain code', () => {
            const chainCode = ChainCode.generate();
            expect(chainCode).toBeInstanceOf(ChainCode);
            expect(chainCode.toBuffer().length).toBe(32);
        });
    });

    describe('toBuffer', () => {
        it('should return Uint8Array of chain code bytes', () => {
            const chainCode = new ChainCode(validChainCodeBytes);
            const buffer = chainCode.toBuffer();
            expect(buffer).toBeInstanceOf(Uint8Array);
            expect(buffer).toEqual(validChainCodeBytes);
        });
    });

    describe('toString', () => {
        it('should return hex string representation', () => {
            const chainCode = new ChainCode(validChainCodeBytes);
            expect(chainCode.toString()).toBe(validChainCodeHex);
        });
    });
});