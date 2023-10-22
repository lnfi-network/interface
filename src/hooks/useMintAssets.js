import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { NOSTAR_TOKEN_SEND_TO } from "config/constants.js";
import { useSelector } from "react-redux";
import useNostrPool from "hooks/useNostrPool";
import { buildPSBT } from "lib/buildPsbt/buildPsbt";
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
const getBuildPSBTResult = async (eventId, fee) => {
  const networkstr = await window.unisat.getNetwork();
  const publicKey = await window.unisat.getPublicKey();
  const memeList = [eventId];

  return await buildPSBT(
    networkstr,
    publicKey,
    memeList,
    [
      { value: 4000, address: "tb1pa0w5chlch70lwqkf65szf9lpgpla4du6j5appvc420h04uu0xj0sguvtf5" },
      { value: 2000, address: "tb1pa0w5chlch70lwqkf65szf9lpgpla4du6j5appvc420h04uu0xj0sguvtf5" }
    ],
    "tb1pa0w5chlch70lwqkf65szf9lpgpla4du6j5appvc420h04uu0xj0sguvtf5",
    fee
  );
};

export const useUnisatPay = () => {
  const { account } = useSelector(({ user }) => user);
  const handleUnisatPay = useCallback(async (eventId) => {
    let sendTx = "";
    if (!window.unisat) {
      throw new Error("No unisat provider.");
    }
    let feeRate = 5;
    let dummy = await getBuildPSBTResult(eventId, 5000);
    let estimateFee = dummy.bytesize * feeRate;

    //const constructPsbtHex = await buildPSBT(networkstr, publicKey, memeList, targetList)
    const constructPsbtRet = await getBuildPSBTResult(eventId, estimateFee);
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
  }, []);

  return {
    handleUnisatPay
  };
};
