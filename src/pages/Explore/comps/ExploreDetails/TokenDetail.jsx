import "./index.scss";
import { useMemo } from "react";
// import CommonDetail from "./CommonDetail";
import { t } from "@lingui/macro";
import EllipsisMiddle from "components/EllipsisMiddle";
import TextLoading from "components/TextLoading";
import * as dayjs from "dayjs";
import { Drawer, Tooltip } from "antd";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import BigNumber from "bignumber.js";
export default function TokenDetail({ detail, onClose, open = false }) {
  const { tokenList } = useSelector(({ market }) => market);
  const curToken = useMemo(() => {
    return tokenList.find((k) => k.name == detail?.token);
  }, [detail?.token, tokenList]);
  const typeOptions = [
    {
      value: "",
      label: t`All`,
    },
    {
      value: "deposit",
      label: t`Deposit`,
    },
    {
      value: "withdraw",
      label: t`Withdraw`,
    },
    {
      value: "approve",
      label: t`Approve`,
    },
    {
      value: "transfer",
      label: t`Transfer`,
    },

    {
      value: "transferFrom",
      label: t`transferFrom`,
    },
    {
      value: "openPro",
      label: t`openPro`,
    },
    {
      value: "closePro",
      label: t`closePro`,
    },
    {
      value: "deleteAddressBook",
      label: t`deleteAddressBook`,
    },
    {
      value: "addressBookAdd",
      label: t`addressBookAdd`,
    },
  ];
  const status = useMemo(() => {
    let cls;
    let txt;
    switch (detail?.status) {
      case 0:
        cls = "color-green";
        txt = "Success";
        break;
      case 1:
        cls = "color-red";
        txt = "Failed";
        break;
      default:
        cls = "";
        txt = "";
    }
    return txt !== "Success" ? (
      <Tooltip color="#6f6e84" title={detail?.error}>
        <span className={cls}>{txt || detail?.status || "--"}</span>
      </Tooltip>
    ) : (
      <span className={cls}>{txt || detail?.status || "--"}</span>
    );
  }, [detail?.error, detail?.status]);
  //
  return (
    <Drawer
      className="explore-detail-drawer"
      title={t`Detail`}
      // width={460}
      placement="right"
      onClose={onClose}
      open={open}
    >
      <div className="explore-detail-list">
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Event ID`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.event_id ? (
              <EllipsisMiddle suffixCount={6}>
                {nip19.noteEncode(detail?.event_id)}
              </EllipsisMiddle>
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Time`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.create_at
              ? dayjs.unix(detail?.create_at).format("YYYY-MM-DD HH:mm:ss")
              : "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Token`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.token || "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Type`}</span>
          <span className="explore-detail-list-item__text">
            {typeOptions.find((item) => item.value == detail?.type)?.label ||
              detail?.type ||
              "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Event content`}</span>
          <span
            className="explore-detail-list-item__text"
            title={detail?.event_content}
          >
            {detail?.event_content && detail?.event_content?.length > 20 ? (
              <EllipsisMiddle suffixCount={8}>
                {detail?.event_content || "--"}
              </EllipsisMiddle>
            ) : (
              detail?.event_content
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Plain text content`}</span>
          <span
            className="explore-detail-list-item__text"
            title={detail?.plaintext_content}
          >
            {detail?.plaintext_content &&
            detail?.plaintext_content?.length > 20 ? (
              <EllipsisMiddle suffixCount={8}>
                {detail?.plaintext_content || "--"}
              </EllipsisMiddle>
            ) : (
              detail?.plaintext_content
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Address`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.sender_address && (
              <EllipsisMiddle suffixCount={6}>
                {nip19.npubEncode(detail?.sender_address) || "--"}
              </EllipsisMiddle>
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Status`}</span>
          <span className="explore-detail-list-item__text">{status}</span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Amount`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.amount ? (
              curToken && detail?.token ? (
                numberWithCommas(
                  limitDecimals(
                    BigNumber(detail?.amount)
                      .div(curToken?.decimals)
                      .toNumber(),
                    curToken?.reserve
                  )
                )
              ) : (
                <TextLoading></TextLoading>
              )
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`From`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.from_address ? (
              <EllipsisMiddle suffixCount={6}>
                {detail?.from_address?.indexOf("npub") < 0
                  ? nip19.npubEncode(detail?.from_address)
                  : detail?.from_address}
              </EllipsisMiddle>
            ) : (
              "--"
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`To`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.to_address ? (
              <EllipsisMiddle suffixCount={6}>
                {detail?.to_address?.indexOf("npub") < 0
                  ? nip19.npubEncode(detail?.to_address)
                  : detail?.to_address}
              </EllipsisMiddle>
            ) : (
              "--"
            )}
          </span>
        </div>
        {/* {list} */}
      </div>
    </Drawer>
  );
}
