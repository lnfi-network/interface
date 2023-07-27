import { Tooltip } from "antd";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ExclamationCircleOutlined } from "@ant-design/icons";
export default function TokenTip() {
  // const { tokenList } = useSelector(({ market }) => market);
  const receiveTokens = useMemo(() => {
    // return ["ORDI",
    //   "OXBT",
    //   "VMPX",
    //   "BTOC",
    //   "MXRC",
    //   "ZBIT",
    //   "PEPE",
    //   "MEME",
    //   "DOGE",
    //   "SHIB"]
    return [
      "ORDI",
      "OXBT",
      "VMPX",
      "BTOC",
      "MXRC",
      "ZBIT",
      "PEPE",
      "MEME",
      "SATS",
      "BANK",
      "$ORE",
      // "LVDI"
    ]
  }, [])
  const pionerPointsTitle = useMemo(
    () => (
      <div className="pioner-point-title">
        <p>
          By holding the following BRC20 tokens, you can receive bonus pioneer
          points. Each token type held, you will earn an extra 10 points, with a
          maximum of 100 bonus points. To claim the additional points, please
          connect using your Unisat Wallet, which will allow us to verify your
          token ownership.
        </p>
        <ul className="nostr-tokens">
          {receiveTokens.map((token) => (
            <li className="nostr-token-item" key={token}>
              {token}
            </li>
          ))}
        </ul>
      </div>
    ),
    [receiveTokens]
  );
  return (
    <>
      <Tooltip
        className="point-tooltip"
        placement="right"
        title={pionerPointsTitle}
      >
        <ExclamationCircleOutlined />
      </Tooltip>
    </>
  );
}
