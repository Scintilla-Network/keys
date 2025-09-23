import { describe, it, expect } from '@scintilla-network/litest';
import varbigint from './varbigint.js';

describe('varbigint', () => {
    describe('encodeVarBigInt', () => {
        it('should encode single byte values (0-250)', () => {
            expect(varbigint.encodeVarBigInt(0n)).toEqual(new Uint8Array([0]));
            expect(varbigint.encodeVarBigInt(100n)).toEqual(new Uint8Array([100]));
            expect(varbigint.encodeVarBigInt(250n)).toEqual(new Uint8Array([250]));
        });

        it('should encode 2-byte values (251-65535)', () => {
            expect(varbigint.encodeVarBigInt(251n)).toEqual(new Uint8Array([0xFB, 251, 0]));
            expect(varbigint.encodeVarBigInt(1000n)).toEqual(new Uint8Array([0xFB, 232, 3])); // 1000 = 0x03E8
            expect(varbigint.encodeVarBigInt(65535n)).toEqual(new Uint8Array([0xFB, 255, 255]));
        });

        it('should encode 4-byte values (65536-4294967295)', () => {
            expect(varbigint.encodeVarBigInt(65536n)).toEqual(new Uint8Array([0xFC, 0, 0, 1, 0]));
            expect(varbigint.encodeVarBigInt(1000000n)).toEqual(new Uint8Array([0xFC, 64, 66, 15, 0])); // 1000000 = 0x000F4240
            expect(varbigint.encodeVarBigInt(4294967295n)).toEqual(new Uint8Array([0xFC, 255, 255, 255, 255]));
        });

        it('should encode 8-byte values (4294967296-18446744073709551615)', () => {
            const val = BigInt('4294967296'); // 2^32
            const encoded = varbigint.encodeVarBigInt(val);
            expect(encoded[0]).toEqual(0xFD);
            expect(encoded.length).toEqual(9);
        });

        it('should encode 16-byte values (up to 2^128-1)', () => {
            const val = BigInt('18446744073709551616'); // 2^64
            const encoded = varbigint.encodeVarBigInt(val);
            expect(encoded[0]).toEqual(0xFE);
            expect(encoded.length).toEqual(17);
        });

        it('should encode 32-byte values (up to 2^256-1)', () => {
            const val = 1n << 128n; // 2^128
            const encoded = varbigint.encodeVarBigInt(val);
            expect(encoded[0]).toEqual(0xFF);
            expect(encoded.length).toEqual(33);
        });

        it('should handle negative BigInt by converting to positive', () => {
            expect(varbigint.encodeVarBigInt(-100n)).toEqual(new Uint8Array([100]));
            expect(varbigint.encodeVarBigInt(-1000n)).toEqual(new Uint8Array([0xFB, 232, 3]));
        });

        it('should return hex format when requested', () => {
            const result = varbigint.encodeVarBigInt(100n, 'hex');
            expect(typeof result).toEqual('string');
            expect(result).toEqual('64');
            
            const result2 = varbigint.encodeVarBigInt(1000n, 'hex');
            expect(result2).toEqual('fbe803');
        });

        it('should throw error for number inputs', () => {
            expect(() => varbigint.encodeVarBigInt(100)).toThrow('Input must be a BigInt');
            expect(() => varbigint.encodeVarBigInt(1000)).toThrow('Input must be a BigInt');
        });

        it('should throw error for values too large', () => {
            const tooLarge = 1n << 256n; // 2^256
            expect(() => varbigint.encodeVarBigInt(tooLarge)).toThrow('Value too large for varbigint encoding');
        });
    });

    describe('decodeVarBigInt', () => {
        it('should decode single byte values (0-250)', () => {
            expect(varbigint.decodeVarBigInt(new Uint8Array([0]))).toEqual({ value: 0n, length: 1 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([100]))).toEqual({ value: 100n, length: 1 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([250]))).toEqual({ value: 250n, length: 1 });
        });

        it('should decode 2-byte values (251-65535)', () => {
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFB, 251, 0]))).toEqual({ value: 251n, length: 3 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFB, 232, 3]))).toEqual({ value: 1000n, length: 3 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFB, 255, 255]))).toEqual({ value: 65535n, length: 3 });
        });

        it('should decode 4-byte values (65536-4294967295)', () => {
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFC, 0, 0, 1, 0]))).toEqual({ value: 65536n, length: 5 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFC, 64, 66, 15, 0]))).toEqual({ value: 1000000n, length: 5 });
            expect(varbigint.decodeVarBigInt(new Uint8Array([0xFC, 255, 255, 255, 255]))).toEqual({ value: 4294967295n, length: 5 });
        });

        it('should decode 8-byte values and return BigInt for large values', () => {
            // Test 2^32 = 4294967296 which should be encoded as 0xFD + 8 bytes little-endian
            // 4294967296 = 0x0000000100000000 in little-endian: 00 00 00 00 01 00 00 00
            const buffer = new Uint8Array(9);
            buffer[0] = 0xFD;
            buffer[1] = 0; buffer[2] = 0; buffer[3] = 0; buffer[4] = 0; // low 4 bytes = 0
            buffer[5] = 1; buffer[6] = 0; buffer[7] = 0; buffer[8] = 0; // high 4 bytes = 1
            
            const result = varbigint.decodeVarBigInt(buffer);
            expect(result.value).toEqual(4294967296n);
            expect(result.length).toEqual(9);
        });

        it('should decode 16-byte values', () => {
            // Test 2^64 = 18446744073709551616 which should be encoded as 0xFE + 16 bytes little-endian
            // 2^64 = 0x00000000000000010000000000000000 in little-endian: 00 00 00 00 00 00 00 00 01 00 00 00 00 00 00 00
            const buffer = new Uint8Array(17);
            buffer[0] = 0xFE;
            for (let i = 1; i <= 8; i++) buffer[i] = 0; // first 8 bytes = 0
            buffer[9] = 1; // 9th byte = 1 (bit position 64)
            for (let i = 10; i < 17; i++) buffer[i] = 0; // remaining bytes = 0
            
            const result = varbigint.decodeVarBigInt(buffer);
            expect(typeof result.value).toEqual('bigint');
            expect(result.value).toEqual(BigInt('18446744073709551616'));
            expect(result.length).toEqual(17);
        });

        it('should decode 32-byte values', () => {
            const buffer = new Uint8Array(33);
            buffer[0] = 0xFF;
            for (let i = 1; i < 17; i++) buffer[i] = 0;
            buffer[17] = 1; // 2^128 in little-endian
            for (let i = 18; i < 33; i++) buffer[i] = 0;
            
            const result = varbigint.decodeVarBigInt(buffer);
            expect(typeof result.value).toEqual('bigint');
            expect(result.value).toEqual(1n << 128n);
            expect(result.length).toEqual(33);
        });

        it('should decode from hex string input', () => {
            expect(varbigint.decodeVarBigInt('64')).toEqual({ value: 100n, length: 1 });
            expect(varbigint.decodeVarBigInt('fbe803')).toEqual({ value: 1000n, length: 3 });
        });

        it('should throw error for empty buffer', () => {
            expect(() => varbigint.decodeVarBigInt(new Uint8Array())).toThrow('Empty buffer provided');
            expect(() => varbigint.decodeVarBigInt('')).toThrow('Empty buffer provided');
        });

        it('should throw error for insufficient buffer length', () => {
            expect(() => varbigint.decodeVarBigInt(new Uint8Array([0xFB, 1]))).toThrow('Insufficient buffer length for 0xFB');
            expect(() => varbigint.decodeVarBigInt(new Uint8Array([0xFC, 1, 2, 3]))).toThrow('Insufficient buffer length for 0xFC');
            expect(() => varbigint.decodeVarBigInt(new Uint8Array([0xFD, 1, 2, 3, 4, 5, 6, 7]))).toThrow('Insufficient buffer length for 0xFD');
            expect(() => varbigint.decodeVarBigInt(new Uint8Array([0xFE, ...new Array(15).fill(0)]))).toThrow('Insufficient buffer length for 0xFE');
            expect(() => varbigint.decodeVarBigInt(new Uint8Array([0xFF, ...new Array(31).fill(0)]))).toThrow('Insufficient buffer length for 0xFF');
        });

        it('should handle all valid single-byte values', () => {
            // Test all valid single-byte values (0-250)
            for (let i = 0; i <= 250; i++) {
                const result = varbigint.decodeVarBigInt(new Uint8Array([i]));
                expect(result.value).toEqual(BigInt(i));
                expect(result.length).toEqual(1);
            }
        });

        it('should correctly decode all prefix types', () => {
            // Test each prefix type with a simple value
            
            // 0xFB prefix (2-byte)
            const fb_result = varbigint.decodeVarBigInt(new Uint8Array([0xFB, 1, 0]));
            expect(fb_result.value).toEqual(1n);
            expect(fb_result.length).toEqual(3);
            
            // 0xFC prefix (4-byte)
            const fc_result = varbigint.decodeVarBigInt(new Uint8Array([0xFC, 1, 0, 0, 0]));
            expect(fc_result.value).toEqual(1n);
            expect(fc_result.length).toEqual(5);
            
            // 0xFD prefix (8-byte)
            const fd_result = varbigint.decodeVarBigInt(new Uint8Array([0xFD, 1, 0, 0, 0, 0, 0, 0, 0]));
            expect(fd_result.value).toEqual(1n);
            expect(fd_result.length).toEqual(9);
            
            // 0xFE prefix (16-byte)
            const fe_result = varbigint.decodeVarBigInt(new Uint8Array([0xFE, 1, ...new Array(15).fill(0)]));
            expect(fe_result.value).toEqual(1n);
            expect(fe_result.length).toEqual(17);
            
            // 0xFF prefix (32-byte)
            const ff_result = varbigint.decodeVarBigInt(new Uint8Array([0xFF, 1, ...new Array(31).fill(0)]));
            expect(ff_result.value).toEqual(1n);
            expect(ff_result.length).toEqual(33);
        });
    });

    describe('round-trip encoding/decoding', () => {
        const testValues = [
            0n, 1n, 100n, 250n, 251n, 1000n, 65535n, 65536n, 1000000n, 4294967295n,
            BigInt('4294967296'),
            BigInt('18446744073709551615'),
            BigInt('18446744073709551616'),
            1n << 100n,
            1n << 128n,
            (1n << 256n) - 1n
        ];

        testValues.forEach(value => {
            it(`should round-trip encode/decode ${value}`, () => {
                const encoded = varbigint.encodeVarBigInt(value);
                const decoded = varbigint.decodeVarBigInt(encoded);
                expect(decoded.value).toEqual(value);
            });
        });

        it('should round-trip with hex format', () => {
            const value = 1000000n;
            const encoded = varbigint.encodeVarBigInt(value, 'hex');
            const decoded = varbigint.decodeVarBigInt(encoded);
            expect(decoded.value).toEqual(value);
        });

        it('should handle hex string inputs correctly', () => {
            // Test various hex string formats
            const testCases = [
                { hex: '00', expected: 0n },
                { hex: 'fa', expected: 250n },
                { hex: 'fbff00', expected: 255n },
                { hex: 'fc00001000', expected: 1048576n }, // 0x00100000 in little-endian = 1048576
            ];
            
            testCases.forEach(({ hex, expected }) => {
                const result = varbigint.decodeVarBigInt(hex);
                expect(result.value).toEqual(expected);
            });
        });

        it('should handle large round-trip values efficiently', () => {
            // Test with very large numbers to ensure no performance issues
            const largeValues = [
                (1n << 100n),
                (1n << 200n),
                (1n << 255n),
                (1n << 256n) - 1n
            ];
            
            largeValues.forEach(value => {
                const encoded = varbigint.encodeVarBigInt(value);
                const decoded = varbigint.decodeVarBigInt(encoded);
                expect(decoded.value).toEqual(value);
            });
        });
    });

    describe('getEncodingLength', () => {
        it('should return correct encoding lengths', () => {
            expect(varbigint.getEncodingLength(0n)).toEqual(1);
            expect(varbigint.getEncodingLength(250n)).toEqual(1);
            expect(varbigint.getEncodingLength(251n)).toEqual(3);
            expect(varbigint.getEncodingLength(65535n)).toEqual(3);
            expect(varbigint.getEncodingLength(65536n)).toEqual(5);
            expect(varbigint.getEncodingLength(4294967295n)).toEqual(5);
            expect(varbigint.getEncodingLength(BigInt('4294967296'))).toEqual(9);
            expect(varbigint.getEncodingLength(BigInt('18446744073709551615'))).toEqual(9);
            expect(varbigint.getEncodingLength(BigInt('18446744073709551616'))).toEqual(17);
            expect(varbigint.getEncodingLength(1n << 128n)).toEqual(33);
        });

        it('should handle negative BigInt', () => {
            expect(varbigint.getEncodingLength(-100n)).toEqual(1);
            expect(varbigint.getEncodingLength(-1000n)).toEqual(3);
        });

        it('should throw error for number inputs', () => {
            expect(() => varbigint.getEncodingLength(100)).toThrow('Input must be a BigInt');
            expect(() => varbigint.getEncodingLength(1000)).toThrow('Input must be a BigInt');
        });

        it('should throw error for values too large', () => {
            expect(() => varbigint.getEncodingLength(1n << 256n)).toThrow('Value too large for varbigint encoding');
        });
    });

    describe('canEncode', () => {
        it('should return true for encodable BigInt values', () => {
            expect(varbigint.canEncode(0n)).toBe(true);
            expect(varbigint.canEncode(1000n)).toBe(true);
            expect(varbigint.canEncode(BigInt('4294967296'))).toBe(true);
            expect(varbigint.canEncode((1n << 256n) - 1n)).toBe(true);
        });

        it('should return false for negative BigInt values', () => {
            expect(varbigint.canEncode(-1n)).toBe(false);
            expect(varbigint.canEncode(-100n)).toBe(false);
        });

        it('should return false for BigInt values too large', () => {
            expect(varbigint.canEncode(1n << 256n)).toBe(false);
        });

        it('should return false for non-BigInt inputs', () => {
            expect(varbigint.canEncode(100)).toBe(false);
            expect(varbigint.canEncode(1000)).toBe(false);
            expect(varbigint.canEncode('invalid')).toBe(false);
            expect(varbigint.canEncode(null)).toBe(false);
            expect(varbigint.canEncode(undefined)).toBe(false);
        });
    });

    describe('boundary value tests', () => {
        it('should handle exact boundary values correctly', () => {
            // Test exact boundaries between encoding sizes
            
            // Boundary: 250 (single byte) vs 251 (2-byte)
            const encoded250 = varbigint.encodeVarBigInt(250n);
            const encoded251 = varbigint.encodeVarBigInt(251n);
            expect(encoded250).toEqual(new Uint8Array([250]));
            expect(encoded251).toEqual(new Uint8Array([0xFB, 251, 0]));
            
            // Verify decoding
            expect(varbigint.decodeVarBigInt(encoded250).value).toEqual(250n);
            expect(varbigint.decodeVarBigInt(encoded251).value).toEqual(251n);
            
            // Boundary: 65535 (2-byte) vs 65536 (4-byte)
            const encoded65535 = varbigint.encodeVarBigInt(65535n);
            const encoded65536 = varbigint.encodeVarBigInt(65536n);
            expect(encoded65535).toEqual(new Uint8Array([0xFB, 255, 255]));
            expect(encoded65536).toEqual(new Uint8Array([0xFC, 0, 0, 1, 0]));
            
            // Verify decoding
            expect(varbigint.decodeVarBigInt(encoded65535).value).toEqual(65535n);
            expect(varbigint.decodeVarBigInt(encoded65536).value).toEqual(65536n);
            
            // Boundary: 4294967295 (4-byte) vs 4294967296 (8-byte)
            const encoded4294967295 = varbigint.encodeVarBigInt(4294967295n);
            const encoded4294967296 = varbigint.encodeVarBigInt(4294967296n);
            expect(encoded4294967295).toEqual(new Uint8Array([0xFC, 255, 255, 255, 255]));
            expect(encoded4294967296[0]).toEqual(0xFD);
            expect(encoded4294967296.length).toEqual(9);
            
            // Verify decoding
            expect(varbigint.decodeVarBigInt(encoded4294967295).value).toEqual(4294967295n);
            expect(varbigint.decodeVarBigInt(encoded4294967296).value).toEqual(4294967296n);
        });

        it('should handle values around 2^64 boundary', () => {
            const max8Byte = 18446744073709551615n; // 2^64 - 1
            const min16Byte = 18446744073709551616n; // 2^64
            
            const encodedMax8 = varbigint.encodeVarBigInt(max8Byte);
            const encodedMin16 = varbigint.encodeVarBigInt(min16Byte);
            
            expect(encodedMax8[0]).toEqual(0xFD);
            expect(encodedMax8.length).toEqual(9);
            expect(encodedMin16[0]).toEqual(0xFE);
            expect(encodedMin16.length).toEqual(17);
            
            expect(varbigint.decodeVarBigInt(encodedMax8).value).toEqual(max8Byte);
            expect(varbigint.decodeVarBigInt(encodedMin16).value).toEqual(min16Byte);
        });

        it('should handle values around 2^128 boundary', () => {
            const max16Byte = (1n << 128n) - 1n; // 2^128 - 1
            const min32Byte = 1n << 128n; // 2^128
            
            const encodedMax16 = varbigint.encodeVarBigInt(max16Byte);
            const encodedMin32 = varbigint.encodeVarBigInt(min32Byte);
            
            expect(encodedMax16[0]).toEqual(0xFE);
            expect(encodedMax16.length).toEqual(17);
            expect(encodedMin32[0]).toEqual(0xFF);
            expect(encodedMin32.length).toEqual(33);
            
            expect(varbigint.decodeVarBigInt(encodedMax16).value).toEqual(max16Byte);
            expect(varbigint.decodeVarBigInt(encodedMin32).value).toEqual(min32Byte);
        });

        it('should handle specific problematic values', () => {
            // Test values that might cause issues with bit shifting
            const testValues = [
                252n, 253n, 254n, 255n, 256n,
                65534n, 65535n, 65536n, 65537n,
                4294967294n, 4294967295n, 4294967296n, 4294967297n,
                (1n << 32n) - 1n, 1n << 32n, (1n << 32n) + 1n,
                (1n << 64n) - 1n, 1n << 64n, (1n << 64n) + 1n
            ];
            
            testValues.forEach(value => {
                const encoded = varbigint.encodeVarBigInt(value);
                const decoded = varbigint.decodeVarBigInt(encoded);
                expect(decoded.value).toEqual(value);
            });
        });
    });

    describe('edge cases', () => {
        it('should handle boundary values correctly', () => {
            // Test boundary between single byte and 2-byte encoding
            expect(varbigint.encodeVarBigInt(250n).length).toEqual(1);
            expect(varbigint.encodeVarBigInt(251n).length).toEqual(3);
            
            // Test boundary between 2-byte and 4-byte encoding
            expect(varbigint.encodeVarBigInt(65535n).length).toEqual(3);
            expect(varbigint.encodeVarBigInt(65536n).length).toEqual(5);
            
            // Test boundary between 4-byte and 8-byte encoding
            expect(varbigint.encodeVarBigInt(4294967295n).length).toEqual(5);
            expect(varbigint.encodeVarBigInt(4294967296n).length).toEqual(9);
        });

        it('should maintain little-endian byte order', () => {
            // Test 1000 (0x03E8) should be encoded as [0xFB, 0xE8, 0x03]
            const encoded = varbigint.encodeVarBigInt(1000n);
            expect(encoded).toEqual(new Uint8Array([0xFB, 0xE8, 0x03]));
            
            const decoded = varbigint.decodeVarBigInt(encoded);
            expect(decoded.value).toEqual(1000n);
        });

        it('should handle maximum values for each encoding size', () => {
            const maxSingleByte = 250n;
            const max2Byte = 65535n;
            const max4Byte = 4294967295n;
            const max8Byte = BigInt('18446744073709551615');
            
            expect(varbigint.decodeVarBigInt(varbigint.encodeVarBigInt(maxSingleByte)).value).toEqual(maxSingleByte);
            expect(varbigint.decodeVarBigInt(varbigint.encodeVarBigInt(max2Byte)).value).toEqual(max2Byte);
            expect(varbigint.decodeVarBigInt(varbigint.encodeVarBigInt(max4Byte)).value).toEqual(max4Byte);
            expect(varbigint.decodeVarBigInt(varbigint.encodeVarBigInt(max8Byte)).value).toEqual(max8Byte);
        });
    });
});
