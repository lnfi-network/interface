import { useSelector } from "react-redux";
import { buildPSBT, sha256 } from "lib/buildPsbt/buildPsbt";
import { validate, getAddressInfo } from 'bitcoin-address-validation';
import { useCallback } from 'react'
const getBuildPSBTResult = async (eventId, fee, account) => {
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
  );
};
export const useUnisatPayfee = () => {
  const { account, chainId } = useSelector(({ user }) => user);
  const handleUnisatPay = useCallback(async (buildParam, needEncode = false) => {
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
    const balance = await window.unisat.getBalance().catch(e => {
      return {
        confirmed: 0,
        unconfirmed: 0
      }
    });

    if (balance?.confirmed === 0) {
      throw new Error("Insufficient Balance.")
    }
    const willBuildParam = needEncode ? sha256(buildParam) : buildParam
    console.log("🚀 ~ file: useWithdrawPayfee.js:56 ~ handleUnisatPay ~ willBuildParam:", willBuildParam);

    let feeRate = 5;
    let dummy = await getBuildPSBTResult(willBuildParam, 5000, account);
    let estimateFee = dummy.bytesize * feeRate;

    const constructPsbtRet = await getBuildPSBTResult(willBuildParam, estimateFee, account);
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
  }
}