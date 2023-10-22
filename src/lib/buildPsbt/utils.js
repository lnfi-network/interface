// const bitcore = require('bitcore-lib');
import * as varuint from 'bip174/src/lib/converter/varint';
import { crypto } from "bitcoinjs-lib";
export const witnessStackToScriptWitness = function (witness) {
    let buffer = Buffer.allocUnsafe(0)

    function writeSlice(slice) {
        buffer = Buffer.concat([buffer, Buffer.from(slice)])
    }

    function writeVarInt(i) {
        const currentLen = buffer.length;
        const varintLen = varuint.encodingLength(i)

        buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)])
        varuint.encode(i, buffer, currentLen)
    }

    function writeVarSlice(slice) {
        writeVarInt(slice.length)
        writeSlice(slice)
    }

    function writeVector(vector) {
        writeVarInt(vector.length)
        vector.forEach(writeVarSlice)
    }

    writeVector(witness)

    return buffer
}
export const tapTweakHash = function (pubKey, h) {
    return crypto.taggedHash(
        'TapTweak',
        Buffer.concat(h ? [pubKey, h] : [pubKey]),
    );
}
export const toXOnly = function (pubkey) {
    return pubkey.subarray(1, 33);
}

