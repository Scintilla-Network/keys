'use strict';
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/** @type {{ [key: string]: number }} */
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
    const x = ALPHABET.charAt(z);
    ALPHABET_MAP[x] = z;
}

/**
 * @param {number} pre
 * @returns {number}
 */
function polymodStep(pre) {
    const b = pre >> 25;
    return (
        ((pre & 0x1ffffff) << 5) ^
        (-((b >> 0) & 1) & 0x3b6a57b2) ^
        (-((b >> 1) & 1) & 0x26508e6d) ^
        (-((b >> 2) & 1) & 0x1ea119fa) ^
        (-((b >> 3) & 1) & 0x3d4233dd) ^
        (-((b >> 4) & 1) & 0x2a1462b3)
    );
}

/**
 * @param {string} prefix
 * @returns {number | string}
 */
function prefixChk(prefix) {
    let chk = 1;
    for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126) return 'Invalid prefix (' + prefix + ')';

        chk = polymodStep(chk) ^ (c >> 5);
    }
    chk = polymodStep(chk);

    for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (v & 0x1f);
    }
    return chk;
}

/**
 * @param {number[]} data
 * @param {number} inBits
 * @param {number} outBits
 * @param {boolean} pad
 * @returns {number[] | string}
 */
function convert(data, inBits, outBits, pad) {
    let value = 0;
    let bits = 0;
    const maxV = (1 << outBits) - 1;

    /** @type {number[]} */
    const result = [];
    for (let i = 0; i < data.length; ++i) {
        value = (value << inBits) | data[i];
        bits += inBits;

        while (bits >= outBits) {
            bits -= outBits;
            result.push((value >> bits) & maxV);
        }
    }

    if (pad) {
        if (bits > 0) {
            result.push((value << (outBits - bits)) & maxV);
        }
    } else {
        if (bits >= inBits) return 'Excess padding';
        if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
    }

    return result;
}

/**
 * @param {number[]} bytes
 * @returns {number[]}
 */
function toWords(bytes) {
    return /** @type {number[]} */ (convert(bytes, 8, 5, true));
}

/**
 * @param {number[]} words
 * @returns {number[] | undefined}
 */
function fromWordsUnsafe(words) {
    const res = convert(words, 5, 8, false);
    if (Array.isArray(res)) return res;
}

/**
 * @param {number[]} words
 * @returns {number[]}
 */
function fromWords(words) {
    const res = convert(words, 5, 8, false);
    if (Array.isArray(res)) return res;

    throw new Error(/** @type {string} */ (res));
}

/**
 * @param {string} encoding
 */
function getLibraryFromEncoding(encoding) {
    /** @type {number} */
    let ENCODING_CONST;
    if (encoding === 'bech32') {
        ENCODING_CONST = 1;
    } else {
        ENCODING_CONST = 0x2bc830a3;
    }

    /**
     * @param {string} prefix
     * @param {number[]} words
     * @param {number} [LIMIT=90]
     * @returns {string}
     */
    function encode(prefix, words, LIMIT = 90) {
        if (prefix.length + 7 + words.length > LIMIT) throw new TypeError('Exceeds length limit');

        prefix = prefix.toLowerCase();

        let chk = prefixChk(prefix);
        if (typeof chk === 'string') throw new Error(chk);

        let result = prefix + '1';
        for (let i = 0; i < words.length; ++i) {
            const x = words[i];
            if (x >> 5 !== 0) throw new Error('Non 5-bit word');

            chk = polymodStep(chk) ^ x;
            result += ALPHABET.charAt(x);
        }

        for (let i = 0; i < 6; ++i) {
            chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;

        for (let i = 0; i < 6; ++i) {
            const v = (chk >> ((5 - i) * 5)) & 0x1f;
            result += ALPHABET.charAt(v);
        }

        return result;
    }

    /**
     * @param {string} str
     * @param {number} [LIMIT=90]
     * @returns {string | { prefix: string; words: number[] }}
     */
    function __decode(str, LIMIT = 90) {
        if (str.length < 8) return str + ' too short';
        if (str.length > LIMIT) return 'Exceeds length limit';

        const lowered = str.toLowerCase();
        const uppered = str.toUpperCase();
        if (str !== lowered && str !== uppered) return 'Mixed-case string ' + str;
        str = lowered;

        const split = str.lastIndexOf('1');
        if (split === -1) return 'No separator character for ' + str;
        if (split === 0) return 'Missing prefix for ' + str;

        const prefix = str.slice(0, split);
        const wordChars = str.slice(split + 1);
        if (wordChars.length < 6) return 'Data too short';

        let chk = prefixChk(prefix);
        if (typeof chk === 'string') return chk;

        /** @type {number[]} */
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
            const c = wordChars.charAt(i);
            const v = ALPHABET_MAP[c];
            if (v === undefined) return 'Unknown character ' + c;
            chk = polymodStep(chk) ^ v;

            if (i + 6 >= wordChars.length) continue;
            words.push(v);
        }

        if (chk !== ENCODING_CONST) return 'Invalid checksum for ' + str;
        return { prefix, words };
    }

    /**
     * @param {string} str
     * @param {number} [LIMIT]
     * @returns {{ prefix: string; words: number[] } | undefined}
     */
    function decodeUnsafe(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === 'object') return res;
    }

    /**
     * @param {string} str
     * @param {number} [LIMIT]
     * @returns {{ prefix: string; words: number[] }}
     */
    function decode(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === 'object') return res;

        throw new Error(res);
    }

    return {
        decodeUnsafe,
        decode,
        encode,
        toWords,
        fromWordsUnsafe,
        fromWords,
    };
}

const bech32 = getLibraryFromEncoding('bech32');
const bech32m = getLibraryFromEncoding('bech32m');

export { bech32, bech32m };