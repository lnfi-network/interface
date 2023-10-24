import { Trans, t } from "@lingui/macro";
import { Modal } from "antd";
import ConnectWalletButton from "./ConnectWalletButton";
import connectWalletImg from "img/ic_wallet_24.svg";
import "./ConnectWallet.scss";
import { useNetwork } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { setWalletConnectModalVisible } from "store/reducer/modalReducer";
import { setSelectedTokenPlatForm } from "store/reducer/userReducer";
import { useCallback } from "react";
import { isInTokenPocket, isApple } from "lib/utils/userAgent";
import useNostrDisconnect from "hooks/useNostrDisconnect";

export function ConnectWalletWithOnlyDeposit({ connectType, btnText = t`Connect wallet` }) {
  const { chains } = useNetwork();
  const dispatch = useDispatch();
  const { handleDisconnect } = useNostrDisconnect();
  const selectedTokenPlatform = useSelector(({ user }) => user.selectedTokenPlatform);
  /*   const { selectedTokenPlatform } = useSelector(({ user }) => user); */
  const handleConnect = useCallback(() => {
    // handleDisconnect();
    if (connectType === "switch" && !isInTokenPocket()) {
      handleDisconnect();
    }
    // if (isInTokenPocket() && window?.ethereum?.networkVersion != chains[0].id && isApple()) {
    //   Modal.info({
    //     width: 326,
    //     footer: null,
    //     closable: true,
    //     title: "Check your network",
    //     content: (
    //       <>
    //         <div>{t`​Deposit only supported on Goerli Network at the moment. Switch network in wallet！`}</div>
    //       </>
    //     )
    //   });
    //   return false;
    // }
    // if (selectedTokenPlatform === "BRC20" && isInTokenPocket() && isApple()) {
    //   Modal.info({
    //     width: 326,
    //     footer: null,
    //     closable: true,
    //     title: "Check your network",
    //     content: (
    //       <>
    //         <div>{t`​Deposit only supported on Goerli Network at the moment. Switch network in wallet！`}</div>
    //       </>
    //     )
    //   });
    //   return false;
    // }
    if (selectedTokenPlatform === "BRC20" && isInTokenPocket() && !window.unisat) {
      Modal.info({
        width: 326,
        footer: null,
        closable: true,
        title: "Check your network",
        content: (
          <>
            <div>{t`​You selected an BRC20 token to deposit, please click to switch your wallet connect from ERC20 to BRC20.`}</div>
          </>
        )
      });
      return false;
    }
    if (selectedTokenPlatform === "ERC20" && isInTokenPocket() && window.unisat) {
      Modal.info({
        width: 326,
        footer: null,
        closable: true,
        title: "Check your network",
        content: (
          <>
            <div>{t`You selected an ERC20 token to deposit, please click to switch your wallet connect from BRC20 to Goerli Network.`}</div>
          </>
        )
      });
      return false;
    }
    dispatch(setWalletConnectModalVisible(true));
  }, [connectType, dispatch, handleDisconnect, selectedTokenPlatform]);
  return (
    <div className="connect-wallet-common">
      <ConnectWalletButton size="middle" type="default" onClick={handleConnect} imgSrc={connectWalletImg}>
        {btnText}
      </ConnectWalletButton>
    </div>
  );
}
export default function ConnectWallet({ tokenPlatform = "", connectTip = "Connect your wallet to start trading." }) {
  const dispatch = useDispatch();
  const onConnectHandler = useCallback(() => {
    if (tokenPlatform === "BRC20") {
      dispatch(setSelectedTokenPlatForm("BRC20"));
    }
    dispatch(setWalletConnectModalVisible(true));
  }, [dispatch, tokenPlatform]);
  return (
    <div className="connect-wallet-common">
      <div className="connect-wallet-text">{connectTip}</div>
      <ConnectWalletButton onClick={onConnectHandler} imgSrc={connectWalletImg}>
        <Trans>Connect wallet</Trans>
      </ConnectWalletButton>
    </div>
  );
}
