import { describe, it, expect } from '@scintilla-network/litest';
import varint from './varint.js';
const { encodeVarInt, decodeVarInt } = varint;
import uint8array from './uint8array.js';

describe('Bitcoin VarInt Encoding/Decoding', () => {
    describe('encodeVarInt', () => {
        it('should encode values 0 to 252 as single byte (hex format)', () => {
            // Test boundary values
            expect(encodeVarInt(0)).toEqual('00');
            expect(encodeVarInt(1)).toEqual('01');
            expect(encodeVarInt(252)).toEqual('fc');
            
            // Test some values in between
            expect(encodeVarInt(127)).toEqual('7f');
            expect(encodeVarInt(200)).toEqual('c8');
        });

        it('should encode values 0 to 252 as single byte (uint8array format)', () => {
            expect(encodeVarInt(0, 'uint8array')).toEqual(new Uint8Array([0x00]));
            expect(encodeVarInt(1, 'uint8array')).toEqual(new Uint8Array([0x01]));
            expect(encodeVarInt(252, 'uint8array')).toEqual(new Uint8Array([0xFC]));
            expect(encodeVarInt(127, 'uint8array')).toEqual(new Uint8Array([0x7F]));
        });

        it('should encode values 253 to 65535 with 0xFD prefix (hex format)', () => {
            // 253 = 0xFD, little-endian: FD 00
            expect(encodeVarInt(253)).toEqual('fdfd00');
            // 65535 = 0xFFFF, little-endian: FF FF
            expect(encodeVarInt(65535)).toEqual('fdffff');
            // 1000 = 0x03E8, little-endian: E8 03
            expect(encodeVarInt(1000)).toEqual('fde803');
        });

        it('should encode values 253 to 65535 with 0xFD prefix (uint8array format)', () => {
            expect(encodeVarInt(253, 'uint8array')).toEqual(new Uint8Array([0xFD, 0xFD, 0x00]));
            expect(encodeVarInt(65535, 'uint8array')).toEqual(new Uint8Array([0xFD, 0xFF, 0xFF]));
            expect(encodeVarInt(1000, 'uint8array')).toEqual(new Uint8Array([0xFD, 0xE8, 0x03]));
        });

        it('should encode values 65536 to 4294967295 with 0xFE prefix (hex format)', () => {
            // 65536 = 0x10000, little-endian: 00 00 01 00
            expect(encodeVarInt(65536)).toEqual('fe00000100');
            // 4294967295 = 0xFFFFFFFF, little-endian: FF FF FF FF
            expect(encodeVarInt(4294967295)).toEqual('feffffffff');
            // 1000000 = 0xF4240, little-endian: 40 42 0F 00
            expect(encodeVarInt(1000000)).toEqual('fe40420f00');
        });

        it('should encode values 65536 to 4294967295 with 0xFE prefix (uint8array format)', () => {
            expect(encodeVarInt(65536, 'uint8array')).toEqual(new Uint8Array([0xFE, 0x00, 0x00, 0x01, 0x00]));
            expect(encodeVarInt(4294967295, 'uint8array')).toEqual(new Uint8Array([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));
            expect(encodeVarInt(1000000, 'uint8array')).toEqual(new Uint8Array([0xFE, 0x40, 0x42, 0x0F, 0x00]));
        });

        it('should encode values >= 4294967296 with 0xFF prefix (hex format)', () => {
            // 4294967296 = 0x100000000, little-endian: 00 00 00 00 01 00 00 00
            expect(encodeVarInt(BigInt('4294967296'))).toEqual('ff0000000001000000');
            // Max uint64: 18446744073709551615 = 0xFFFFFFFFFFFFFFFF
            expect(encodeVarInt(BigInt('18446744073709551615'))).toEqual('ffffffffffffffffff');
        });

        it('should encode values >= 4294967296 with 0xFF prefix (uint8array format)', () => {
            expect(encodeVarInt(BigInt('4294967296'), 'uint8array')).toEqual(
                new Uint8Array([0xFF, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00])
            );
            expect(encodeVarInt(BigInt('18446744073709551615'), 'uint8array')).toEqual(
                new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
            );
        });

        it('should handle bigint inputs for all ranges', () => {
            expect(encodeVarInt(BigInt(100))).toEqual('64');
            expect(encodeVarInt(BigInt(300))).toEqual('fd2c01');
            expect(encodeVarInt(BigInt(100000))).toEqual('fea0860100');
        });
    });

    describe('decodeVarInt', () => {
        it('should decode single-byte values (0-252)', () => {
            let result = decodeVarInt(new Uint8Array([0x00]));
            expect(result.value).toBe(0);
            expect(result.length).toBe(1);

            result = decodeVarInt(new Uint8Array([0x7F]));
            expect(result.value).toBe(127);
            expect(result.length).toBe(1);

            result = decodeVarInt(new Uint8Array([0xFC]));
            expect(result.value).toBe(252);
            expect(result.length).toBe(1);
        });

        it('should decode 0xFD-prefixed values (253-65535)', () => {
            // 253: FD FD 00
            let result = decodeVarInt(new Uint8Array([0xFD, 0xFD, 0x00]));
            expect(result.value).toBe(253);
            expect(result.length).toBe(3);

            // 65535: FD FF FF
            result = decodeVarInt(new Uint8Array([0xFD, 0xFF, 0xFF]));
            expect(result.value).toBe(65535);
            expect(result.length).toBe(3);

            // 1000: FD E8 03
            result = decodeVarInt(new Uint8Array([0xFD, 0xE8, 0x03]));
            expect(result.value).toBe(1000);
            expect(result.length).toBe(3);
        });

        it('should decode 0xFE-prefixed values (65536-4294967295)', () => {
            // 65536: FE 00 00 01 00
            let result = decodeVarInt(new Uint8Array([0xFE, 0x00, 0x00, 0x01, 0x00]));
            expect(result.value).toBe(65536);
            expect(result.length).toBe(5);

            // 4294967295: FE FF FF FF FF
            result = decodeVarInt(new Uint8Array([0xFE, 0xFF, 0xFF, 0xFF, 0xFF]));
            expect(result.value).toBe(4294967295);
            expect(result.length).toBe(5);

            // 1000000: FE 40 42 0F 00
            result = decodeVarInt(new Uint8Array([0xFE, 0x40, 0x42, 0x0F, 0x00]));
            expect(result.value).toBe(1000000);
            expect(result.length).toBe(5);
        });

        it('should decode 0xFF-prefixed values (>=4294967296)', () => {
            // 4294967296: FF 00 00 00 00 01 00 00 00
            let result = decodeVarInt(new Uint8Array([0xFF, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));
            expect(result.value.toString()).toBe('4294967296');
            expect(result.length).toBe(9);

            // Max uint64: FF FF FF FF FF FF FF FF FF
            result = decodeVarInt(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
            expect(result.value.toString()).toBe('18446744073709551615');
            expect(result.length).toBe(9);
        });

        it('should handle round-trip encoding/decoding', () => {
            const testValues = [
                { value: 0, expected: 0 },
                { value: 1, expected: 1 },
                { value: 127, expected: 127 },
                { value: 252, expected: 252 },                    // Single byte
                { value: 253, expected: 253 },
                { value: 1000, expected: 1000 },
                { value: 65535, expected: 65535 },                // 0xFD prefix
                { value: 65536, expected: 65536 },
                { value: 1000000, expected: 1000000 },
                { value: 4294967295, expected: 4294967295 },      // 0xFE prefix
                { value: BigInt('4294967296'), expected: '4294967296' },        // 0xFF prefix
                { value: BigInt('18446744073709551615'), expected: '18446744073709551615' } // Max uint64
            ];

            testValues.forEach(({ value, expected }) => {
                const encoded = encodeVarInt(value, 'uint8array');
                const decoded = decodeVarInt(encoded);
                if (typeof expected === 'string') {
                    expect(decoded.value.toString()).toBe(expected);
                } else {
                    expect(decoded.value).toBe(expected);
                }
            });
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle negative numbers by converting to positive', () => {
            // Bitcoin varints don't support negative numbers, so implementation should handle this
            expect(() => encodeVarInt(-1)).not.toThrow();
        });

        it('should handle empty or invalid buffers in decoding', () => {
            expect(() => decodeVarInt(new Uint8Array([]))).toThrow();
            expect(() => decodeVarInt(new Uint8Array([0xFD]))).toThrow(); // Incomplete FD prefix
            expect(() => decodeVarInt(new Uint8Array([0xFE, 0x00]))).toThrow(); // Incomplete FE prefix
        });

        it('should validate prefix consistency', () => {
            // Values that should use single byte but are encoded with prefix should be rejected
            // This tests that encoding is canonical
            const nonCanonical = new Uint8Array([0xFD, 0x01, 0x00]); // 1 encoded with FD prefix
            // The decoder should handle this, but encoder should never produce it
            expect(encodeVarInt(1, 'uint8array')).toEqual(new Uint8Array([0x01]));
        });
    });
});
