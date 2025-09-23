import { describe, it, expect } from '@scintilla-network/litest';
import varint from './varint.js';

describe('Bitcoin VarInt (varint)', () => {
    describe('encodeVarInt', () => {
        it('should encode single byte values (0-252)', () => {
            expect(varint.encodeVarInt(0)).toEqual(new Uint8Array([0]));
            expect(varint.encodeVarInt(1)).toEqual(new Uint8Array([1]));
            expect(varint.encodeVarInt(100)).toEqual(new Uint8Array([100]));
            expect(varint.encodeVarInt(252)).toEqual(new Uint8Array([252]));
        });

        it('should encode 2-byte values (253-65535)', () => {
            expect(varint.encodeVarInt(253)).toEqual(new Uint8Array([0xFD, 253, 0]));
            expect(varint.encodeVarInt(1000)).toEqual(new Uint8Array([0xFD, 232, 3])); // 1000 = 0x03E8
            expect(varint.encodeVarInt(65535)).toEqual(new Uint8Array([0xFD, 255, 255]));
        });

        it('should encode 4-byte values (65536-4294967295)', () => {
            expect(varint.encodeVarInt(65536)).toEqual(new Uint8Array([0xFE, 0, 0, 1, 0]));
            expect(varint.encodeVarInt(1000000)).toEqual(new Uint8Array([0xFE, 64, 66, 15, 0])); // 1000000 = 0x000F4240
            expect(varint.encodeVarInt(4294967295)).toEqual(new Uint8Array([0xFE, 255, 255, 255, 255]));
        });

        it('should encode 8-byte values (4294967296-18446744073709551615)', () => {
            const val = BigInt('4294967296'); // 2^32
            const encoded = varint.encodeVarInt(val);
            expect(encoded[0]).toEqual(0xFF);
            expect(encoded.length).toEqual(9);
        });

        it('should handle BigInt inputs', () => {
            expect(varint.encodeVarInt(BigInt(100))).toEqual(new Uint8Array([100]));
            expect(varint.encodeVarInt(BigInt(1000))).toEqual(new Uint8Array([0xFD, 232, 3]));
        });

        it('should return hex format when requested', () => {
            const result = varint.encodeVarInt(100, 'hex');
            expect(typeof result).toEqual('string');
            expect(result).toEqual('64');
            
            const result2 = varint.encodeVarInt(1000, 'hex');
            expect(result2).toEqual('fde803');
        });

        it('should throw error for negative values', () => {
            expect(() => varint.encodeVarInt(-1)).toThrow('Bitcoin varint values must be non-negative');
            expect(() => varint.encodeVarInt(-100)).toThrow('Bitcoin varint values must be non-negative');
        });

        it('should throw error for values too large', () => {
            const tooLarge = BigInt('18446744073709551616'); // 2^64
            expect(() => varint.encodeVarInt(tooLarge)).toThrow('Value exceeds maximum Bitcoin varint value');
        });

        it('should throw error for invalid input types', () => {
            expect(() => varint.encodeVarInt('invalid')).toThrow('Input must be a number or BigInt');
            expect(() => varint.encodeVarInt(null)).toThrow('Input must be a number or BigInt');
            expect(() => varint.encodeVarInt(undefined)).toThrow('Input must be a number or BigInt');
        });
    });

    describe('decodeVarInt', () => {
        it('should decode single byte values (0-252)', () => {
            expect(varint.decodeVarInt(new Uint8Array([0]))).toEqual({ value: 0, length: 1 });
            expect(varint.decodeVarInt(new Uint8Array([100]))).toEqual({ value: 100, length: 1 });
            expect(varint.decodeVarInt(new Uint8Array([252]))).toEqual({ value: 252, length: 1 });
        });

        it('should decode 2-byte values (253-65535)', () => {
            expect(varint.decodeVarInt(new Uint8Array([0xFD, 253, 0]))).toEqual({ value: 253, length: 3 });
            expect(varint.decodeVarInt(new Uint8Array([0xFD, 232, 3]))).toEqual({ value: 1000, length: 3 });
            expect(varint.decodeVarInt(new Uint8Array([0xFD, 255, 255]))).toEqual({ value: 65535, length: 3 });
        });

        it('should decode 4-byte values (65536-4294967295)', () => {
            expect(varint.decodeVarInt(new Uint8Array([0xFE, 0, 0, 1, 0]))).toEqual({ value: 65536, length: 5 });
            expect(varint.decodeVarInt(new Uint8Array([0xFE, 64, 66, 15, 0]))).toEqual({ value: 1000000, length: 5 });
            expect(varint.decodeVarInt(new Uint8Array([0xFE, 255, 255, 255, 255]))).toEqual({ value: 4294967295, length: 5 });
        });

        it('should decode 8-byte values and return BigInt for large values', () => {
            // Test 2^32 = 4294967296 which should be encoded as 0xFF + 8 bytes little-endian
            const buffer = new Uint8Array(9);
            buffer[0] = 0xFF;
            buffer[1] = 0; buffer[2] = 0; buffer[3] = 0; buffer[4] = 0; // low 4 bytes = 0
            buffer[5] = 1; buffer[6] = 0; buffer[7] = 0; buffer[8] = 0; // high 4 bytes = 1
            
            const result = varint.decodeVarInt(buffer);
            expect(result.value).toEqual(4294967296);
            expect(result.length).toEqual(9);
        });

        it('should decode from hex string input', () => {
            expect(varint.decodeVarInt('64')).toEqual({ value: 100, length: 1 });
            expect(varint.decodeVarInt('fde803')).toEqual({ value: 1000, length: 3 });
        });

        it('should throw error for empty buffer', () => {
            expect(() => varint.decodeVarInt(new Uint8Array())).toThrow('Empty buffer provided');
            expect(() => varint.decodeVarInt('')).toThrow('Empty buffer provided');
        });

        it('should throw error for insufficient buffer length', () => {
            expect(() => varint.decodeVarInt(new Uint8Array([0xFD, 1]))).toThrow('Insufficient buffer length for 0xFD');
            expect(() => varint.decodeVarInt(new Uint8Array([0xFE, 1, 2, 3]))).toThrow('Insufficient buffer length for 0xFE');
            expect(() => varint.decodeVarInt(new Uint8Array([0xFF, 1, 2, 3, 4, 5, 6, 7]))).toThrow('Insufficient buffer length for 0xFF');
        });

        it('should enforce canonical encoding (Bitcoin protocol requirement)', () => {
            // Values that could be encoded with fewer bytes should be rejected
            expect(() => varint.decodeVarInt(new Uint8Array([0xFD, 252, 0]))).toThrow('Non-canonical varint encoding');
            expect(() => varint.decodeVarInt(new Uint8Array([0xFE, 255, 255, 0, 0]))).toThrow('Non-canonical varint encoding');
            
            // Test edge case: exactly at the boundary should be accepted
            expect(() => varint.decodeVarInt(new Uint8Array([0xFD, 253, 0]))).not.toThrow();
            expect(() => varint.decodeVarInt(new Uint8Array([0xFE, 0, 0, 1, 0]))).not.toThrow();
        });
    });

    describe('getEncodingLength', () => {
        it('should return correct encoding lengths', () => {
            expect(varint.getEncodingLength(0)).toEqual(1);
            expect(varint.getEncodingLength(252)).toEqual(1);
            expect(varint.getEncodingLength(253)).toEqual(3);
            expect(varint.getEncodingLength(65535)).toEqual(3);
            expect(varint.getEncodingLength(65536)).toEqual(5);
            expect(varint.getEncodingLength(4294967295)).toEqual(5);
            expect(varint.getEncodingLength(BigInt('4294967296'))).toEqual(9);
            expect(varint.getEncodingLength(BigInt('18446744073709551615'))).toEqual(9);
        });

        it('should throw error for negative values', () => {
            expect(() => varint.getEncodingLength(-1)).toThrow('Bitcoin varint values must be non-negative');
            expect(() => varint.getEncodingLength(-100)).toThrow('Bitcoin varint values must be non-negative');
        });

        it('should throw error for invalid input types', () => {
            expect(() => varint.getEncodingLength('invalid')).toThrow('Input must be a number or BigInt');
            expect(() => varint.getEncodingLength(null)).toThrow('Input must be a number or BigInt');
        });

        it('should throw error for values too large', () => {
            expect(() => varint.getEncodingLength(BigInt('18446744073709551616'))).toThrow('Value too large for Bitcoin varint encoding');
        });
    });

    describe('canEncode', () => {
        it('should return true for encodable values', () => {
            expect(varint.canEncode(0)).toBe(true);
            expect(varint.canEncode(1000)).toBe(true);
            expect(varint.canEncode(BigInt('4294967296'))).toBe(true);
            expect(varint.canEncode(BigInt('18446744073709551615'))).toBe(true);
        });

        it('should return false for negative values', () => {
            expect(varint.canEncode(-1)).toBe(false);
            expect(varint.canEncode(-100)).toBe(false);
        });

        it('should return false for values too large', () => {
            expect(varint.canEncode(BigInt('18446744073709551616'))).toBe(false);
        });

        it('should return false for invalid inputs', () => {
            expect(varint.canEncode('invalid')).toBe(false);
            expect(varint.canEncode(null)).toBe(false);
            expect(varint.canEncode(undefined)).toBe(false);
        });
    });

    describe('Bitcoin protocol compliance', () => {
        it('should follow exact Bitcoin varint specification', () => {
            // Test known Bitcoin varint encodings
            const knownCases = [
                { value: 0, hex: '00' },
                { value: 252, hex: 'fc' },
                { value: 253, hex: 'fdfd00' },
                { value: 65535, hex: 'fdffff' },
                { value: 65536, hex: 'fe00000100' },
                { value: 4294967295, hex: 'feffffffff' }
            ];
            
            knownCases.forEach(({ value, hex }) => {
                const encoded = varint.encodeVarInt(value, 'hex');
                expect(encoded).toEqual(hex);
                
                const decoded = varint.decodeVarInt(hex);
                expect(decoded.value).toEqual(value);
            });
        });

        it('should maintain little-endian byte order', () => {
            // Test specific values with known little-endian representation
            const value = 0x1234; // 4660
            const encoded = varint.encodeVarInt(value);
            // Should be: FD 34 12 (0xFD prefix + 0x34, 0x12 in little-endian)
            expect(encoded).toEqual(new Uint8Array([0xFD, 0x34, 0x12]));
            
            const decoded = varint.decodeVarInt(encoded);
            expect(decoded.value).toEqual(value);
        });
    });
});
