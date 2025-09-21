import { describe, it, expect } from '@scintilla-network/litest';
import { escapeHTML, unescapeHTML } from './escape.js';

describe('escape', () => {
    it('should escape HTML', () => {
        const input = '<div>Hello, World!</div>';
        expect(escapeHTML(input)).toBe('\\u003cdiv\\u003eHello, World!\\u003c/div\\u003e');
    });
    it('should unescape HTML', () => {
        const input = '\\u003cdiv\\u003eHello, World!\\u003c/div\\u003e';
        expect(unescapeHTML(input)).toBe('<div>Hello, World!</div>');
    });
});