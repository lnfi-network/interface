import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useListenNostrEvent } from "hooks/useNostr";
import { useSelector, useDispatch } from "react-redux";
import { setTokenList, setResponseTime } from "store/reducer/marketReducer";
import { setBalanceList, setIsProMode, setProMode } from "store/reducer/userReducer";
import { getPublicKey, nip19 } from "nostr-tools";
import { useNostr } from "lib/nostr-react";
import { useAsyncEffect } from "ahooks";
import { getLocalRobotPrivateKey } from "lib/utils/index";
import useWebln from "./useWebln";
import * as Lockr from "lockr";

const NOSTAR_TOKEN_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).data;
const NOSTR_MARKET_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_MARKET_SEND_TO).data;
const NOSTR_CLAIMPPOINTS_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_CLAIMPPOINTS_SEND_TO).data;
const LOCAL_ROBOT_ADDR = nip19.npubEncode(getPublicKey(getLocalRobotPrivateKey()));
export const useQueryNonce = (sendToRobotAddr) => {
  const npubNostrAccount = useSelector(({ user }) => user.npubNostrAccount);
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: sendToRobotAddr
  });

  const handleQueryNonce = useCallback(async () => {
    const queryCommand = `nonce of ${npubNostrAccount}`;
    const ret = await execQueryNostrAsync({
      queryCommand
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

export const useQueryTokenList = () => {
  const dispatch = useDispatch();
  const { tokenList } = useSelector(({ market }) => market);

  const { connectedRelays } = useNostr();

  const isRelayConnected = useMemo(() => {
    const relay = connectedRelays.find((r) => r.url.indexOf("nostr") > -1);
    if (relay) {
      return true;
    }
    return false;
  }, [connectedRelays]);

  const tokenListRef = useRef(null);
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleQueryTokenList = useCallback(async () => {
    const queryCommand = `token list`;
    const ret = await execQueryNostrAsync({
      queryCommand
    });
    if (ret?.result?.code === 0) {
      const data = ret.result.data;
      dispatch(setTokenList(data));
      Lockr.set("tokenList", data);
    } else {
      const localTokenList = Lockr.get("tokenList") || [];
      dispatch(setTokenList(localTokenList));
    }
    tokenListRef.current = false;
    return ret?.result;
  }, [dispatch, execQueryNostrAsync]);

  useAsyncEffect(async () => {
    if (!tokenListRef.current && isRelayConnected && !tokenList?.length) {
      tokenListRef.current = true;
      handleQueryTokenList();
    }
    return () => {
      tokenListRef.current = false;
    };
  }, [handleQueryTokenList, isRelayConnected]);

  return {
    handleQueryTokenList
  };
};
export const useQueryBalance = () => {
  const dispatch = useDispatch();
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });

  const handleQueryBalance = useCallback(
    async (nostrAddress = LOCAL_ROBOT_ADDR) => {
      const queryCommand = `balance of ${nostrAddress}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      if (ret?.result?.code === 0) {
        const data = ret.result.data;
        dispatch(setBalanceList(data));
      }
    },
    [dispatch, execQueryNostrAsync]
  );

  return {
    handleQueryBalance
  };
};
export const useAllowance = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const [allowance, setAllowance] = useState(0);

  const { nostrAccount } = useSelector(({ user }) => user);
  const handleQueryAllowanceAsync = useCallback(
    async (tokenName) => {
      if (nostrAccount && tokenName) {
        const queryCommand = `allowance to ${process.env.REACT_APP_NOSTR_MARKET_SEND_TO} by ${nip19.npubEncode(
          nostrAccount
        )} for  ${tokenName}`;
        const ret = await execQueryNostrAsync({
          queryCommand
        });

        if (!ret) {
          setAllowance({ amount: 0, amountShow: "0.0000" });
          return { amount: 0, amountShow: "0.0000" };
        }
        setAllowance(ret.result.data);
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
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleApproveAsync = useCallback(
    async (approveAmount = 0, tokenName) => {
      const queryCommand = `approve ${approveAmount} ${tokenName} to ${process.env.REACT_APP_NOSTR_MARKET_SEND_TO}`;

      const ret = await execQueryNostrAsync({
        queryCommand
        // nonce: nonce
      });

      return ret?.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleApproveAsync
  };
};

export const useSendListOrder = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTR_MARKET_SEND_TO
  });

  const handleLimitOrderAsync = useCallback(
    async ({ side, amount, buyTokenName, price, payTokenName }) => {
      const queryCommand = `${side} ${amount} ${buyTokenName} at price ${price} ${payTokenName}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });

      return ret.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleLimitOrderAsync
  };
};

export const useSendMarketOrder = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTR_MARKET_SEND_TO
  });
  // const { handleQueryNonce } = useQueryNonce(NOSTAR_TOKEN_SEND_TO);
  const handleTakeOrderAsync = useCallback(
    async (orderId) => {
      const queryCommand = `take order ${orderId}`;
      const ret = await execQueryNostrAsync({
        queryCommand
        // nonce
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleTakeOrderAsync
  };
};
export const useTransfer = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleTransferAsync = useCallback(
    async ({ token, address, amount }) => {
      const queryCommand = `transfer ${amount} ${token} to ${address}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });

      return ret.result;
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
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleAddAddress = useCallback(
    async ({ name, address }) => {
      const queryCommand = `add address ${address} name ${name}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  const handleRemoveAddress = useCallback(
    async ({ name }) => {
      const queryCommand = `delete ${name} from address book`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleAddAddress,
    handleRemoveAddress
  };
};
export const useAddressBook = () => {
  // const dispatch = useDispatch();
  const npubNostrAccount = useSelector(({ user }) => user.npubNostrAccount);
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const [fetching, setFetching] = useState(false);
  const handleQueryAddressBook = useCallback(async () => {
    setFetching(true);
    const queryCommand = `address book of ${npubNostrAccount}`;
    const ret = await execQueryNostrAsync({
      queryCommand
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
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  // const { handleQueryNonce } = useQueryNonce(NOSTAR_TOKEN_SEND_TO);
  const handleClaimTestnetTokens = useCallback(async () => {
    const queryCommand = `claim`;
    const ret = await execQueryNostrAsync({
      queryCommand
    });
    return ret.result;
  }, [execQueryNostrAsync]);

  return {
    handleClaimTestnetTokens
  };
};
export const useQueryClaimPoints = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTR_CLAIMPPOINTS_SEND_TO
  });
  // const { handleQueryNonce } = useQueryNonce(NOSTR_CLAIMPPOINTS_SEND_TO);
  const handleClaimPoints = useCallback(
    async ({ points, account }) => {
      const queryCommand = `ClaimPoints ${points} ${account}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleClaimPoints
  };
};
export const useCancelOrder = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTR_MARKET_SEND_TO
  });
  // const { nostrAccount } = useSelector(({ user }) => user);
  const handleCancelOrderAsync = useCallback(
    async (orderId) => {
      const queryCommand = `cancel order ${orderId}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );

  return {
    handleCancelOrderAsync
  };
};

export const useNostrPing = () => {
  const { execQueryNostrAsync: execQueryMarketNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTR_MARKET_SEND_TO
  });
  const dispatch = useDispatch();

  const handlePingMarketRobot = useCallback(async () => {
    const queryCommand = `ping ${Date.now()}`;

    const ret = await execQueryMarketNostrAsync({
      queryCommand
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
  }, [dispatch, execQueryMarketNostrAsync]);

  return {
    handlePingMarketRobot
  };
};

export const useListenerTabVisible = () => {
  const [visibilityState, setVisiblityState] = useState(true);
  const { connectedRelays, connectToRelays, disconnectToRelays, setConnectedRelays, onConnect } = useNostr();
  const relayUrls = useSelector(({ basic }) => basic.relayUrls);
  const nostrProviderRelayUrls = useMemo(() => {
    return relayUrls.filter((relayUrl) => relayUrl.link === true).map((relayUrl) => relayUrl.address);
  }, [relayUrls]);
  const timer = useRef(null);
  const connectedUrls = useMemo(() => {
    return connectedRelays.map((connectToRelay) => connectToRelay.url);
  }, [connectedRelays]);
  const { handlePingMarketRobot } = useNostrPing(visibilityState);

  const handlePing = useCallback(() => {
    timer.current = setInterval(() => {
      handlePingMarketRobot();
    }, 5_000);
  }, [handlePingMarketRobot]);

  useEffect(() => {
    handlePing();
    return () => {
      clearInterval(timer.current);
      timer.current = null;
    };
  }, [handlePing]);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible") {
        disconnectToRelays(nostrProviderRelayUrls);
        connectToRelays(nostrProviderRelayUrls);
        handlePing();
      } else {
        setConnectedRelays([]);
        clearInterval(timer.current);
        timer.current = null;
      }
    };
    document.addEventListener("visibilitychange", fn);
    return () => {
      document.removeEventListener("visibilitychange", fn);
      clearInterval(timer.current);
      timer.current = null;
    };
  }, [
    connectToRelays,
    handlePing,
    onConnect,
    connectedUrls,
    disconnectToRelays,
    setConnectedRelays,
    nostrProviderRelayUrls
  ]);
};
export const useWithdraw = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleWithdrawAsync = useCallback(
    async (amount, symbol, receiver) => {
      const queryCommand = `withdraw ${amount} ${symbol} to ${receiver}`;
      const ret = await execQueryNostrAsync({
        queryCommand
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
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const { sendPayment } = useWebln();
  const handleGetWeblnDepositInvoice = useCallback(
    async (amount = 1, to) => {
      const queryCommand = !to ? `deposit ${amount} sats` : `deposit ${amount} sats to ${to}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleGetWeblnDepositInvoice,
    sendPayment
  };
};
export const useWeblnWithdraw = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });

  const handleWeblnWithdrawAsync = useCallback(
    async (amount, invoice) => {
      const queryCommand = `withdraw ${amount} sats to ${invoice}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleWeblnWithdrawAsync
  };
};

export const useTaprootDeposit = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });

  const handleGetTaprootDepositInvoice = useCallback(
    async (amount = 1, to, tokenName) => {
      const queryCommand = !to ? `deposit ${amount} ${tokenName}` : `deposit ${amount} ${tokenName} to ${to}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleGetTaprootDepositInvoice,
  };
};
export const useTaprootWithdraw = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });

  const handleTaprootWithdrawAsync = useCallback(
    async (amount, invoice, tokenName) => {
      const queryCommand = `withdraw ${amount} ${tokenName} to ${invoice}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleTaprootWithdrawAsync
  };
};
export const useTaprootDecode = () => {
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    isProxyReceiverEnable: false,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });

  const handleTaprootDecodeAsync = useCallback(
    async (encodeInvoice) => {
      const queryCommand = `taproot decode ${encodeInvoice}`;
      const ret = await execQueryNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execQueryNostrAsync]
  );
  return {
    handleTaprootDecodeAsync
  };
};
export const useMode = () => {
  const dispatch = useDispatch();
  const { proMode } = useSelector(({ user }) => user)
  const { execQueryNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const { execQueryNostrAsync: execNostrAsync } = useListenNostrEvent({
    isUseLocalRobotToSend: false,
    isProxyReceiverEnable: true,
    sendToNostrAddress: NOSTAR_TOKEN_SEND_TO
  });
  const handleQueryMode = useCallback(async (nostrAccount) => {
    const queryCommand = `query mode of ${nostrAccount}`;
    const ret = await execQueryNostrAsync({
      queryCommand
    });
    if (ret.result.code === 0) {
      if (ret.result.data === "NORMAL_MODE_CURRENT") {
        dispatch(setProMode({ ...proMode, value: false, hasInit: true }));
      } else {
        dispatch(setProMode({ ...proMode, value: true, hasInit: true }));
      }
    }
    return ret.result;
  }, [dispatch, execQueryNostrAsync, proMode]);
  const handleChangeMode = useCallback(
    async (openOrClose) => {
      const queryCommand = `${openOrClose} pro mode`;
      const ret = await execNostrAsync({
        queryCommand
      });
      return ret.result;
    },
    [execNostrAsync]
  );
  return {
    handleQueryMode,
    handleChangeMode
  };
};
