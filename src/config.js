export const BITCOIN_VERSIONS = {
    private: 0x0488ade4,  // xprv - Legacy
    public: 0x0488b21e,   // xpub - Legacy
    bip84Private: 0x04b2430c,  // zprv - Native SegWit
    bip84Public: 0x04b24746   // zpub - Native SegWit
};

export const HARDENED_OFFSET = 0x80000000;

export const DEFAULT_DERIVATION_PATH = "m/44'/8888'/0'/0/0";

export const MASTER_SECRET = new TextEncoder().encode('Scintilla seed');

export const KEY_SIZES = {
    PRIVATE_KEY: 32,
    CHAIN_CODE: 32,
    PUBLIC_KEY: 33,
    EXTENDED_KEY: 78  // version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
}; 