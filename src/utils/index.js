import base64 from './base64.js';
import { bech32, bech32m } from './bech32.js';
import { escapeHTML, unescapeHTML } from './escape.js';
import hex from './hex.js';
import json from './json.js';
import makeADR36Doc from './makeADR36Doc.js';
import moniker from './moniker.js';
import uint8array from './uint8array.js';
import utf8 from './utf8.js';
import varint from './varint.js';
import varbigint from './varbigint.js';

export const utils = {
    base64,
    bech32,
    bech32m,
    escape: {
        escapeHTML,
        unescapeHTML,
    },
    hex,
    json,
    makeADR36Doc,
    moniker,
    uint8array,
    utf8,
    varint,
    varbigint,
};

const escape = {
    escapeHTML,
    unescapeHTML,
};

export {
    base64,
    bech32,
    bech32m,
    escape,
    hex,
    json,
    makeADR36Doc,
    moniker,
    uint8array,
    utf8,
    varint,
    varbigint
};

export default utils; 