import "./index.scss";
import { Drawer, Spin } from "antd";
import { useState, useEffect, useMemo } from "react";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
import EllipsisMiddle from "components/EllipsisMiddle";
import TextLoading from "components/TextLoading";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { nip19 } from "nostr-tools";
import { useOrderDetailQuery } from "hooks/graphQuery/useExplore";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import cx from "classnames";
import { QUOTE_ASSET } from "config/constants";
export default function ExploreDetails({ detail, open = false, onClose, type }) {
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const { list, fetching, reexcuteQuery } = useOrderDetailQuery({
    pageSize: 50,
    pageIndex: 1,
    id: detail?.id,
    type: detail?.type
  });
  // const usdtDetail = useMemo(() => {
  //   return tokenList.find(item => item?.name?.toUpperCase() == "USDT")
  // }, [tokenList])
  const quoteAsset = useMemo(() => {
    return tokenList.find((item) => item.name == QUOTE_ASSET);
  }, [tokenList]);
  const curToken = useMemo(() => {
    return tokenList.find((item) => item?.name?.toUpperCase() == detail?.token);
  }, [detail?.token, tokenList]);
  const trend_side = useMemo(() => {
    return detail?.type?.toLowerCase() == "buy" ? "Sell" : "Buy";
  }, [detail?.type]);
  const statusMemo = useMemo(() => {
    // return detail?.type?.toLowerCase() == "buy" ? "Sell" : "Buy"
    let cls;
    let txt;
    switch (detail?.status) {
      case "INIT":
      case "PUSH_MARKET_SUCCESS":
      case "PUSH_MARKET_FAIL":
      case "TAKE_LOCK":
      case "TRADE_PENDING":
        txt = "Unfilled";
        break;
      case "PART_SUCCESS":
        txt = "Partial";
        cls = "color-yellow";
        break;
      case "SUCCESS":
        cls = "color-green";
        txt = "Filled";
        break;
      case "CANCEL_PENDING":
      case "CANCEL":
        txt = "Cancelled";
        break;
      default:
        cls = "";
        txt = "";
    }
    return <span className={cls}>{txt || detail?.status || "--"}</span>;
  }, [detail?.status]);
  return (
    <Drawer
      className="explore-detail-drawer"
      title={t`Detail`}
      width={460}
      placement="right"
      onClose={onClose}
      open={open}
    >
      <>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Event ID`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.event_id && <EllipsisMiddle suffixCount={6}>{detail?.event_id}</EllipsisMiddle>}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Time`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.create_time ? dayjs(detail?.create_time).format("YYYY-MM-DD HH:mm:ss") : "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Order ID`}</span>
          <span className="explore-detail-list-item__text">{detail?.id || "--"}</span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Type`}</span>
          <span
            className={cx("explore-detail-list-item__text", {
              "color-red": detail?.type?.toLowerCase() == "sell",
              "color-green": detail?.type?.toLowerCase() == "buy"
            })}
          >
            {detail?.type || "--"}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Amount`}</span>
          <span className="explore-detail-list-item__text">
            {curToken ? (
              detail?.volume ? (
                numberWithCommas(BigNumber(detail?.volume).div(curToken?.decimals).toNumber())
              ) : (
                "--"
              )
            ) : (
              <TextLoading></TextLoading>
            )}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Price`}</span>
          <span className="explore-detail-list-item__text">
            {quoteAsset ? (
              detail?.price ? (
                numberWithCommas(limitDecimals(detail?.price / quoteAsset?.decimals, quoteAsset?.reserve))
              ) : (
                "--"
              )
            ) : (
              <TextLoading></TextLoading>
            )}{" "}
            {QUOTE_ASSET}
            <div className="color-dark ml5">
              {quote_pirce && detail?.price
                ? `≈$${numberWithCommas(limitDecimals((detail?.price / quoteAsset?.decimals) * quote_pirce, 2))}`
                : ""}
            </div>
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Address`}</span>
          <span className="explore-detail-list-item__text">
            {detail?.owner && <EllipsisMiddle suffixCount={6}>{nip19.npubEncode(detail?.owner)}</EllipsisMiddle>}
          </span>
        </div>
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Status`}</span>
          <span className="explore-detail-list-item__text">{statusMemo}</span>
        </div>
        {/* <CommonDetail detail={detail}></CommonDetail> */}
        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Token`}</span>
          <span className="explore-detail-list-item__text">{detail?.token || "--"}</span>
        </div>

        <div className="explore-detail-list-item">
          <span className="explore-detail-list-item__label">{t`Average Executed Price`}</span>
          <span className="explore-detail-list-item__text">
            {quoteAsset ? (
              detail?.avg_price ? (
                numberWithCommas(limitDecimals(detail?.avg_price / quoteAsset?.decimals, quoteAsset?.reserve))
              ) : (
                "--"
              )
            ) : (
              <TextLoading></TextLoading>
            )}{" "}
            {QUOTE_ASSET}
            <div className="color-dark ml5">
              {quote_pirce && detail?.price
                ? `≈$${numberWithCommas(limitDecimals((detail?.avg_price / quoteAsset?.decimals) * quote_pirce, 2))}`
                : ""}
            </div>
          </span>
        </div>

        {fetching ? (
          <Spin />
        ) : (
          list?.map((item, i) => {
            return (
              <div key={item.orderID + i}>
                <div
                  className="b color-green mb10"
                  style={{ borderBottom: "1px solid #333", paddingBottom: "5px", marginBottom: "10px" }}
                ></div>
                <div className="explore-detail-list-item mt10">
                  <span className="explore-detail-list-item__label">{t`Order ID`}</span>
                  <span className="explore-detail-list-item__text">
                    {item?.[trend_side?.toLowerCase() + "_order_id"] || "--"}
                  </span>
                </div>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`Type`}</span>
                  <span
                    className={cx("explore-detail-list-item__text", {
                      "color-red": trend_side == "Sell",
                      "color-green": trend_side == "Buy"
                    })}
                  >
                    {trend_side}
                  </span>
                </div>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`Amount`}</span>
                  <span className="explore-detail-list-item__text">
                    {curToken ? (
                      item?.volume ? (
                        numberWithCommas(BigNumber(item?.volume).div(curToken?.decimals).toNumber())
                      ) : (
                        "--"
                      )
                    ) : (
                      <TextLoading></TextLoading>
                    )}
                  </span>
                </div>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`Price`}</span>
                  <span className="explore-detail-list-item__text">
                    {quoteAsset ? (
                      item?.price ? (
                        numberWithCommas(
                          limitDecimals(
                            BigNumber(item?.price).div(item?.volume).div(quoteAsset?.decimals).toNumber(),
                            quoteAsset?.reserve
                          )
                        )
                      ) : (
                        "--"
                      )
                    ) : (
                      <TextLoading></TextLoading>
                    )}{" "}
                    {QUOTE_ASSET}
                    <div className="color-dark ml5">
                      {quote_pirce && detail?.price
                        ? `≈$${numberWithCommas(
                            limitDecimals(
                              BigNumber(item?.price)
                                .div(item?.volume)
                                .div(quoteAsset?.decimals)
                                .times(quote_pirce)
                                .toNumber(),
                              2
                            )
                          )}`
                        : ""}
                    </div>
                  </span>
                </div>
                <div className="explore-detail-list-item">
                  <span className="explore-detail-list-item__label">{t`Address`}</span>
                  <span className="explore-detail-list-item__text">
                    {item?.[trend_side?.toLowerCase() + "_owner"] && (
                      <EllipsisMiddle suffixCount={6}>
                        {nip19.npubEncode(item?.[trend_side?.toLowerCase() + "_owner"])}
                      </EllipsisMiddle>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </>
    </Drawer>
  );
}
