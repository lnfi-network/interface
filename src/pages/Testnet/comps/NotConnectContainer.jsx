import ConnectNostr from "components/Common/ConnectNostr";

export default function NotConnectContainer() {
  return (
    <div className="nostr-group-info">
      <div className="nostr-notConnect">
        <div className="nostr-notConnect-tip">
          Please connect your Nostr account to view the data.
        </div>
        <p className="nostr-notConnect-description">
          For web users, use the Alby Wallet extension to connect. For Token
          Pocket app users, you can connect using the in-app DApp browser.
        </p>
        <div className="nostr-notConnect-button">
          <ConnectNostr />
        </div>
      </div>
    </div>
  );
}
