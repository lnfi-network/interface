import "./index.scss";
import { useState, useRef, useMemo, memo, useCallback, useEffect } from "react";
import { Table, Tooltip, Button, message, Spin, Modal, Empty, Input, Image } from "antd";
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
import { useSize, useDebounce } from "ahooks";
import { useHistory } from "react-router-dom";
import { useCreateAssetsQuery } from "hooks/graphQuery/useExplore";
// import ProModal from "./comps/ProModal";
import { utcToClient } from "lib/dates";
import { ReloadOutlined } from "@ant-design/icons";
import ConnectNostr from "components/Common/ConnectNostr";
import CheckNostrButton from "components/CheckNostrButton";
import useDevice from "hooks/useDevice";
import { setAboutModalVisible } from "store/reducer/modalReducer";
import { PlusOutlined } from "@ant-design/icons";
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, { wait: 500 });
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
    search: debouncedSearch,
    type,
    pageSize,
    pageIndex,
    creator: nostrAccount
  });
  // useEffect(() => {
  //   setInterval(() => {
  //     reexcuteQuery();
  //   }, 60000);
  //   return () => null;
  // }, [reexcuteQuery]);
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
  const searchChange = useCallback((e) => {
    // console.log("value", value);
    setSearch(e.target.value);
  }, []);
  const columns = useMemo(() => {
    if (width > 768) {
      return [
        {
          title: t`Asset`,
          dataIndex: "name",
          render: (text, row) => {
            return (
              <div>
                <div>
                  <Image
                    width={36}
                    height={36}
                    style={{ borderRadius: "20px" }}
                    preview={false}
                    src={row.logo}
                    fallback="data:image/png;base64,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"
                  />
                  <span style={{ marginLeft: "8px" }}>{text}</span>
                </div>
              </div>
            );
          }
        },
        {
          title: t`Create Date`,
          dataIndex: "create_time",
          render: (text) => utcToClient(text)
        },
        {
          title: t`Asset TX`,
          dataIndex: "create_tx_hash",
          render: (text) => {
            return text || "--";
          }
        },
        {
          title: t`Asset ID`,
          dataIndex: "asset_id",
          render: (text) => {
            return text ? <EllipsisMiddle suffixCount={8}>{text}</EllipsisMiddle> : "--";
          }
        },
        {
          title: t`Creator`,
          dataIndex: "creator",
          render: (text) => {
            return text ? <EllipsisMiddle suffixCount={6}>{nip19.npubEncode(text)}</EllipsisMiddle> : text || "--";
          }
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
          title: t`Status`,
          dataIndex: "status",
          // width: 260,
          render: (text, row) => {
            let txt;
            switch (text) {
              case 0:
              case 1:
                txt = "待部署";
                break;
              case 2:
                txt = "部署中";
                break;
              case 9:
                txt = "部署成功";
                break;
              case 99:
                txt = "部署失败";
                break;
            }
            return (
              <div
                className="mint-table-status"
                onClick={() => {
                  onHandleRedirect(`mint/create/${row.event_id}`);
                }}
              >
                <span>{txt || text}</span>
                <span className="ml5 f18 pointer">{">"}</span>
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
            <Button type="primary" onClick={() => message.info("Coming soon")}>{t`Launch Mint Activity`}</Button>
            <Button type="primary">{t`Create Asset`}</Button>
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
                  <CheckNostrButton>
                    <Button type="primary" size="large" onClick={() => onHandleRedirect(`mint/create`)}>
                      <PlusOutlined />
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
                onChange={searchChange}
                style={{ width: "500px" }}
                size={device.isMobile ? "middle" : "large"}
                placeholder="Search by asset ID or Asset name"
              />
            </div>
          </div>
          {type == "My" && !fetching && !list?.length ? (
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
              rowKey="event_id"
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
