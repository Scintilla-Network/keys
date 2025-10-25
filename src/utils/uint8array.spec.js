import { describe, it, expect } from '@scintilla-network/litest';
import uint8array from './uint8array.js';

describe('uint8array', () => {
    it('should convert uint8array to hex', () => {
        const array = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
        const hex = uint8array.toHex(array);
        expect(hex).toBe('48656c6c6f2c20576f726c6421');
    });
    it('should convert hex to uint8array', () => {
        const hex = '48656c6c6f2c20576f726c6421';
        const array = uint8array.fromHex(hex);
        expect(array).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
    });
    it('should convert object to uint8array', () => {
        const object = {
            message: 'Hello, World!',
            array: new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]),
            a: {
                b: 123,
                c: BigInt(123),
            }
        };
        const array = uint8array.fromObject(object);
        expect(array).toEqual(uint8array.fromHex('7b226d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233227d7d'));
    });
    it('should convert uint8array to object', () => {
        const array = uint8array.fromHex('7b226d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233227d7d');
        const object = uint8array.toObject(array);
        expect(object).toEqual({
            message: 'Hello, World!',
            array: '48656c6c6f2c20576f726c6421', // Caveat 1: Uint8Array is conserved as hex string (from uint8array.fromObject)
            a: {
                b: 123,
                c: '123',// Caveat 2: BigInt is converted to string (from uint8array.fromObject)
            }
        });
    });
    it('should convert string to uint8array', () => {
        const string = 'Hello, World!';
        const array = uint8array.fromString(string);
        expect(array).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]));
    });
    it('should convert uint8array to string', () => {
        const array = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
        const string = uint8array.toString(array);
        expect(string).toBe('Hello, World!');
    });
    it('should convert bigint to uint8array', () => {
        const bigint = 18446744073709551615n;
        const array = uint8array.fromBigInt(bigint);
        expect(array).toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
    });
    it('should convert uint8array to bigint', () => {
        const array = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
        const bigint = uint8array.toBigInt(array);
        expect(bigint).toBe(18446744073709551615n);
    });
    it('should test for isUint8Array', () => {
        expect(uint8array.isUint8Array(new Uint8Array())).toBe(true);
        expect(uint8array.isUint8Array(new ArrayBuffer(8))).toBe(false);
        expect(uint8array.isUint8Array(new ArrayBuffer(8))).toBe(false);
        expect(uint8array.isUint8Array('test')).toBe(false);
        expect(uint8array.isUint8Array(123)).toBe(false);
        expect(uint8array.isUint8Array({})).toBe(false);
        expect(uint8array.isUint8Array(null)).toBe(false);
        expect(uint8array.isUint8Array(undefined)).toBe(false);
    });
    it('should compare two uint8arrays', () => {
        const array1 = new Uint8Array([1, 2, 3]);
        const array2 = new Uint8Array([1, 2, 3]);
        expect(uint8array.equals(array1, array2)).toBe(true);
        const array3 = new Uint8Array([1, 2, 4]);
        expect(uint8array.equals(array1, array3)).toBe(false);

        // Test with large arrays to ensure the Uint32Array check as well
        const array4 = uint8array.fromHex('7b226d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233227d7d');
        const array5 = uint8array.fromHex('7b226d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233227d7d');
        expect(uint8array.equals(array4, array5)).toBe(true);
        // Test on the remaining
        const array6 = uint8array.fromHex('7b226d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233327d7d');
        expect(uint8array.equals(array4, array6)).toBe(false);
        const array7 = uint8array.fromHex('7b236d657373616765223a2248656c6c6f2c20576f726c6421222c226172726179223a223438363536633663366632633230353736663732366336343231222c2261223a7b2262223a3132332c2263223a22313233227d7d');
        expect(uint8array.equals(array4, array7)).toBe(false);
    });
});