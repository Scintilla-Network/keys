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
   describe.only('parse option', () =>{
     const el = ' {"version":1,"timestamp":"1759126075415","asset":"sct","inputs":[{"amount":"1000000000000","hash":"0000000000000000000000000000000000000000000000000000000000000000"}],"output":{"amount":"1000000000000","recipient":"scintilla"},"stack":[],"data":[{"description":"Minted coins for the genesis node","moniker":"sct.yggdrasil"}],"timelock":{"startAt":"0","endAt":"0"},"authorizations":[{"signature":"7a1b37e47c30c0e108f71fe5171060d31f51ccb67e8026870f5c18b702ff06d20c2a9f9962bec0bb58252f7931ec13ceeca706bd0a036a757462315997b30031","publicKey":"0303bbaade6de61d2d421532c5c491216abb9f9dcb6f38593e7f92cd150bbf015e","moniker":"sct.yggdrasil","address":"sct1hqy73zkqfdxpc2g4p47g8g39834la94fl2rvsg"}]}';
     console.log(json.parse(el, { shouldBigInt: true, shouldUint8Array: true }));
   })
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