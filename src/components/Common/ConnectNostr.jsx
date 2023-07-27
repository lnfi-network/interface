import ConnectWalletButton from "./ConnectWalletButton";
import logo from "img/logo.svg";
import "./ConnectWallet.scss";

import { useCallback, useEffect, useState } from "react";
import useGetNostrAccount from "hooks/useGetNostrAccount";
// import { useQueryBalance } from "hooks/useNostrMarket";
// import { nip19 } from "nostr-tools";
export default function ConnectNostr() {
  const { handleGetNostrAccount } = useGetNostrAccount();
  // const { handleQueryBalance } = useQueryBalance();
  const [loading, setLoading] = useState(false);
  const handleConnectNostr = useCallback(async () => {
    setLoading(true);
    const nostrAccount = await handleGetNostrAccount().catch((e) => {
      window._message.open({
        type: "error",
        content: e.message,
      });
    });
    if (nostrAccount) {
      window._message.open({
        type: "success",
        content: "Connect success.",
      });
    }
    setLoading(false);
  }, [handleGetNostrAccount]);
  return (
    <div className="connect-wallet-common">
      <ConnectWalletButton
        onClick={handleConnectNostr}
        imgSrc={logo}
        loading={loading}
      >
        Connect Nostr
      </ConnectWalletButton>
    </div>
  );
}
