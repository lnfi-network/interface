import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair'
import * as utils from './utils';
import { waitUntilUTXO } from './blockstream_utils'
import ecc from '@bitcoinerlab/secp256k1';
const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);


//buildPSBT(pkstr, ['eventId'], [{value: 1000000, address:"tb1pa0w5chlch70lwqkf65szf9lpgpla4du6j5appvc420h04uu0xj0sguvtf5"}]);
export async function buildPSBT(networkstr, signerPubKey, memeList, targetList, dustAddress, fee) {

  let network = networkstr === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const signer = ECPair.fromPublicKey(Buffer.from(signerPubKey, 'hex'), { network });
  const tweakedSigner = signer.tweak(
    bitcoin.crypto.taggedHash('TapTweak', utils.toXOnly(signer.publicKey)),
  );
  // let fee = 3000;
  let inputBTC = 0;
  const p2tr = bitcoin.payments.p2tr({
    pubkey: utils.toXOnly(tweakedSigner.publicKey),
    network
  });
  const psbt = new bitcoin.Psbt({ network: network });
  for (let i = 0; memeList && i < memeList.length; i++) {
    const data = Buffer.from(memeList[i], 'utf8')
    const embed = bitcoin.payments.embed({ data: [data] })
    psbt.addOutput({
      value: 0,
      script: embed.output,
    })
  }
  let total = 0;
  for (let i = 0; targetList && i < targetList.length; i++) {
    total += targetList[i].value;
    psbt.addOutput({
      value: targetList[i].value,
      address: targetList[i].address,
    })
  }

  let utxos = await waitUntilUTXO(p2tr.address, networkstr)
  utxos.sort((v1, v2) => { return v2.value - v1.value });
  console.log("🚀 ~ file: buildPsbt.js:45 ~ buildPSBT ~ utxos:", utxos)
  let signList = [];
  for (let i = 0; i < utxos.length; i++) {
    if (utxos[i].status.confirmed) {
      // console.info(`UTXO===> ${JSON.stringify(utxos[i].value)}`);
      let hash = utxos[i].txid;
      let index = utxos[i].vout;
      let amount = utxos[i].value;
      psbt.addInput({
        hash,
        index,
        witnessUtxo: { value: amount, script: p2tr.output },
        tapInternalKey: utils.toXOnly(signer.publicKey),
      })
      signList.push({ index: psbt.inputCount - 1, address: p2tr.address });
      inputBTC += amount;
      if (inputBTC >= total + fee) {
        break;
      }
    }
  }

  if (inputBTC > total + fee) {
    psbt.addOutput({
      value: inputBTC - total - fee,
      address: dustAddress,
    })
  }

  let len = psbt.toBuffer().byteLength

  const hex = psbt.toHex();

  let result = {
    bytesize: len,
    unsignedHex: hex,
    signList: signList,
    utxos: utxos
  };

  // console.info(`unsign result ============= ${JSON.stringify(result)} ============= `);
  return result;
}
export const sha256 = bitcoin.crypto.sha256;





