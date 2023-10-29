import { useCallback, useEffect, useState, useRef, useMemo } from "react";
/* import { useListenNostrEvent } from "hooks/useNostr"; */
import useNostrPool from "hooks/useNostrPool";
import { useSelector, useDispatch } from "react-redux";
import { getPublicKey, nip19 } from "nostr-tools";
import { getLocalRobotPrivateKey } from "lib/utils/index";
import * as Lockr from "lockr";
// import { sleep } from "lib/utils";

const NOSTAR_TOKEN_SEND_TO = process.env.REACT_APP_NOSTR_TOKEN_SEND_TO;
const NOSTR_MARKET_SEND_TO = process.env.REACT_APP_NOSTR_MARKET_SEND_TO;
const NOSTR_MINT_SEND_TO = process.env.REACT_APP_NOSTR_MINT_SEND_TO;
//const NOSTR_CLAIMPPOINTS_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_CLAIMPPOINTS_SEND_TO).data;
const LOCAL_ROBOT_ADDR = nip19.npubEncode(getPublicKey(getLocalRobotPrivateKey()));

export const useLaunchMintActivity = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleLaunchMintActivityAsync = useCallback(
    async ({ asset, amount, number, addressMints, fee }) => {
      const queryCommand = `create activity ${asset} amount ${amount} number ${number} address ${addressMints} fee ${fee}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTR_MINT_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret?.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleLaunchMintActivityAsync
  };
};
export const useAllowance = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const [allowance, setAllowance] = useState(0);

  const { nostrAccount } = useSelector(({ user }) => user);
  const handleQueryAllowanceAsync = useCallback(
    async (tokenName) => {
      if (nostrAccount && tokenName) {
        const queryCommand = `allowance to ${NOSTR_MINT_SEND_TO} by ${nip19.npubEncode(
          nostrAccount
        )} for  ${tokenName}`;
        const ret = await execQueryNostrAsync({
          queryCommand,
          sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
        });
        // console.log("allowance ret", ret);
        if (!ret) {
          setAllowance({ amount: 0, amountShow: "0.0000" });
          return { amount: 0, amountShow: "0.0000" };
        }
        setAllowance(ret.result.data);
        if (ret?.result?.code == 400) {
          return handleQueryAllowanceAsync(tokenName)
        }
        return ret.result;
      }
    },
    [execQueryNostrAsync, nostrAccount]
  );
  const handleQueryAllowance = useCallback(
    async (tokenName) => {
      return await handleQueryAllowanceAsync(tokenName);
    },
    [handleQueryAllowanceAsync]
  );

  return {
    handleQueryAllowance,
    handleQueryAllowanceAsync,
    allowance
  };
};
export const useApprove = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleApproveAsync = useCallback(
    async (approveAmount = 0, tokenName) => {
      const queryCommand = `approve ${approveAmount} ${tokenName} to ${NOSTR_MINT_SEND_TO}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  const handleApproveAsyncByCommand = useCallback(
    async (command) => {
      const queryCommand = command;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleApproveAsync,
    handleApproveAsyncByCommand
  };
};
export const useMintActivity = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleMintActivityAsync = useCallback(
    async (activeId, addressNum) => {
      const queryCommand = `mint activity ${activeId} share ${addressNum}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTR_MINT_SEND_TO,
        isUseLocalRobotToSend: false
      });

      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleMintActivityAsync
  };
};