import EllipsisMiddle from "components/EllipsisMiddle";
import classNames from "classnames";
import { useMemo } from "react";
import "./index.scss";
export default function PayAndMintProgress({ assetMintProgress }) {
  const status = assetMintProgress?.status;
  return (
    <>
      <div className="nostr-assets-card">
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Submit payment success</span>
          <span
            className={classNames("nostr-assets-card-item__value", { handing: status === 0, finished: status > 0 })}
          >
            {assetMintProgress?.status === 0 ? "Waiting for payment result" : "Received Payment"}
          </span>
        </div>
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Payment Tx:</span>
          <span className="nostr-assets-card-item__value link">
            {assetMintProgress?.payTxHash ? (
              <a href={`${process.env.REACT_APP_TX}${assetMintProgress?.payTxHash}`} target="_blank">
                <EllipsisMiddle suffixCount={10} copyable={false}>
                  {assetMintProgress?.payTxHash}
                </EllipsisMiddle>
              </a>
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Mint Asset on Taproot Asset</span>

          <span
            className={classNames("nostr-assets-card-item__value", {
              handing: status === 2,
              finished: status === 9,
              error: status === 99
            })}
          >
            {useMemo(() => {
              if (status === 2) {
                return "Minting";
              } else if (status === 9) {
                return "Mint Success";
              } else if (status === 99) {
                return "Mint Failed";
              }
            }, [status])}
          </span>
        </div>
        <div className="nostr-assets-card-item ">
          <span className="nostr-assets-card-item__label">Create Tx</span>
          <span className="nostr-assets-card-item__value link">
            {assetMintProgress?.createTxHash ? (
              <a href={`${process.env.REACT_APP_TX}${assetMintProgress.createTxHash}`} target="_blank">
                <EllipsisMiddle suffixCount={10} copyable={false}>
                  {assetMintProgress.createTxHash}
                </EllipsisMiddle>
              </a>
            ) : (
              "--"
            )}
          </span>
        </div>
      </div>
    </>
  );
}
