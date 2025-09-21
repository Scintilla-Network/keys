import { sha256 } from "@scintilla-network/hashes/classic";
import { HARDENED_OFFSET } from "../config.js";

/**
 * Derives a moniker path
 * @param {string} moniker
 * @param {boolean} [hardened=true]
 * @returns {Object}
 */
export function deriveMonikerPath(moniker, hardened = true) {
    if (typeof moniker !== 'string') {
        throw new Error('Moniker must be a string');
    }

    const hash = sha256(moniker);
    const truncatedHash = hash.slice(0, 6);
    
    const monikerBigInt = BigInt('0x' + Array.from(truncatedHash.slice(0, 3)).map(b => b.toString(16).padStart(2, '0')).join(''));
    const checksumBigInt = BigInt('0x' + Array.from(truncatedHash.slice(3, 6)).map(b => b.toString(16).padStart(2, '0')).join(''));
    // Encode the moniker and checksum to a number for distribution
    const monikerAsNumber = Number((monikerBigInt * BigInt(HARDENED_OFFSET - 1) / BigInt(0xFFFFFF)) + BigInt(1));
    const checksumAsNumber = Number((checksumBigInt * BigInt(HARDENED_OFFSET - 1) / BigInt(0xFFFFFF)) + BigInt(1));
    
    const path = (hardened) ? `m/2'/${monikerAsNumber}'/${checksumAsNumber}'` : `m/2'/${monikerAsNumber}'/${checksumAsNumber}'`

    return {
        path,
        monikerAsNumber,
        checksumAsNumber,
        truncatedHash,
        fullHash: hash
    };
}

/**
 * Derives a shared moniker path
 * @param {string} moniker1
 * @param {string} moniker2
 * @param {boolean} [hardened=true]
 * @returns {Object}
 */
export function deriveSharedMonikerPath(moniker1, moniker2, hardened = true) {
    if (typeof moniker1 !== 'string' || typeof moniker2 !== 'string') {
        throw new Error('Moniker and sharedWithMoniker must be strings');
    }
    
    const hash = sha256(moniker1 + moniker2);
    const truncatedHash = hash.slice(0, 6);

    const moniker1AsNumber = Number(BigInt('0x' + Array.from(truncatedHash.slice(0, 3)).map(b => b.toString(16).padStart(2, '0')).join('')));
    const moniker2AsNumber = Number(BigInt('0x' + Array.from(truncatedHash.slice(3, 6)).map(b => b.toString(16).padStart(2, '0')).join('')));
    
    const path = (hardened) ? `m/2'/${moniker1AsNumber}'/${moniker2AsNumber}'` : `m/2'/${moniker1AsNumber}/${moniker2AsNumber}`
    
    return {
        path,
        moniker1AsNumber,
        moniker2AsNumber,
        truncatedHash,
        fullHash: hash
    };
}

/**
 * Validates a moniker
 * @param {string} moniker
 * @returns {boolean}
 */
export function validateMoniker(moniker) {
    if (typeof moniker !== 'string') {
        throw new Error('Moniker must be a string');
    }
    
    if (moniker.length < 2) {
        throw new Error('Moniker cannot be empty');
    }
    // TODO: Additional validation rules
    return true;
} 