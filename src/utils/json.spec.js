import { describe, it, expect } from '@scintilla-network/litest';
import json from './json.js';

describe('json', () => {
   describe('stringify', () => {
    it('should stringify', () => {
        const input = {
            a: 1,
            b: 2,
        };
        expect(json.stringify(input)).toBe('{"a":1,"b":2}');
    });
   });
   describe('parse', () => {
    it('should parse', () => {
        const input = '{"a":1,"b":2}';
        expect(json.parse(input)).toEqual({
            a: 1,
            b: 2,
        });
    });
   });
   describe('parse with options', () => {
    it('should parse with options', () => {
        const input = '{"a":1,"b":2}';
        expect(json.parse(input, { shouldBigInt: false, shouldUint8Array: true })).toEqual({
            a: 1,
            b: 2,
        });
    });
   });
   describe('parse with options', () => {
    it('should parse with options', () => {
        const input = '{"a":1,"b":2}';
        expect(json.parse(input, { shouldBigInt: true, shouldUint8Array: false })).toEqual({
            a: 1,
            b: 2,
        });
    });
   });
   describe('parse with options', () => {
    it('should parse with options', () => {
        const input = '{"a":1,"b":2}';
        expect(json.parse(input, { shouldBigInt: false, shouldUint8Array: true })).toEqual({
            a: 1,
            b: 2,
        });
    });
   });
   describe('sortObjectByKey', () => {
    it('should sort object by key', () => {
        const input = {
            b: 2,
            a: 1,
        };
        expect(json.sortObjectByKey(input)).toEqual({
            a: 1,
            b: 2,
        });
    });
   });
   describe('sortedJsonByKeyStringify', () => {
    it('should sort object by key and return a JSON string', () => {
        const input = {
            b: 2,
            a: 1,
        };
        expect(json.sortedJsonByKeyStringify(input)).toEqual('{"a":1,"b":2}');
    });
   });
});