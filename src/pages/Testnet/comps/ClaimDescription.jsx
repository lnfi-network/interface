export default function ClaimDescription() {
  return (
    <>
      <ul className="claim-description">
        <li className="claim-description-item OpenSans">
          1. How to claim Testnet tokens?
          <div className="claim-description-item__child">
            - For web users, use the Alby Wallet extension to connect your Nostr
            account and claim.
          </div>
          <div className="claim-description-item__child">
            - For mobile users, use Damus or Amethyst app and send a command to
            NostrAssets Token Manager. Use the command “Claim”.
          </div>
          <div className="claim-description-item__child">
            - For Token Pocket users, use the DApp browser to connect your Nostr
            account and claim.
          </div>
        </li>
        {/*  <li className="claim-description-item OpenSans">
          2. Upon claiming successfully, your NostrAssets account will
          automatically receive testnet tokens. (10000 USDT 、10000 ORDI 、10000
          OXBT、10000 PEPE、10000 BTOC、10000 VMPX)
        </li> */}
        <li className="claim-description-item OpenSans">
          2. Each Nostr address can only claim once.
        </li>
      </ul>
    </>
  );
}
