import EllipsisMiddle from "components/EllipsisMiddle";
import { usePointsAccount } from "hooks/graphQuery/useTestnet";
import TokenTip from "./TokenTip";
import { useMemo, useEffect } from "react";
import { nip19 } from "nostr-tools";
export default function UserPointerInfo({ npubNostrAccount }) {
  const nostrAddress = useMemo(() => {
    if (npubNostrAccount) {
      return nip19.decode(npubNostrAccount).data;
    } else {
      return false;
    }
  }, [npubNostrAccount]);
  const { data, total, fetching, reexcuteQuery } = usePointsAccount({
    id: nostrAddress,
  });
  useEffect(() => {
    setInterval(() => {
      reexcuteQuery();
    }, 30000);
    return () => null;
  }, [reexcuteQuery]);
  const rank = useMemo(() => {
    if (total && data?.ranking) {
      const num = (data?.ranking / total) * 100;
      if (num <= 10) {
        return "10%";
      } else if (num > 10 && num <= 20) {
        return "20%";
      } else if (num > 20 && num <= 30) {
        return "30%";
      } else if (num > 30 && num <= 50) {
        return "50%";
      } else {
        return "51%~100%";
      }
    } else {
      return false;
    }
  }, [data?.ranking, total]);
  //
  return (
    <div className="nostr-group-info">
      <div className="nostr-pointer-info">
        <div className="nostr-pointer-info-item">
          <span className="nostr-pointer-info-item__label">
            My Nostr Address
          </span>

          <span className="nostr-pointer-info-item__value">
            {npubNostrAccount ? (
              <EllipsisMiddle suffixCount={26}>
                {npubNostrAccount}
              </EllipsisMiddle>
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="nostr-pointer-info-item">
          <span className="nostr-pointer-info-item__label">
            My Current Pioneer Points
          </span>
          <span className="nostr-pointer-info-item__value">
            {npubNostrAccount ? (
              <>
                <span className="nostr-pointer-info-item__value-number">
                  {" "}
                  {(data?.task_points || 0) + (data?.reward_points || 0)}
                  <span className="nostr-pointer-info-item__value-description">
                    {` (${data?.task_points || 0} quest points + ${
                      data?.reward_points || 0
                    } bonus points)`}
                    <span style={{ paddingLeft: "5px" }}>
                      <TokenTip />
                    </span>
                  </span>
                </span>
              </>
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="nostr-pointer-info-item">
          <span className="nostr-pointer-info-item__label">
            My Current Rank Tier
          </span>
          <span className="nostr-pointer-info-item__value">
            {npubNostrAccount ? (
              <span className="nostr-pointer-info-item__value-number">
                {rank ? `Top ${rank} of all participants` : "--"}
                {/* {rank ? `（${data?.ranking}/${total}）` : ""} */}
              </span>
            ) : (
              "--"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
