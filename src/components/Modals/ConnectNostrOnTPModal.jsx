import { Modal, Timeline, Row, Col, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { setConnectNostrModalVisible } from "store/reducer/modalReducer";
import ConnectWalletButton from "components/Common/ConnectWalletButton";
import IconTPWallet from "img/ico-tp.svg";
// import { t } from "@lingui/macro";
import "./index.scss";
export default function ConnectNostrOnTPModal() {
  const { connectNostrModalVisible } = useSelector(({ modal }) => modal);
  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(setConnectNostrModalVisible(false));
  }, [dispatch]);
  const encodeTPParams = encodeURI(
    JSON.stringify({
      // url: "https://dapp.mytokenpocket.vip/referendum/index.html#/",
      url: location.href,
      chain: "ETH",
      source: ""
    })
  );
  return (
    <>
      {connectNostrModalVisible && (
        <Modal
          width={400}
          wrapClassName="connect-nostr-modal"
          title={"Connect Nostr"}
          centered
          open={connectNostrModalVisible}
          footer={null}
          onCancel={onCancel}
        >
          <p className="connect-nostr-modal-description">
            Need the extension or wallet to connect Nostr and manage your Nostr private key.
          </p>
          <p className="connect-nostr-modal-description">
            Currently, only TP Wallet is supported Nostr on the mobile phone side. You can use TP Wallet to connect or
            copy the URL to go to the web side to operate.
          </p>
          <div className="connect-nostr-modal-btn">
            <ConnectWalletButton imgSrc={IconTPWallet} href={`tpdapp://open?params=${encodeTPParams}`}>
              Open in TP Wallet
            </ConnectWalletButton>
          </div>

          <div className="connect-nostr-modal-link">
            <a href="https://www.tokenpocket.pro/en/download/app" target="_blank">
              Download TP Wallet
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
