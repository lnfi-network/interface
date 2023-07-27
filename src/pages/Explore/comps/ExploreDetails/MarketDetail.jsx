import "./index.scss";
import { Drawer } from "antd";
import { useState, useEffect, useMemo } from "react";
import { t } from "@lingui/macro";
// import CommonDetail from "./CommonDetail";
import * as dayjs from "dayjs";
import cx from "classnames";
import EllipsisMiddle from "components/EllipsisMiddle";
import TextLoading from "components/TextLoading";
import { useSelector } from "react-redux";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
// import TokenDetail from "./TokenDetail";
import BigNumber from "bignumber.js";
export default function ExploreDetails({
  detail,
  open = false,
  onClose,
  type,
}) {
  const { tokenList } = useSelector(({ market }) => market);
  const usdtDetail = useMemo(() => {
    return tokenList.find((item) => item?.name?.toUpperCase() == "USDT");
  }, [tokenList]);
  const curToken = useMemo(() => {
    return tokenList.find((item) => item?.name?.toUpperCase() == detail?.token);
  }, [detail?.token, tokenList]);
  const messageDetail = useMemo(() => {
    const data = detail?.message_detail
      ? JSON.parse(detail?.message_detail)
      : [];
    return Array.isArray(data) ? data : [data];
  }, [detail?.message_detail]);

  return (
    <Drawer
      className="explore-detail-drawer"
      title={t`Detail`}
      // width={460}
      placement="right"
      onClose={onClose}
      open={open}
    >
      {(detail?.type == "PlaceOrder" ||
        detail?.type == "Cancel Order" ||
        detail?.type == "Batch" ||
        detail?.type == "Take order") && (
          <>
            <div className="explore-detail-list-item">
              <span className="explore-detail-list-item__label">{t`Event ID`}</span>
              <span className="explore-detail-list-item__text">
                {detail?.messageid ? (
                  <EllipsisMiddle suffixCount={6}>
                    {detail?.messageid}
                  </EllipsisMiddle>
                ) : (
                  "--"
                )}
              </span>
            </div>
            <div className="explore-detail-list-item">
              <span className="explore-detail-list-item__label">{t`Detail`}</span>
              <span className="explore-detail-list-item__text">
                {detail?.plaintext_context ? (
                  <EllipsisMiddle suffixCount={8}>
                    {detail?.plaintext_context}
                  </EllipsisMiddle>
                ) : (
                  "--"
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
              <span
                className={cx("explore-detail-list-item__text", {
                  "color-red": detail?.status?.toLowerCase() == "fail",
                  "color-green": detail?.status?.toLowerCase() == "success",
                })}
              >
                {detail?.status || "--"}
              </span>
            </div>
            <div className="explore-detail-list-item">
              <span className="explore-detail-list-item__label">{t`Token`}</span>
              <span className="explore-detail-list-item__text">
                {detail?.token || "--"}
              </span>
            </div>
            {messageDetail?.map((item, i) => {
              return (
                <div key={item.OrderID + i}>
                  <div
                    className="b color-green"
                    style={{
                      borderBottom: "1px solid #333",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                    }}
                  ></div>
                  <div className="explore-detail-list-item">
                    <span className="explore-detail-list-item__label">{t`Order ID`}</span>
                    <span className="explore-detail-list-item__text">
                      {item?.OrderID || "--"}
                    </span>
                  </div>
                  <div className="explore-detail-list-item">
                    <span className="explore-detail-list-item__label">{t`Type`}</span>
                    <span
                      className={cx("explore-detail-list-item__text", {
                        "color-red": item?.Type?.toLowerCase() == "sell",
                        "color-green": item?.Type?.toLowerCase() == "buy",
                      })}
                    >
                      {item.Type}
                    </span>
                  </div>
                  <div className="explore-detail-list-item">
                    <span className="explore-detail-list-item__label">{t`Amount`}</span>
                    <span className="explore-detail-list-item__text">
                      {curToken ? item?.Amount
                        ? numberWithCommas(
                          limitDecimals(
                            BigNumber(item?.Amount)
                              .div(curToken?.decimals)
                              .toNumber()
                          ),
                          curToken?.reserve
                        )
                        : "--" : <TextLoading></TextLoading>}
                    </span>
                  </div>
                  <div className="explore-detail-list-item">
                    <span className="explore-detail-list-item__label">{t`Price`}</span>
                    <span className="explore-detail-list-item__text">
                      {usdtDetail ? item?.Price
                        ? numberWithCommas(
                          limitDecimals(
                            BigNumber(item?.Price)
                              .div(usdtDetail?.decimals)
                              .toNumber(),
                            usdtDetail?.reserve
                          )
                        )
                        : "--" : <TextLoading></TextLoading>}{" "}
                      USDT
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
    </Drawer>
  );
}
