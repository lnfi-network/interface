import EllipsisMiddle from "components/EllipsisMiddle";
import classNames from "classnames";
import { useMemo } from "react";
import { ISSUE_ASSET_STATUS, ISSUE_ASSET_STATUS_DESCRIPTION } from "config/constants";
import "./index.scss";
export default function PayAndMintProgress({ assetMintProgress }) {
  const status = assetMintProgress?.status;
  return (
    <>
      <div className="nostr-assets-card">
        <div className="nostr-assets-card-item">
          <span className="nostr-assets-card-item__label">Submit Payment Sucessful</span>
          <span
            className={classNames("nostr-assets-card-item__value", { handing: status === 0, finished: status > 0 })}
          >
            {status < ISSUE_ASSET_STATUS.BROADCASTING
              ? ISSUE_ASSET_STATUS_DESCRIPTION[assetMintProgress?.status]
              : ISSUE_ASSET_STATUS_DESCRIPTION[ISSUE_ASSET_STATUS.PENDING_BROADCAST]}
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
          <span className="nostr-assets-card-item__label">Issue Taproot Assets</span>

          <span
            className={classNames("nostr-assets-card-item__value", {
              handing: status === 2,
              finished: status === 9,
              error: status === 99
            })}
          >
            {useMemo(() => {
              if (status < ISSUE_ASSET_STATUS.FAILED && status > ISSUE_ASSET_STATUS.PENDING_BROADCAST) {
                return ISSUE_ASSET_STATUS_DESCRIPTION[status];
              }
              if (status === ISSUE_ASSET_STATUS.FAILED) {
                return "Issue Asset Failed!";
              } else {
                return "Not started. Pending verification";
              }
            }, [status])}
          </span>
        </div>
        <div className="nostr-assets-card-item ">
          <span className="nostr-assets-card-item__label">Issue Tx</span>
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
