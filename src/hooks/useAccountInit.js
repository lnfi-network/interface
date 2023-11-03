import { useSelector, useDispatch } from "react-redux";
import { setWalletConnectModalVisible } from "store/reducer/modalReducer";
import { useState, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { initNostrAccount } from "store/reducer/userReducer";
import { setAccount, setChainId, setActive } from "store/reducer/userReducer";
import { isInTokenPocket } from "lib/utils/userAgent";
import useUnisatSdk from 'hooks/unisatWallet/useUnisatWalletSdk'
import * as Lockr from 'lockr'
export default function useAccountInit() {

  const { address, connector, isConnected } = useAccount();
  const { nostrAccount, account } = useSelector(({ user }) => user);
  const { chain } = useNetwork();
  const connectPlat = useSelector(({ user }) => user.connectPlat);
  useUnisatSdk(connectPlat);
  const walletConnectModalVisible = useSelector(({ modal }) => modal.walletConnectModalVisible);
  const dispatch = useDispatch();
  useEffect(() => {
    if (connectPlat === "ETH") {
      dispatch(setAccount(address));
      dispatch(setChainId(chain?.id));
      dispatch(setActive(isConnected));
      if (address && isConnected) {
        if (walletConnectModalVisible) {
          dispatch(setWalletConnectModalVisible(false));
        }
      }
    }
    if (connectPlat === "BTC") {
      dispatch(setActive(!!account));
      if (account) {
        if (walletConnectModalVisible) {
          dispatch(setWalletConnectModalVisible(false));
        }
      }
    }
  }, [account, address, chain?.id, connectPlat, connector, dispatch, isConnected, nostrAccount, walletConnectModalVisible]);
  useEffect(() => {
    const getKey = async () => {
      const albyNostrAccount = await window.nostr.getPublicKey().catch(e => {
        console.log(e.message)
      });
      dispatch(initNostrAccount(albyNostrAccount));
    };
    if (window.nostr && !nostrAccount && !Lockr.get('isUserExit')) {
      getKey()
    }
    return () => null;
  }, [dispatch, nostrAccount]);
  return null;
}
