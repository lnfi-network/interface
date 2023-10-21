import EllipsisMiddle from "components/EllipsisMiddle";
import "./index.scss";
export default function PayAndMintProgress() {
  return (
    <>
      <div className="nostr-assets-card">
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Submit payment success</span>
          <span className="nostr-assets-card-item__value handing">Waiting for payment result</span>
        </div>
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Payment Tx:</span>
          <span className="nostr-assets-card-item__value link">
            <a href="">
              <EllipsisMiddle suffixCount={10} copyable={false}>
                xxxxxx
              </EllipsisMiddle>
            </a>
          </span>
        </div>
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Mint Asset on Taproot Asset</span>
          <span className="nostr-assets-card-item__value error">Waiting for Start</span>
        </div>
        <div className="nostr-assets-card-item ">
          <span className="nostr-assets-card-item__label">Submit payment success</span>
          <span className="nostr-assets-card-item__value link">
            <a href="">
              <EllipsisMiddle suffixCount={10} copyable={false}>
                xxxxxx
              </EllipsisMiddle>
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
