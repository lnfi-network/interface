import { erc20ABI } from "@wagmi/core";
import { useNetwork, useBalance, useToken, useContractRead, useContractWrite } from "wagmi";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import { useListenNostrEvent } from "hooks/useNostr";
import { useSelector, useDispatch } from "react-redux";
import useNostrSignMessage from "hooks/useSignMessage";
import CONTRACT_CONFIG from "config/contract";
import ABINostrSwapDeposit from "abis/INostrSwapDeposit.json";
import useUnisatSdk from "hooks/unisatWallet/useUnisatWalletSdk";
import { setIsBindNostrAddress } from "store/reducer/userReducer";
import { useQueryNonce } from "./useNostrMarket";
const NOSTR_ERC20_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).content;
/* 
query is Bind 
*/
export const useQueryBindWallet = () => {
  const { connectPlat } = useSelector(({ user }) => user);
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTR_ERC20_SEND_TO
  });

  const handleQueryIsBindWallet = useCallback(
    async (nostrAddress) => {
      const queryCommand = `get nostr ${nostrAddress}`;

      const ret = await execQueryNostrAsync({
        queryCommand
      });
      if (ret.result.code === 0) {
        const jsonData = JSON.parse(ret.result.data);
        if (jsonData[connectPlat]) {
          dispatch(setIsBindNostrAddress(true));
        } else {
          dispatch(setIsBindNostrAddress(false));
        }
      }
    },
    [connectPlat, dispatch, execQueryNostrAsync]
  );

  return {
    handleQueryIsBindWallet
  };
};
export const useNostrBindWallet = (messageApi) => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTR_ERC20_SEND_TO
  });
  const { handleQueryNonce } = useQueryNonce(NOSTR_ERC20_SEND_TO);
  const signMessage = useNostrSignMessage(false);

  const handleBindWallet = useCallback(
    async (nostrAddress, ercOrbrcAddress, token) => {
      const signstr = `bind ${ercOrbrcAddress} to ${nostrAddress} at ${token}`;
      const signature = await signMessage(signstr).catch((e) => {
        throw new Error("User rejected.");
      });

      if (signature) {
        const nonce = await handleQueryNonce();
        const ret = await execQueryNostrAsync({
          queryCommand: signstr,
          nonce
        });
        return ret.result;
      }
    },
    [execQueryNostrAsync, handleQueryNonce, signMessage]
  );

  return {
    handleBindWallet
  };
};

/* 
deposit
*/
export const useERC20Deposit = (account = "") => {
  const { connectPlat } = useSelector(({ user }) => user);
  const { chain } = useNetwork();
  const USDTADDRESS = CONTRACT_CONFIG[chain?.id]?.currency;
  const PROXY_ADDR = CONTRACT_CONFIG[chain?.id]?.proxy;

  const { data: allowanceValue, refetch: getAllowanceValue } = useContractRead({
    address: USDTADDRESS,
    abi: erc20ABI,
    functionName: "allowance",
    args: [account, PROXY_ADDR],
    enabled: account && connectPlat === "ETH" && !chain?.unsupported
  });

  const { data: balanceData } = useBalance({
    address: account,
    token: USDTADDRESS,
    watch: true,
    cacheTime: 2_000,
    enabled: account && connectPlat === "ETH" && !chain?.unsupported
  });

  const { data: tokenInfo } = useToken({
    address: USDTADDRESS,
    enabled: connectPlat === "ETH" && !chain?.unsupported
  });

  const { writeAsync: handleDepositERC20 } = useContractWrite({
    address: PROXY_ADDR,
    abi: ABINostrSwapDeposit,
    functionName: "deposit",
    enabled: !!account && (connectPlat === "ETH") & !chain?.unsupported
  });
  const { writeAsync: handleApproveAsync } = useContractWrite({
    address: USDTADDRESS,
    abi: erc20ABI,
    functionName: "approve",
    enabled: !!account && (connectPlat === "ETH") & !chain?.unsupported
  });

  return {
    erc20Balance: balanceData?.formatted || 0,
    handleDepositERC20,
    handleApproveAsync,
    getAllowanceValue,
    decimals: tokenInfo?.decimals,
    symbol: tokenInfo?.symbol,
    currencyContractAddress: USDTADDRESS,
    PROXY_ADDR: PROXY_ADDR,
    allowanceValue: allowanceValue
  };
};
export const useBRC20Deposit = () => {
  const { getInscriptions, sendInscription } = useUnisatSdk();
  const handleSendInscription = useCallback(
    async (to, inscriptionId, options) => {
      return await sendInscription(to, inscriptionId, options);
    },
    [sendInscription]
  );
  return {
    getInscriptions,
    handleSendInscription
  };
};
