import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair'
import * as utils from './utils';
import { waitUntilUTXO } from './blockstream_utils'
import ecc from '@bitcoinerlab/secp256k1';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);


//buildPSBT(pkstr, ['eventId'], [{value: 1000000, address:"tb1pa0w5chlch70lwqkf65szf9lpgpla4du6j5appvc420h04uu0xj0sguvtf5"}]);
/* export async function buildPSBT(networkstr, signerPubKey, memeList, targetList) {
  let network = networkstr === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const signer = ECPair.fromPublicKey(Buffer.from(signerPubKey, 'hex'), { network });
  const tweakedSigner = signer.tweak(
    bitcoin.crypto.taggedHash('TapTweak', utils.toXOnly(signer.publicKey)),
  );

  const p2tr = bitcoin.payments.p2tr({
    pubkey: utils.toXOnly(tweakedSigner.publicKey),
    network
  });
  console.info(`p2tr.address ============= ${p2tr.address} =============`);

  const psbt = new bitcoin.Psbt({ network: network, maximumFeeRate: 20 });
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
  let utxos = await waitUntilUTXO(p2tr.address, networkstr);
  let signList = [];
  for (let i = 0; i < utxos.length; i++) {
    if (utxos[i].status.confirmed) {
      // console.info(`UTXO ${JSON.stringify(utxos[i])}`);
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
    }
  }

  const hex = psbt.toHex();
  // let fee = psbt.calculateFee(3);
  console.info(`unsign hex ============= ${hex} ============= `);
  let result = {
    unsignedHex: hex,
    signList: signList
  };

  // console.info(`unsign result ============= ${JSON.stringify(result)} ============= `);
  return result;
} */





