import { describe, it, expect } from '@scintilla-network/litest';
import base64 from './base64.js';

describe('Base64 RFC 4648 Implementation', () => {
    // Test data: "Hello, World!" string
    const testString = 'Hello, World!';
    const testBase64 = 'SGVsbG8sIFdvcmxkIQ==';
    const testUint8Array = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
    const testHex = '48656c6c6f2c20576f726c6421';

    describe('Base64 to other formats', () => {
        it('should convert base64 to uint8array', () => {
            const result = base64.toUint8Array(testBase64);
            expect(result).toEqual(testUint8Array);
        });

        it('should convert base64 to hex', () => {
            const result = base64.toHex(testBase64);
            expect(result).toBe(testHex);
        });

        it('should convert base64 to string', () => {
            const result = base64.toString(testBase64);
            expect(result).toBe(testString);
        });
    });

    describe('Other formats to Base64', () => {
        it('should convert uint8array to base64', () => {
            const result = base64.fromUint8Array(testUint8Array);
            expect(result).toBe(testBase64);
        });

        it('should convert hex to base64', () => {
            const result = base64.fromHex(testHex);
            expect(result).toBe(testBase64);
        });

        it('should convert string to base64', () => {
            const result = base64.fromString(testString);
            expect(result).toBe(testBase64);
        });
    });

    describe('Round-trip conversions', () => {
        it('should handle base64 -> uint8array -> base64', () => {
            const bytes = base64.toUint8Array(testBase64);
            const backToBase64 = base64.fromUint8Array(bytes);
            expect(backToBase64).toBe(testBase64);
        });

        it('should handle string -> base64 -> string', () => {
            const encoded = base64.fromString(testString);
            const decoded = base64.toString(encoded);
            expect(decoded).toBe(testString);
        });

        it('should handle hex -> base64 -> hex', () => {
            const encoded = base64.fromHex(testHex);
            const decoded = base64.toHex(encoded);
            expect(decoded).toBe(testHex);
        });
    });

    describe('Edge cases and special characters', () => {
        it('should handle empty inputs', () => {
            expect(base64.toUint8Array('')).toEqual(new Uint8Array([]));
            expect(base64.toHex('')).toBe('');
            expect(base64.fromHex('')).toBe('');
            expect(base64.toString('')).toBe('');
            expect(base64.fromString('')).toBe('');
            expect(base64.fromUint8Array(new Uint8Array([]))).toBe('');
        });

        it('should handle single character', () => {
            const singleChar = 'A';
            const singleCharBase64 = 'QQ==';
            const singleCharBytes = new Uint8Array([65]);
            const singleCharHex = '41';

            expect(base64.fromString(singleChar)).toBe(singleCharBase64);
            expect(base64.toString(singleCharBase64)).toBe(singleChar);
            expect(base64.toUint8Array(singleCharBase64)).toEqual(singleCharBytes);
            expect(base64.fromUint8Array(singleCharBytes)).toBe(singleCharBase64);
            expect(base64.toHex(singleCharBase64)).toBe(singleCharHex);
            expect(base64.fromHex(singleCharHex)).toBe(singleCharBase64);
        });

        it('should handle two characters', () => {
            const twoChars = 'Hi';
            const twoCharsBase64 = 'SGk=';
            const twoCharsBytes = new Uint8Array([72, 105]);

            expect(base64.fromString(twoChars)).toBe(twoCharsBase64);
            expect(base64.toString(twoCharsBase64)).toBe(twoChars);
            expect(base64.toUint8Array(twoCharsBase64)).toEqual(twoCharsBytes);
            expect(base64.fromUint8Array(twoCharsBytes)).toBe(twoCharsBase64);
        });

        it('should handle Unicode characters', () => {
            const unicodeString = 'Hello 世界! 🌍';
            const encoded = base64.fromString(unicodeString);
            const decoded = base64.toString(encoded);
            expect(decoded).toBe(unicodeString);
        });

        it('should handle binary data (all byte values)', () => {
            const binaryData = new Uint8Array(256);
            for (let i = 0; i < 256; i++) {
                binaryData[i] = i;
            }
            
            const encoded = base64.fromUint8Array(binaryData);
            const decoded = base64.toUint8Array(encoded);
            expect(decoded).toEqual(binaryData);
        });
    });

    describe('RFC 4648 compliance', () => {
        it('should use correct base64 alphabet', () => {
            // Test specific byte patterns that use different parts of the alphabet
            const testCases = [
                { bytes: new Uint8Array([0]), expected: 'AA==' },
                { bytes: new Uint8Array([255]), expected: '/w==' },
                { bytes: new Uint8Array([0, 0]), expected: 'AAA=' },
                { bytes: new Uint8Array([255, 255]), expected: '//8=' },
                { bytes: new Uint8Array([0, 0, 0]), expected: 'AAAA' },
                { bytes: new Uint8Array([255, 255, 255]), expected: '////' }
            ];

            testCases.forEach(({ bytes, expected }) => {
                const result = base64.fromUint8Array(bytes);
                expect(result).toBe(expected);
                
                // Verify round-trip
                const decoded = base64.toUint8Array(result);
                expect(decoded).toEqual(bytes);
            });
        });

        it('should handle padding correctly', () => {
            const testCases = [
                { input: 'QQ==', expectedLength: 1 }, // 1 byte
                { input: 'SGk=', expectedLength: 2 }, // 2 bytes  
                { input: 'SGVs', expectedLength: 3 }, // 3 bytes (no padding)
            ];

            testCases.forEach(({ input, expectedLength }) => {
                const decoded = base64.toUint8Array(input);
                expect(decoded.length).toBe(expectedLength);
                
                // Verify round-trip maintains padding
                const reencoded = base64.fromUint8Array(decoded);
                expect(reencoded).toBe(input);
            });
        });
    });

    describe('Error handling', () => {
        it('should handle invalid base64 characters gracefully', () => {
            // Invalid characters should either be ignored or cause graceful failure
            const invalidBase64 = 'SGVsbG8@IFdvcmxkIQ=='; // @ is not valid base64
            expect(() => base64.toUint8Array(invalidBase64)).not.toThrow();
        });

        it('should handle malformed base64 strings', () => {
            const malformedInputs = [
                'SGVsbG8', // Missing padding
                'SGVsbG8=', // Incorrect padding
                'SGVsbG8===', // Too much padding
            ];

            malformedInputs.forEach(input => {
                expect(() => base64.toUint8Array(input)).not.toThrow();
            });
        });
    });
});