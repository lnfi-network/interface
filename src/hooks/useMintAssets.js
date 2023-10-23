import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { NOSTAR_TOKEN_SEND_TO } from "config/constants.js";
import { useSelector } from "react-redux";
import useNostrPool from "hooks/useNostrPool";
import { buildPSBT } from "lib/buildPsbt/buildPsbt";
import { validate, getAddressInfo } from 'bitcoin-address-validation';
export const useMintAsset = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleCreateAssetAsync = useCallback(
    async ({ encodeAssetData }) => {
      const queryCommand = `create new data ${encodeAssetData}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret;
    },
    [execQueryNostrAsync]
  );
  const handleUpdateAssetAsync = useCallback(
    async ({ id, encodeAssetData }) => {
      const queryCommand = `create save id ${id} data ${encodeAssetData}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret;
    },
    [execQueryNostrAsync]
  );
  const handleCreateMintPayAsync = useCallback(
    async ({ id, txId, encodeAssetData }) => {
      const queryCommand = `create pay id ${id} txHash ${txId} data ${encodeAssetData}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret;
    },
    [execQueryNostrAsync]
  );
  return {
    handleCreateAssetAsync,
    handleUpdateAssetAsync,
    handleCreateMintPayAsync
  };
};
const getBuildPSBTResult = async (eventId, fee, account, utxos) => {
  const networkstr = await window.unisat.getNetwork();
  const publicKey = await window.unisat.getPublicKey();
  const memeList = [eventId];

  return await buildPSBT(
    networkstr,
    publicKey,
    memeList,
    [
      { value: 1000, address: process.env.REACT_APP_GAS_ADDR },
      { value: 200, address: process.env.REACT_APP_TREASURY_ADDR }
    ],
    account,
    fee,
    utxos
  );
};

export const useUnisatPay = () => {
  const { account, chainId } = useSelector(({ user }) => user);
  const handleUnisatPay = useCallback(async (eventId) => {
    let sendTx = "";
    if (!window.unisat) {
      throw new Error("No unisat provider.");
    }
    if (!validate(account)) {
      throw new Error("Invalid account");
    }
    const addressInfo = getAddressInfo(account)
    if (addressInfo.type !== 'p2tr') {
      throw new Error("Invalid account,Please switch your address type to P2RT.")
    }
    if (process.env.REACT_APP_CURRENT_ENV === 'prod') {
      if (chainId === 'testnet') {
        throw new Error("Please switch the network to mainnet.")
      }
    } else {
      if (chainId === 'mainnet') {
        throw new Error("Please switch the network to testnet.")
      }
    }
    // check balance
    const balance = await window.unisat.getBalance();
    if (!balance?.confirmed) {
      throw new Error("Insufficient Balance.")
    }
    let feeRate = 5;
    let dummy = await getBuildPSBTResult(eventId, 5000, account);
    let estimateFee = dummy.bytesize * feeRate;
    let utxos = dummy.utxos;

    const constructPsbtRet = await getBuildPSBTResult(eventId, estimateFee, account, utxos);
    console.log("🚀 ~ file: useMintAssets.js:85 ~ handleUnisatPay ~ constructPsbtRet:", constructPsbtRet);
    if (!constructPsbtRet) {
      throw new Error("Create Psbt failed.");
    }
    const { signList, unsignedHex } = constructPsbtRet;
    const signedPsbt = await window.unisat.signPsbt(unsignedHex, {
      autoFinalized: true,
      toSignInputs: [...signList]
    });

    if (signedPsbt) {
      sendTx = await window.unisat.pushPsbt(signedPsbt);
    }
    return sendTx;
  }, [account, chainId]);

  return {
    handleUnisatPay
  };
};
