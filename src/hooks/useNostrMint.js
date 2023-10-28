import { useCallback, useEffect, useState, useRef, useMemo } from "react";
/* import { useListenNostrEvent } from "hooks/useNostr"; */
import useNostrPool from "hooks/useNostrPool";
import { useSelector, useDispatch } from "react-redux";
import { setTokenList, setResponseTime } from "store/reducer/marketReducer";
import { setBalanceList, setProMode } from "store/reducer/userReducer";
import { getPublicKey, nip19 } from "nostr-tools";
import { useDebounceEffect } from "ahooks";
import { getLocalRobotPrivateKey } from "lib/utils/index";
import useWebln from "./useWebln";
import * as Lockr from "lockr";
// import { sleep } from "lib/utils";

const NOSTAR_TOKEN_SEND_TO = process.env.REACT_APP_NOSTR_TOKEN_SEND_TO;
const NOSTR_MARKET_SEND_TO = process.env.REACT_APP_NOSTR_MARKET_SEND_TO;
const NOSTR_MINT_SEND_TO = process.env.REACT_APP_NOSTR_MINT_SEND_TO;
//const NOSTR_CLAIMPPOINTS_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_CLAIMPPOINTS_SEND_TO).data;
const LOCAL_ROBOT_ADDR = nip19.npubEncode(getPublicKey(getLocalRobotPrivateKey()));
export const useQueryNonce = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const npubNostrAccount = useSelector(({ user }) => user.npubNostrAccount);

  const handleQueryNonce = useCallback(async () => {
    const queryCommand = `nonce of ${npubNostrAccount}`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
    });
    if (ret?.result?.code === 0) {
      const data = ret.result.data;
      return data?.nonce !== undefined ? data.nonce + 1 : null;
    }
    return null;
  }, [execQueryNostrAsync, npubNostrAccount]);

  return {
    handleQueryNonce
  };
};
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
export const useQueryTokenList = () => {
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useNostrPool();
  const hasRelayConnected = useSelector(({ relay }) => relay.hasRelayConnected);
  const handleQueryTokenList = useCallback(async () => {
    const queryCommand = `token list`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
    });
    if (ret?.result?.code === 0) {
      const data = ret.result.data;
      dispatch(setTokenList(data));
      Lockr.set("tokenList", data);
    } else {
      const localTokenList = Lockr.get("tokenList") || [];
      dispatch(setTokenList(localTokenList));
    }
    return ret?.result;
  }, [dispatch, execQueryNostrAsync]);
  useDebounceEffect(
    () => {
      if (hasRelayConnected) {
        handleQueryTokenList();
      }
    },
    [handleQueryTokenList],
    {
      wait: 200
    }
  );
  return {
    handleQueryTokenList
  };
};
export const useHandleQueryTokenList = () => {
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useNostrPool();
  // const hasRelayConnected = useSelector(({ relay }) => relay.hasRelayConnected);
  const handleQueryTokenList = useCallback(async () => {
    const queryCommand = `token list`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
    });
    if (ret?.result?.code === 0) {
      const data = ret.result.data;
      dispatch(setTokenList(data));
      Lockr.set("tokenList", data);
    } else {
      const localTokenList = Lockr.get("tokenList") || [];
      dispatch(setTokenList(localTokenList));
    }
    return ret?.result;
  }, [dispatch, execQueryNostrAsync]);
  return {
    handleQueryTokenList
  };
};
export const useQueryBalance = () => {
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useNostrPool();
  const handleQueryBalance = useCallback(
    async (nostrAddress = LOCAL_ROBOT_ADDR) => {
      if (!nostrAddress) return;
      const queryCommand = `balance of ${nostrAddress}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      if (ret?.result?.code === 0) {
        const data = ret.result.data;
        dispatch(setBalanceList(data));
      } else {
        handleQueryBalance(nostrAddress)
      }
    },
    [dispatch, execQueryNostrAsync]
  );

  return {
    handleQueryBalance
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



export const useSendMarketOrder = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleTakeOrderAsync = useCallback(
    async (orderId) => {
      const queryCommand = `take order ${orderId}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTR_MARKET_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleTakeOrderAsync
  };
};
export const useTransfer = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleTransferAsync = useCallback(
    async ({ token, address, amount }) => {
      const queryCommand = `transfer ${amount} ${token} to ${address}`;
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
    handleTransferAsync
  };
};

/* 
  query address book
*/
export const useAddAddressBook = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleAddAddress = useCallback(
    async ({ name, address }) => {
      const queryCommand = `add address ${address} name ${name}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  const handleRemoveAddress = useCallback(
    async ({ name }) => {
      const queryCommand = `delete ${name} from address book`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleAddAddress,
    handleRemoveAddress
  };
};
export const useAddressBook = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const npubNostrAccount = useSelector(({ user }) => user.npubNostrAccount);
  const [fetching, setFetching] = useState(false);
  const handleQueryAddressBook = useCallback(async () => {
    setFetching(true);
    const queryCommand = `address book of ${npubNostrAccount}`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      isUseLocalRobotToSend: true,
      sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
    });
    setFetching(false);
    return ret?.result;
  }, [execQueryNostrAsync, npubNostrAccount]);

  return {
    fetching,
    handleQueryAddressBook
  };
};
export const useQueryClaimTestnetTokens = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleClaimTestnetTokens = useCallback(async () => {
    const queryCommand = `claim`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      isUseLocalRobotToSend: false,
      sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
    });
    return ret?.result;
  }, [execQueryNostrAsync]);

  return {
    handleClaimTestnetTokens
  };
};
export const useQueryClaimPoints = () => {
  const { execQueryNostrAsync } = useNostrPool();
  // const { handleQueryNonce } = useQueryNonce(NOSTR_CLAIMPPOINTS_SEND_TO);
  const handleClaimPoints = useCallback(
    async ({ points, account }) => {
      const queryCommand = `ClaimPoints ${points} ${account}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTR_CLAIMPPOINTS_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleClaimPoints
  };
};
export const useCancelOrder = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleCancelOrderAsync = useCallback(
    async (orderId) => {
      const queryCommand = `cancel order ${orderId}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTR_MARKET_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleCancelOrderAsync
  };
};

export const useNostrPing = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const dispatch = useDispatch();
  const handlePingMarketRobot = useCallback(async () => {
    const queryCommand = `ping ${Date.now()}`;
    const ret = await execQueryNostrAsync({
      queryCommand,
      isUseLocalRobotToSend: true,
      sendToNostrAddress: NOSTR_MARKET_SEND_TO
    });
    if (!ret?.result?.code === 0) {
      console.error(ret.result.data);
    } else {
      const timeArr = ret.result.data.split(/\s+/);
      const responseTime = timeArr[2] - timeArr[1];
      if (!Number.isNaN(responseTime)) {
        dispatch(setResponseTime(responseTime));
      }
    }
  }, [dispatch, execQueryNostrAsync]);

  return {
    handlePingMarketRobot
  };
};

export const useWithdraw = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleWithdrawAsync = useCallback(
    async (amount, symbol, receiver) => {
      const queryCommand = `withdraw ${amount} ${symbol} to ${receiver}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,

        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleWithdrawAsync
  };
};
export const useWeblnDeposit = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const { sendPayment } = useWebln();
  const handleGetWeblnDepositInvoice = useCallback(
    async (amount = 1, to) => {
      const queryCommand = !to ? `deposit ${amount} sats` : `deposit ${amount} sats to ${to}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleGetWeblnDepositInvoice,
    sendPayment
  };
};
export const useWeblnWithdraw = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleWeblnWithdrawAsync = useCallback(
    async (amount, invoice, txhash) => {
      const queryCommand = `withdraw ${amount} sats to ${invoice} txhash ${txhash}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleWeblnWithdrawAsync
  };
};

export const useTaprootDeposit = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleGetTaprootDepositInvoice = useCallback(
    async (amount = 1, to, tokenName) => {
      const queryCommand = !to ? `deposit ${amount} ${tokenName}` : `deposit ${amount} ${tokenName} to ${to}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleGetTaprootDepositInvoice
  };
};
export const useTaprootWithdraw = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleTaprootWithdrawAsync = useCallback(
    async (amount, invoice, tokenName, txHash) => {
      const queryCommand = `withdraw ${amount} ${tokenName} to ${invoice} txhash ${txHash}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleTaprootWithdrawAsync
  };
};
export const useTaprootDecode = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleTaprootDecodeAsync = useCallback(
    async (encodeInvoice) => {
      const queryCommand = `taproot decode ${encodeInvoice}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: true,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleTaprootDecodeAsync
  };
};
export const useMode = () => {
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useNostrPool();
  const handleQueryMode = useCallback(
    async (nostrAccount) => {
      const queryCommand = `query mode of ${nostrAccount}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: true,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      if (ret?.result?.code === 0) {
        if (ret.result.data === "NORMAL_MODE_CURRENT") {
          dispatch(setProMode({ value: false, hasInit: true }));
        } else {
          dispatch(setProMode({ value: true, hasInit: true }));
        }
      }
      return ret?.result;
    },
    [dispatch, execQueryNostrAsync]
  );
  const handleChangeMode = useCallback(
    async (openOrClose) => {
      const queryCommand = `${openOrClose} pro mode`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleQueryMode,
    handleChangeMode
  };
};
export const useImportAsset = () => {
  const { execQueryNostrAsync } = useNostrPool();
  const handleImportAsset = useCallback(
    async ({ id, symbol, decimals, display, universe }) => {
      // const queryCommand = universe
      //   ? `tapcli sync asset id ${id} from universe ${universe}`
      //   : `tapcli import asset id ${id}`;
      const queryCommand = universe
        ? `tapcli sync asset id ${id} from universe ${universe} symbol ${symbol} decimals ${decimals} display ${display}`
        : `tapcli import asset id ${id} symbol ${symbol} decimals ${decimals} display ${display}`;
      console.log("queryCommand", queryCommand);
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleImportAsset
  };
};

export const useAirdropClaim = () => {
  const { execQueryNostrAsync } = useNostrPool();

  const handleTrickOrTreat = useCallback(
    async (trickOrTreat) => {
      const queryCommand = `${trickOrTreat}`;
      const ret = await execQueryNostrAsync({
        queryCommand,
        isUseLocalRobotToSend: false,
        sendToNostrAddress: NOSTR_MARKET_SEND_TO
      });
      return ret?.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleTrickOrTreat
  };
};
