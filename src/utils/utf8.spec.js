import { describe, it, expect } from '@scintilla-network/litest';
import utf8 from './utf8.js';

describe('utf8', () => {
    it('should convert string to hex', () => {
        const hex = utf8.toHex('Hello, World!');
        expect(hex).toBe('48656c6c6f2c20576f726c6421');
    });

    it('should convert string to uint8array', () => {
        const uint8array = utf8.toUint8Array('Hello, World!');
        expect(uint8array).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
    });

    it('should convert hex to utf8 string', () => {
        const string = utf8.fromHex('48656c6c6f2c20576f726c6421');
        expect(string).toEqual('Hello, World!');
    });

    it('should check if string is utf8', () => {
        const isUtf8 = utf8.isUtf8('Hello, World!');
        expect(isUtf8).toBe(true);
    });

    it('should check if input is not utf8', () => {
        const isUtf8 = utf8.isUtf8(new Uint8Array([0x80]));
        expect(isUtf8).toBe(false);
    });
});