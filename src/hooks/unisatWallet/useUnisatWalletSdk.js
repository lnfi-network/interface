import { useState, useCallback, useEffect, useRef } from "react";
import { setAccount, setChainId } from 'store/reducer/userReducer'
import { useDispatch } from "react-redux";
export default function useUnisatSdk(connectPlat) {
  const [network, setNetwork] = useState(null);
  const dispatch = useDispatch();
  const [unisatAccount, setUnisatAccount] = useState(null);
  const getAccount = useCallback(async () => {
    const ret = await window.unisat.getAccounts().catch(e => { })
    if (ret && ret.length > 0) {
      setUnisatAccount(ret[0])
      dispatch(setAccount(ret[0]))
    }
    return ret ? ret[0] : null;
  }, [dispatch]);
  const connectUnisat = useCallback(async () => {
    const requestRet = await window.unisat.requestAccounts();
    if (requestRet.length > 0) {
      setUnisatAccount(requestRet[0])
      dispatch(setAccount(requestRet[0]))
    }
    return requestRet
  }, [dispatch]);
  const disconnectUnisat = useCallback(() => {
    setUnisatAccount(null);
    setNetwork(null);
    dispatch(setChainId(null))
  }, [dispatch]);
  const handleAccountsChange = useCallback(async (accounts) => {
    if (accounts && accounts.length > 0) {
      setUnisatAccount(accounts[0]);
      dispatch(setAccount(accounts[0]))
    }
  }, [dispatch])

  const getNetwork = useCallback(async () => {
    const retNetwork = window.unisat.isTokenPocket ? window.unisat.getNetwork() : await window.unisat.getNetwork().catch((e => { }));
    if (retNetwork) {
      setNetwork(retNetwork);
      dispatch(setChainId(retNetwork))
    }
    return retNetwork;
  }, [dispatch]);

  const switchNetwork = useCallback(async (switchTo) => {
    const ret = await unisat.switchNetwork(switchTo);
    if (ret) {
      setNetwork(switchTo);
    }
  }, []);

  const signMessage = useCallback((message) => {
    return window.unisat.signMessage(message);
  }, []);

  const getInscriptions = useCallback((cursor, size) => {
    return window.unisat.getInscriptions(cursor, size);
  }, []);

  const sendInscription = useCallback((to, inscriptionId, options = {}) => {
    return window.unisat.sendInscription(to, inscriptionId, options);
  }, []);

  const getInitStatus = () => {
    return window.unisat._state.initialized;
  };
  const checkIsDestroyed = () => {
    try {
      let isDestroyed = true;
      window.unisat.getAccounts().then((t) => {
        isDestroyed = false;
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          if (!isDestroyed) {
            resolve(false);
          } else {
            resolve(true);
          }
        }, 1000);
      });
    } catch { }
  };

  useEffect(() => {
    if (window.unisat) {
      window.unisat.on("accountsChanged", handleAccountsChange);
      window.unisat.on("networkChanged", switchNetwork);
    }
    return () => {
      if (window.unisat) {
        window.unisat.removeListener("accountsChanged", handleAccountsChange);
        window.unisat.removeListener("networkChanged", switchNetwork);
      }
    };
  }, [handleAccountsChange, switchNetwork]);

  useEffect(() => {
    let timer = null;
    if (window.unisat && connectPlat === 'BTC') {
      timer = setTimeout(() => {
        getAccount();
        getNetwork();
      }, 1000)
    }
    return () => {
      clearTimeout(timer);
    }
  }, [connectPlat, getAccount, getNetwork]);

  return {
    isReady: !!window.unisat,
    network,
    unisatAccount: unisatAccount,
    connectUnisat,
    checkIsDestroyed,
    disconnectUnisat,
    switchNetwork,
    signMessage,
    getAccount,
    getInitStatus,
    getInscriptions,
    sendInscription
  };
}
