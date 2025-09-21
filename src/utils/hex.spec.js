import { describe, it, expect } from '@scintilla-network/litest';
import hex from './hex.js';

describe('hex', () => {
    it('should check if input is hex', () => {
        const input = '48656c6c6f2c20576f726c6421';
        expect(hex.isHex(input)).toBe(true);
    });
    it('should check if input is not hex', () => {
        const input = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
        expect(hex.isHex(input)).toBe(false);
    });

    it('should convert hex to uint8array', () => {
        const input = '48656c6c6f2c20576f726c6421';
        expect(hex.toUint8Array(input)).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
    });
    it('should convert uint8array to hex', () => {
        const input = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
        expect(hex.fromUint8Array(input)).toBe('48656c6c6f2c20576f726c6421');
    });
    it('should convert hex to string', () => {
        const string = hex.toString('48656c6c6f2c20576f726c6421');
        expect(string).toBe('Hello, World!');
    });
});