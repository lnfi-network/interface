import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button, Tabs, notification } from "antd";
import { setWalletConnectModalVisible } from "store/reducer/modalReducer";
import { useDispatch, useSelector } from "react-redux";
import { Trans, t } from "@lingui/macro";
import metamaskImg from "img/metamask.png";
import coinbaseImg from "img/coinbaseWallet.png";
import walletConnectImg from "img/walletconnect-circle-blue.svg";
import tpConnectImg from "img/ico-tp.svg";
import unisatImg from "img/unisat.png";
import { setAccount, setConnectPlat, setSelectedTokenPlatForm } from "store/reducer/userReducer";
import { useConnect } from "wagmi";
import * as Lockr from "lockr";
import { isInTokenPocket } from "lib/utils/userAgent";
import ExternalLink from "components/ExternalLink/ExternalLink";
import useUnisatSdk from "hooks/unisatWallet/useUnisatWalletSdk";

/* 
  name: metaMask  coinbaseWallet  injected
*/
const getConnectorById = (connectors, id) => {
  return connectors.find((connector) => connector.id === id);
};

function ERCWalletConnectButton() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const dispatch = useDispatch();
  const { account } = useSelector(({ user }) => user);
  const metaMaskConnector = getConnectorById(connectors, "metaMask");
  const coinbaseConnector = getConnectorById(connectors, "coinbaseWallet");
  const injectedConnector = getConnectorById(connectors, "injected");
  const walletConnectConnector = getConnectorById(connectors, "walletConnect");

  const [noticeApi, contextHolder] = notification.useNotification();
  const handleSetConnectPlat = useCallback(() => {
    Lockr.set("connectPlat", "ETH");
    dispatch(setConnectPlat("ETH"));
    dispatch(setSelectedTokenPlatForm("ERC20"));
  }, [dispatch]);
  const handleConnectMetaMask = useCallback(() => {
    if (!metaMaskConnector.ready) {
      noticeApi.warning({
        duration: 3000,
        message: (
          <span>
            <Trans>MetaMask not detected.</Trans>
          </span>
        ),
        description: (
          <div>
            {
              <Trans>
                <ExternalLink href="https://metamask.io">Install MetaMask</ExternalLink> to start.
              </Trans>
            }
          </div>
        )
      });
      return;
    }
    handleSetConnectPlat();
    return connect({ connector: metaMaskConnector })?.catch((e) => {});
  }, [connect, handleSetConnectPlat, metaMaskConnector, noticeApi]);

  const handleConnectCoinbase = useCallback(() => {
    handleSetConnectPlat();
    return connect({ connector: coinbaseConnector })?.catch((e) => {});
  }, [connect, handleSetConnectPlat, coinbaseConnector]);

  const handleInjected = useCallback(() => {
    handleSetConnectPlat();
    return connect({ connector: injectedConnector })?.catch((e) => {});
  }, [connect, handleSetConnectPlat, injectedConnector]);
  const handleConnectWalletConnect = useCallback(() => {
    try {
      handleSetConnectPlat();
      return connect({ connector: walletConnectConnector })?.catch((e) => {});
    } catch (e) {}
  }, [connect, handleSetConnectPlat, walletConnectConnector]);
  useEffect(() => {
    if (isInTokenPocket() && !account && !window.unisat) {
      handleInjected();
    }
  }, [account, handleInjected]);
  return (
    <>
      {contextHolder}
      {!isInTokenPocket() && (
        <div className="wallet-btn-container">
          <Button
            className="Wallet-btn MetaMask-btn"
            loading={isLoading && pendingConnector?.id === metaMaskConnector.id}
            onClick={handleConnectMetaMask}
          >
            <img src={metamaskImg} alt="MetaMask" />
            <div>
              <Trans>MetaMask</Trans>
            </div>
          </Button>
        </div>
      )}
      {!isInTokenPocket() && (
        <div className="wallet-btn-container">
          <Button
            className="Wallet-btn CoinbaseWallet-btn"
            loading={isLoading && pendingConnector?.id === coinbaseConnector.id}
            onClick={handleConnectCoinbase}
          >
            <img src={coinbaseImg} alt="Coinbase Wallet" />
            <div>
              <Trans>Coinbase</Trans>
            </div>
          </Button>
        </div>
      )}
      <div className="wallet-btn-container">
        <Button
          className="Wallet-btn CoinbaseWallet-btn"
          loading={isLoading && pendingConnector?.id === injectedConnector.id}
          onClick={handleInjected}
        >
          <img src={tpConnectImg} alt="TP Wallet" />
          <div>
            <Trans>TokenPocket</Trans>
          </div>
        </Button>
      </div>
      {!isInTokenPocket() && (
        <div className="wallet-btn-container">
          <Button
            className="Wallet-btn WalletConnect-btn"
            loading={isLoading && pendingConnector?.id === walletConnectConnector.id}
            onClick={handleConnectWalletConnect}
          >
            <img src={walletConnectImg} alt="WalletConnect" />
            <div>
              <Trans>Walletconnect</Trans>
            </div>
          </Button>
        </div>
      )}
    </>
  );
}
function BRCWalletConnectButton() {
  const [noticeApi, contextHolder] = notification.useNotification();
  const { isReady, connectUnisat, checkIsDestroyed, disconnectUnisat } = useUnisatSdk();
  const [connectLoading, setConnectLoading] = useState(false);
  const dispatch = useDispatch();
  const connectWithUnisat = async () => {
    if (!isReady) {
      noticeApi.warning({
        duration: 3000,
        message: (
          <span>
            <Trans>Unisat Wallet not detected.</Trans>
          </span>
        ),
        description: (
          <ExternalLink href="https://unisat.io/">
            <Trans>Refresh the page after Install UniSat Wallet </Trans>
          </ExternalLink>
        )
      });

      return false;
    }

    const isDestroyed = await checkIsDestroyed();
    if (isDestroyed) {
      noticeApi.warning({
        duration: 3000,
        message: (
          <span>
            <Trans>UniSat Wallet is disconnected.</Trans>
          </span>
        ),
        description: (
          <span
            className="unisat-destroyed-style"
            onClick={() => {
              window.location.reload();
            }}
          >
            <Trans>Click here to refresh the page.</Trans>
          </span>
        )
      });

      return false;
    }
    setConnectLoading(true);
    const ret = await connectUnisat().catch((e) => {
      noticeApi.error({
        duration: 3000,
        message: e.message
      });
      setConnectLoading(false);
    });
    if (ret && ret.length > 0) {
      dispatch(setAccount(ret[0]));
      Lockr.set("connectPlat", "BTC");
      dispatch(setConnectPlat("BTC"));
      dispatch(setSelectedTokenPlatForm("BRC20"));
      dispatch(setWalletConnectModalVisible(false));
    }
    setConnectLoading(false);
  };
  return (
    <>
      {contextHolder}
      <div className="wallet-btn-container">
        <Button className="Wallet-btn Unisat-btn" onClick={connectWithUnisat} loading={connectLoading}>
          <img src={unisatImg} alt="Unisat" />
          <div>
            <Trans>Unisat wallet</Trans>
          </div>
        </Button>
      </div>
    </>
  );
}
export default function WalletConnectModal() {
  const { walletConnectModalVisible } = useSelector(({ modal }) => modal);
  const selectedTokenPlatform = useSelector(({ user }) => user.selectedTokenPlatform);
  const dispatch = useDispatch();

  const items = useMemo(() => {
    if (selectedTokenPlatform === "ERC20") {
      return [
        {
          key: "ERC-Wallet",
          label: `ERC wallet`,
          children: <ERCWalletConnectButton />
        }
      ];
    } else if (selectedTokenPlatform === "BRC20") {
      return [
        {
          key: "BRC-wallet",
          label: `BRC wallet`,
          children: <BRCWalletConnectButton />
        }
      ];
    } else
      return [
        {
          key: "ERC-Wallet",
          label: `ERC wallet`,
          children: <ERCWalletConnectButton />
        },
        {
          key: "BRC-wallet",
          label: `BRC wallet`,
          children: <BRCWalletConnectButton />
        }
      ];
  }, [selectedTokenPlatform]);
  return (
    <>
      {walletConnectModalVisible && (
        <Modal
          className="wallet-connect-modal"
          width={400}
          zIndex={88}
          title={t`Connect wallet`}
          centered
          open={walletConnectModalVisible}
          footer={null}
          onCancel={() => {
            dispatch(setWalletConnectModalVisible(false));
          }}
        >
          <Tabs defaultActiveKey="ERC-Wallet" items={items} />
        </Modal>
      )}
    </>
  );
}
