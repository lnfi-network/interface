import { Modal, Timeline, Row, Col, message, Typography, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { setConnectNostrModalVisible } from "store/reducer/modalReducer";
import ConnectWalletButton from "components/Common/ConnectWalletButton";
import IconTPWallet from "img/ico-tp.svg";

const { Paragraph } = Typography;
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
          <p className="connect-nostr-modal-description color-dark f12">
            Similar to other Web3 websites, using NostrAssets requires connecting your Nostr account to approve each account operation.
          </p>
          <p className="connect-nostr-modal-description mt10 f12">
            2 ways to connect NostrAssets to Nostr:
          </p>
          <p className="connect-nostr-modal-description b mt10 f12">
            1. Connect via Nostr Web Browser Extensions
          </p>
          <p className="connect-nostr-modal-description f10">
            Eg. Alby Browser Extension which is referred to as the Metamask for Nostr
          </p>
          <p className="connect-nostr-modal-description b mt10 f12">
            2. Use a Nostr-compatible wallet on your mobile device
          </p>
          <p className="connect-nostr-modal-description f10">
            Currently only TP Wallet is the sole supported option for this method.
          </p>
          <div className="connect-nostr-modal-btn">
            {/* <ConnectWalletButton imgSrc={IconTPWallet} href={`tpdapp://open?params=${encodeTPParams}`}>
              Open in TP Wallet
            </ConnectWalletButton> */}
            <Button type="primary" className="open-dapp">
              <a href={`tpdapp://open?params=${encodeTPParams}`}>Connect Nostr in TP Wallet</a>
            </Button>
          </div>
          <div className="connect-nostr-modal-btn">

            <Paragraph
              copyable={{
                text: location.href,
                tooltips: false,
                onCopy: (e) => message.success("Copied"),
                icon: [<Button className="copy-url">
                  Copy URL visit on Web
                </Button>, <Button className="copy-url">
                  Copy URL visit on Web
                </Button>]
              }}
            >
              {/* <Button className="copy-url">
                Copy URL visit on Web
              </Button> */}
            </Paragraph>
          </div>

          <div className="connect-nostr-modal-link">
            <span>No TP Wallet? </span>
            <a href="https://www.tokenpocket.pro/en/download/app" target="_blank">
              Download TP Wallet
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
