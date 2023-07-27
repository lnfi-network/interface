import "./index.scss";
import { useMemo } from "react";
// import CommonDetail from "./CommonDetail";
import { t } from "@lingui/macro";
import EllipsisMiddle from "components/EllipsisMiddle";
import TextLoading from "components/TextLoading";
import * as dayjs from "dayjs";
import { Drawer } from "antd";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import BigNumber from "bignumber.js";
export default function TokenDetail({ detail, onClose, open = false }) {
  const { tokenList } = useSelector(({ market }) => market);
  const messageDetail = useMemo(() => {
    const msg = detail?.message_detail
      ? JSON.parse(detail?.message_detail)
      : null;
    //
    try {
      const data = msg?.data ? JSON.parse(msg?.data) : [];
      //
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      return [];
    }

    // return detail?.message_detail ? JSON.parse(detail?.message_detail) : null;
  }, [detail?.message_detail]);

  const list = useMemo(() => {
    return (
      detail?.status != "fail" &&
      messageDetail.map((item, i) => {
        const row = tokenList.find((k) => k.name == item.token);
        //
        return (
          <div key={item.token + i}>
            <div className="explore-detail-list-item border-t">
              <span className="explore-detail-list-item__label">{t`Token`}</span>
              <span className="explore-detail-list-item__text">
                {item.token || detail?.token || "--"}
              </span>
            </div>
            <div className="explore-detail-list-item">
              <span className="explore-detail-list-item__label">{t`Amount`}</span>
              <span className="explore-detail-list-item__text">
                {item?.amount ? (
                  row && detail?.token ? (
                    numberWithCommas(
                      limitDecimals(
                        BigNumber(item?.amount).div(row?.decimals).toNumber(),
                        row?.reserve
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
            {(detail?.type == "approve" ||
              detail?.type == "transfer" ||
              detail?.type == "Batch") && (
              <>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`From`}</span>
                  <span className="explore-detail-list-item__text">
                    {item?.from ? (
                      <EllipsisMiddle suffixCount={6}>
                        {item?.to?.indexOf("npub") < 0
                          ? nip19.npubEncode(item?.from)
                          : item?.from}
                      </EllipsisMiddle>
                    ) : (
                      "--"
                    )}
                  </span>
                </div>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`To`}</span>
                  <span className="explore-detail-list-item__text">
                    {item?.to ? (
                      <EllipsisMiddle suffixCount={6}>
                        {item?.to?.indexOf("npub") < 0
                          ? nip19.npubEncode(item?.to)
                          : item?.to}
                      </EllipsisMiddle>
                    ) : (
                      "--"
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })
    );
  }, [detail?.status, detail?.token, detail?.type, messageDetail, tokenList]);
  const status = useMemo(() => {
    let cls;
    let txt;
    switch (detail?.status) {
      case "success":
        cls = "color-green";
        txt = "Success";
        break;
      case "fail":
        cls = "color-red";
        txt = "Failed";
        break;
      case "pending":
        cls = "color-yellow";
        txt = "Pending";
        break;
      default:
        cls = "";
        txt = "";
    }
    return <span className={cls}>{txt || detail?.status || "--"}</span>;
  }, [detail?.status]);
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
            {detail?.message_id && (
              <EllipsisMiddle suffixCount={6}>
                {detail?.message_id}
              </EllipsisMiddle>
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Time`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.create_time
              ? dayjs(detail?.create_time).format("YYYY-MM-DD HH:mm:ss")
              : "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Type`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.type || "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Address`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.nostr_address && (
              <EllipsisMiddle suffixCount={6}>
                {detail?.nostr_address || "--"}
              </EllipsisMiddle>
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Status`}</span>
          <span className="explore-detail-list-item__text">{status}</span>
        </div>
        {list}
      </div>
    </Drawer>
  );
}
