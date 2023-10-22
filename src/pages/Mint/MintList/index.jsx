import "./index.scss";
import { useState, useRef, useMemo, memo, useCallback, useEffect } from "react";
import { Table, Tooltip, Button, message, Spin, Modal, Empty, Input } from "antd";
import { t } from "@lingui/macro";
import { useSelector, useDispatch } from "react-redux";
import { nip19 } from "nostr-tools";
import EllipsisMiddle from "components/EllipsisMiddle";
/* import AppNostrHeaderUser from "components/Header/AppNostrHeaderUser"; */
// import Transfer from "./comps/Transfer";
// import AddressBook from "./comps/AddressBook";
import avatar from "img/avatar.png";
import asset from "img/asset.png";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import BigNumber from "bignumber.js";
import { useSize } from "ahooks";
import { useHistory } from "react-router-dom";
import { useCreateAssetsQuery } from "hooks/graphQuery/useExplore";
// import ProModal from "./comps/ProModal";
import { ReloadOutlined } from "@ant-design/icons";
import ConnectNostr from "components/Common/ConnectNostr";
import CheckNostrButton from "components/CheckNostrButton";
import useDevice from "hooks/useDevice";
import { setAboutModalVisible } from "store/reducer/modalReducer";
import * as Lockr from "lockr";
const ASSET_PLAT_MAP = {
  ETHEREUM: "ETH",
  BRC20: "BTC",
  LIGHTNING: "Lightning",
  TAPROOT: "Taproot"
};
function MintList() {
  const { width } = useSize(document.querySelector("body"));
  const device = useDevice();
  const dispatch = useDispatch();
  const [type, setType] = useState("All");
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const history = useHistory();
  const { nostrAccount, balanceList, npubNostrAccount } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const usdtDetail = useMemo(() => {
    return tokenList.find((k) => k?.name?.toUpperCase() == "USDT");
  }, [tokenList]);
  // const { handleQueryBalance } = useQueryBalance();
  const { list, fetching, total, reexcuteQuery } = useCreateAssetsQuery({
    type,
    pageSize,
    pageIndex,
    creator: nostrAccount
  });
  useEffect(() => {
    setInterval(() => {
      reexcuteQuery();
    }, 60000);
    return () => null;
  }, [reexcuteQuery]);
  const onHandleRedirect = useCallback(
    (redirectTo) => {
      history.push(`/${redirectTo}`);
    },
    [history]
  );
  const onPageChange = useCallback((page, pageSize) => {
    setPageIndex(page);
    setPageSize(pageSize);
  }, []);
  const columns = useMemo(() => {
    if (width > 768) {
      return [
        {
          title: t`Asset`,
          dataIndex: "name"
        },
        {
          title: t`Create Date`,
          dataIndex: "create_time",
          // render(text, row) {
          //   return text ? (
          //     <Tooltip
          //       overlayClassName="token-address-tooltip"
          //       title={
          //         <div>
          //           <div>Token name: {row?.name || "--"}</div>
          //           <div>
          //             Token address:{" "}
          //             {row?.token
          //               ? row?.token?.substring(0, 10) + "..." + row?.token?.substring(row?.token?.length - 6)
          //               : "--"}
          //           </div>
          //           {/* <div>Token Channel: {row?.symbol || "--"}</div> */}
          //           <div>Total supply: {row?.totalSupply || "--"}</div>
          //         </div>
          //       }
          //     >
          //       <div>
          //         <EllipsisMiddle suffixCount={6}>{text}</EllipsisMiddle>
          //       </div>
          //     </Tooltip>
          //   ) : (
          //     "--"
          //   );
          // }
        },
        {
          title: t`Asset TX`,
          dataIndex: "create_tx_hash",
          // width: "140px",
          // render: (text, row) => {
          //   if (text == "USDT") {
          //     return `$1.00`;
          //   }
          //   const priceDetail = list.find((item) => item?.name == text);
          //   return priceDetail?.deal_price && usdtDetail
          //     ? `$${numberWithCommas(
          //         limitDecimals(
          //           BigNumber(priceDetail.deal_price).div(usdtDetail?.decimals).div(row?.decimals).toNumber(),
          //           2
          //         )
          //       )}`
          //     : "--";
          // }
        },
        {
          title: t`Asset ID`,
          dataIndex: "asset_id",
          // width: "140px",
          // render: (text) => {
          //   const balance = balanceList?.[text]?.balanceShow;
          //   return balance ? numberWithCommas(balance) : "--";
          // }
        },
        // {
        //   title: t`Progress`,
        //   dataIndex: "name",
        //   // width: "140px",
        //   render: (text, row) => {
        //     if (!nostrAccount) {
        //       return "--";
        //     }
        //     const balance = balanceList?.[text]?.balanceShow || 0;
        //     if (text == "USDT") {
        //       return `$${numberWithCommas(limitDecimals(balance, 2))}`;
        //     }
        //     const priceDetail = list.find((item) => item?.name == text);
        //     return priceDetail?.deal_price && usdtDetail
        //       ? `$${numberWithCommas(
        //           limitDecimals(
        //             BigNumber(priceDetail.deal_price)
        //               .div(usdtDetail?.decimals)
        //               .div(row?.decimals)
        //               .times(balance)
        //               .toNumber(),
        //             2
        //           )
        //         )}`
        //       : "--";
        //   }
        // },
        // {
        //   title: t`Minter`,
        //   dataIndex: "name",
        //   // width: "140px",
        //   render: (text) => {
        //     const balance = balanceList?.[text]?.balanceShow;
        //     return balance ? numberWithCommas(balance) : "--";
        //   }
        // },
        {
          title: t`Action`,
          dataIndex: "status",
          // width: 260,
          render: (text, row) => {
            return (
              <div className="account-table-btns">
                <CheckNostrButton>
                  <Button
                    type="primary"
                    // size="small"
                    onClick={() => {
                      // const platform = ASSET_PLAT_MAP[row.assetType];
                      onHandleRedirect(`mint/detail`);
                    }}
                  >
                    {t`Mint`}
                  </Button>
                </CheckNostrButton>
                <span className="ml5 f18 pointer">{">"}</span>
                {/* <CheckNostrButton>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      const platform = ASSET_PLAT_MAP[row.assetType];
                      onHandleRedirect(`send/${platform}/${row?.name}`);
                    }}
                  >
                    {t`Send`}
                  </Button>
                </CheckNostrButton>
                <CheckNostrButton>
                  <Button type="primary" size="small" onClick={() => transferShow(row)}>
                    {t`Transfer`}
                  </Button>
                </CheckNostrButton> */}
              </div>
            );
          }
        }
      ];
    } else {
      return [
        {
          title: t`Asset`,
          dataIndex: "name",
          width: 100,
          ellipsis: true
        },
        {
          title: t`Create Date`,
          dataIndex: "token",
          render(text, row) {
            return text ? (
              <Tooltip
                overlayClassName="token-address-tooltip"
                title={
                  <div>
                    <div>Token name: {row?.name || "--"}</div>
                    <div>
                      Token address:
                      {row?.token
                        ? row?.token?.substring(0, 8) + "..." + row?.token?.substring(row?.token?.length - 6)
                        : "--"}
                    </div>
                    {/*  <div>Token Channel: {row?.symbol || "--"}</div> */}
                    <div>Total supply: {row?.totalSupply || "--"}</div>
                  </div>
                }
              >
                <div>
                  <EllipsisMiddle suffixCount={4}>{text}</EllipsisMiddle>
                </div>
              </Tooltip>
            ) : (
              "--"
            );
          }
        },
        {
          title: (
            <div>
              <div>{t`Amount`}</div>
              <div>{t`USD Value`}</div>
            </div>
          ),
          dataIndex: "name",
          render: (text, row) => {
            const balance = balanceList?.[text]?.balanceShow || 0;
            const amount = balance ? numberWithCommas(balance) : "--";
            let usdValue = "";
            if (nostrAccount) {
              if (text == "USDT") {
                usdValue = `$${numberWithCommas(limitDecimals(balance, 2))}`;
              } else {
                const priceDetail = list.find((item) => item?.name == text);
                usdValue =
                  priceDetail?.deal_price && usdtDetail
                    ? `$${numberWithCommas(
                        limitDecimals(
                          BigNumber(priceDetail.deal_price)
                            .div(usdtDetail?.decimals)
                            .div(row?.decimals)
                            .times(balance)
                            .toNumber(),
                          2
                        )
                      )}`
                    : "--";
              }
            } else {
              usdValue = "--";
            }

            return (
              <div>
                <div>{amount}</div>
                <div>{usdValue}</div>
              </div>
            );
          }
        }
      ];
    }
  }, [balanceList, list, nostrAccount, onHandleRedirect, usdtDetail, width]);
  return (
    <>
      {/* {!nostrAccount && (
        <div className="account-nologin">
          <div className="account-nologin-content">
            <div className="account-nologin-content-text f18 b">{t`First Asset Management Platform`}</div>
            <div className="account-nologin-content-text">
              {t`Powered by Nostr Protocol, Secured by Lightning Network. `}
            </div>
            <div className="account-nologin-content-text">{t`Connect Nostr to start managing your assets`}</div>
            <div className="account-nologin-content-btns">
              <ConnectNostr />
            </div>
          </div>
        </div>
      )} */}

      <div className="mint-list">
        <div className="mint-list-head">
          <div className="account-head-left-nostr">
            <div className="f18 b color-light">Mint Assets</div>
            <div className="f14 mt20">
              NostrAssets领先支持Deploy/Mint Taproot Assets，可以快速Deploy您的token，或参与已有token的mint.
            </div>
          </div>
        </div>

        <div className="mint-list-content">
          <div className="mint-list-content-create">
            <Button type="primary">{t`Launch Mint Activity`}</Button>
            <Button type="primary" onClick={() => onHandleRedirect(`mint/create`)}>{t`Create Asset`}</Button>
          </div>
          <div className="mint-list-tabs">
            <div className="mint-list-tabs-btns">
              {width > 768 ? (
                <>
                  <Button type={type == "All" ? "primary" : "default"} size="large" onClick={() => setType("All")}>
                    {t`All`}
                  </Button>
                  <Button
                    type={type == "In-Progress" ? "primary" : "default"}
                    size="large"
                    onClick={() => setType("In-Progress")}
                  >{t`In-Progress`}</Button>
                  <Button
                    type={type == "Completed" ? "primary" : "default"}
                    size="large"
                    onClick={() => setType("Completed")}
                  >{t`Completed`}</Button>
                  <CheckNostrButton>
                    <Button type={type == "My" ? "primary" : "default"} size="large" onClick={() => setType("My")}>
                      {t`My Created`}
                    </Button>
                  </CheckNostrButton>
                </>
              ) : (
                <>
                  <Button type={type == "All" ? "primary" : "default"} size="large" onClick={() => setType("All")}>
                    {t`All`}
                  </Button>
                  <Button
                    type={type == "In-Progress" ? "primary" : "default"}
                    size="large"
                    onClick={() => setType("In-Progress")}
                  >{t`In-Progress`}</Button>
                  <Button
                    type={type == "Completed" ? "primary" : "default"}
                    size="large"
                    onClick={() => setType("Completed")}
                  >{t`Completed`}</Button>
                  <CheckNostrButton>
                    <Button type={type == "My" ? "primary" : "default"} size="large" onClick={() => setType("My")}>
                      {t`My Created`}
                    </Button>
                  </CheckNostrButton>
                </>
              )}
            </div>
            <div>
              <Input
                // onChange={assetIdChange}
                style={{ width: "500px" }}
                size={device.isMobile ? "middle" : "large"}
                placeholder="Search by asset ID or Asset name"
              />
            </div>
          </div>
          {type == "My" && !fetching ? (
            <div className="my-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ color: "#fff" }}
                description={
                  <>
                    <div className="color-base f16">您当前链接的Nostr账户尚未创建任何资产</div>
                    <div className="color-base f14">
                      NostrAssets是首批支持Taproot资产创建的平台，您可轻松快速创建您的Taproot资产，体验一下吧
                    </div>
                  </>
                }
              />
              <CheckNostrButton>
                <Button type="primary" onClick={() => onHandleRedirect(`mint/create`)}>{t`Create Asset`}</Button>
              </CheckNostrButton>
            </div>
          ) : (
            <Table
              className="table-light"
              loading={fetching}
              // sticky
              showSorterTooltip={false}
              rowKey="name"
              columns={columns}
              dataSource={list || []}
              pagination={{
                current: pageIndex,
                total: total,
                pageSize,
                position: ["bottomCenter"],
                onChange: (page, pageSize) => {
                  onPageChange(page, pageSize);
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
export default memo(MintList);
