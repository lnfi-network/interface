import "./index.scss";
import { useState, useRef, useMemo, memo, useCallback, useEffect } from "react";
import { Table, Tooltip, Button, message, Spin } from "antd";
import { t } from "@lingui/macro";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import EllipsisMiddle from "components/EllipsisMiddle";
import AppNostrHeaderUser from "components/Header/AppNostrHeaderUser";
import Transfer from "./comps/Transfer";
import AddressBook from "./comps/AddressBook";
import avatar from "img/avatar.png";
import asset from "img/asset.png";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import BigNumber from "bignumber.js";
import { useSize } from "ahooks";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useHistory } from "react-router-dom";
import { useTokenChangeQuery } from "hooks/graphQuery/useExplore";
import ProModal from "./comps/ProModal";
import { ReactComponent as TransferSvg } from "img/Transfer.svg";
import { ReactComponent as ReceiveSvg } from "img/Receive.svg";
import { ReactComponent as SendSvg } from "img/Send.svg";
import { ReactComponent as AssetSvg } from "img/Asset.svg";
import { ReloadOutlined } from "@ant-design/icons";
import ConnectNostr from "components/Common/ConnectNostr";
const ASSET_PLAT_MAP = {
  ETHEREUM: "ETH",
  BRC20: "BTC",
  LIGHTNING: "Lightning",
  TAPROOT: "Taproot"
};
function Account() {
  const { width } = useSize(document.querySelector("body"));
  const [isTransferShow, setIsTransferShow] = useState(false);
  const [isAddressBookShow, setIsAddressBookShow] = useState(false);
  const [detail, setDetail] = useState(null);
  const history = useHistory();
  const { nostrAccount, balanceList, npubNostrAccount } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const usdtDetail = useMemo(() => {
    return tokenList.find((k) => k?.name?.toUpperCase() == "USDT");
  }, [tokenList]);
  const { handleQueryBalance } = useQueryBalance();
  const { list, fetching, reexcuteQuery } = useTokenChangeQuery({});
  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    setInterval(() => {
      reexcuteQuery();
    }, 60000);
    return () => null;
  }, [reexcuteQuery]);
  const handleReloadBalance = useCallback(async () => {
    setReloading(true);
    await handleQueryBalance(npubNostrAccount);
    setReloading(false);
  }, [handleQueryBalance, npubNostrAccount]);
  const totalUsd = useMemo(() => {
    let total = 0;
    if (tokenList?.length) {
      list.forEach((item) => {
        const row = tokenList.find((k) => k?.name == item?.name);
        const balance = balanceList?.[item?.name]?.balanceShow;
        if (item?.name == "USDT") {
          total += BigNumber(balance).toNumber();
        } else if (item?.deal_price && row && balance) {
          total += BigNumber(item.deal_price).div(usdtDetail?.decimals).div(row?.decimals).times(balance).toNumber();
        }
      });
    }

    return total ? numberWithCommas(limitDecimals(total, 2)) : "0.00";
  }, [balanceList, list, tokenList, usdtDetail?.decimals]);
  const transferShow = useCallback((row) => {
    setDetail(row);
    setIsTransferShow(true);
  }, []);
  const onHandleRedirect = useCallback(
    (redirectTo) => {
      history.push(`/${redirectTo}`);
    },
    [history]
  );
  const columns = useMemo(() => {
    if (width > 768) {
      return [
        {
          title: t`Token`,
          dataIndex: "name"
        },
        {
          title: t`Token Address`,
          dataIndex: "token",
          render(text, row) {
            return text ? (
              <Tooltip
                overlayClassName="token-address-tooltip"
                title={
                  <div>
                    <div>Token name: {row?.name || "--"}</div>
                    <div>
                      Token address:{" "}
                      {row?.token
                        ? row?.token?.substring(0, 10) + "..." + row?.token?.substring(row?.token?.length - 6)
                        : "--"}
                    </div>
                    <div>Token Channel: {row?.symbol || "--"}</div>
                    <div>Total supply: {row?.totalSupply || "--"}</div>
                  </div>
                }
              >
                <div>
                  <EllipsisMiddle suffixCount={6}>{text}</EllipsisMiddle>
                </div>
              </Tooltip>
            ) : (
              "--"
            );
          }
        },
        {
          title: t`Last Price`,
          dataIndex: "name",
          width: "140px",
          render: (text, row) => {
            if (text == "USDT") {
              return `$1.00`;
            }
            const priceDetail = list.find((item) => item?.name == text);
            return priceDetail?.deal_price && usdtDetail
              ? `$${numberWithCommas(
                limitDecimals(
                  BigNumber(priceDetail.deal_price).div(usdtDetail?.decimals).div(row?.decimals).toNumber(),
                  2
                )
              )}`
              : "--";
          }
        },
        {
          title: t`Amount`,
          dataIndex: "name",
          width: "140px",
          render: (text) => {
            const balance = balanceList?.[text]?.balanceShow;
            return balance ? numberWithCommas(balance) : "--";
          }
        },
        {
          title: t`USD Value`,
          dataIndex: "name",
          width: "140px",
          render: (text, row) => {
            const balance = balanceList?.[text]?.balanceShow || 0;
            if (text == "USDT") {
              return `$${numberWithCommas(limitDecimals(balance, 2))}`;
            }
            const priceDetail = list.find((item) => item?.name == text);
            return priceDetail?.deal_price && usdtDetail
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
        },
        {
          title: t`Action`,
          dataIndex: "status",
          width: 260,
          render: (text, row) => {
            return (
              <div className="account-table-btns">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    const platform = ASSET_PLAT_MAP[row.assetType];
                    onHandleRedirect(`receive/${platform}/${row?.name}`);
                  }}
                >
                  {t`Receive`}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  // onClick={() => {
                  //   message.info("Coming soon.")
                  // }}
                  onClick={() => {
                    const platform = ASSET_PLAT_MAP[row.assetType];
                    onHandleRedirect(`send/${platform}/${row?.name}`);
                  }}
                >
                  {t`Send`}
                </Button>
                <Button type="primary" size="small" onClick={() => transferShow(row)}>
                  {t`Transfer`}
                </Button>
              </div>
            );
          }
        }
      ];
    } else {
      return [
        {
          title: t`Token`,
          dataIndex: "name"
        },
        {
          title: t`Token Address`,
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
                        ? row?.token?.substring(0, 10) + "..." + row?.token?.substring(row?.token?.length - 6)
                        : "--"}
                    </div>
                    <div>Token Channel: {row?.symbol || "--"}</div>
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
  }, [balanceList, list, onHandleRedirect, transferShow, usdtDetail, width]);
  return (
    <>
      {nostrAccount ? (
        <div className="account">
          <div className="account-head">
            <div className="account-head-left">
              <div className="account-head-left-logo">
                <img src={avatar} alt="" />
              </div>

              <div className="account-head-left-nostr">
                <div className="f14">My Nostr Address</div>
                <div className="account-head-left-nostr-text">
                  <EllipsisMiddle suffixCount={8}>{nip19.npubEncode(nostrAccount)}</EllipsisMiddle>
                </div>
                <div className="account-head-left-btns">
                  <ProModal />
                  <Button
                    className="account-head-left-btns-addressBook"
                    size="small"
                    type="primary"
                    onClick={() => setIsAddressBookShow(true)}
                  >
                    {t`Address Book`}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="account-table-box">
            <div className="account-tokenList-title">
              <img src={asset} alt="" />
              <span>{t`Assets`}</span>
              <span className="account-tokenList-title__reload" onClick={handleReloadBalance}>
                <ReloadOutlined />
              </span>
            </div>
            <div className="account-tokenList-actions">
              <div className="account-tokenList-total">${totalUsd}</div>
              <div className="account-tokenList-actions-btns">
                {width > 768 ? (
                  <>
                    <Button
                      type="primary"
                      icon={<TransferSvg width={22} height={22} />}
                      onClick={() => transferShow(null)}
                    >
                      {t`Nostr Assets Transfer`}
                    </Button>
                    <Button
                      type="primary"
                      icon={<ReceiveSvg width={26} color="#fff" height={26} />}
                      onClick={() => {
                        onHandleRedirect("receive");
                      }}
                    >{t`Receive Assets`}</Button>
                    <Button
                      type="primary"
                      icon={<SendSvg width={26} height={26} />}
                      onClick={() => {
                        onHandleRedirect("send");
                      }}
                    >{t`Send Assets`}</Button>
                    <Button
                      type="primary"
                      icon={<AssetSvg width={26} height={26} />}
                      // onClick={() => message.info("Coming soon")}
                      onClick={() => {
                        onHandleRedirect("importAssets");
                      }}
                    >
                      {t`Import Assets`}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="primary" size="small" onClick={() => transferShow(null)}>
                      {t`Transfer`}
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        onHandleRedirect("receive");
                      }}
                    >{t`Receive`}</Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        onHandleRedirect("send");
                      }}
                    >{t`Send`}</Button>
                    <Button type="primary" size="small" onClick={() => message.info("Coming soon")}>
                      {t`Import`}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Spin spinning={reloading}>
              <Table
                className="table-light"
                loading={!tokenList.length}
                // sticky
                showSorterTooltip={false}
                rowKey="name"
                columns={tokenList.length > 0 ? columns : []}
                dataSource={tokenList || []}
                pagination={false}
              />
            </Spin>
          </div>
          <Transfer isTransferShow={isTransferShow} setIsTransferShow={setIsTransferShow} detail={detail}></Transfer>
          <AddressBook isAddressBookShow={isAddressBookShow} setIsAddressBookShow={setIsAddressBookShow}></AddressBook>
        </div>
      ) : (
        <div className="account-nologin">
          <div className="account-nologin-title">{t`Welcome to Nostr`}</div>
          <div className="account-nologin-content">
            <div className="account-nologin-content-text">
              {t`The first asset management platform built on Nostr Protocol. Efficient, Gasless and Safe.`}
            </div>
            <div className="account-nologin-content-text">
              {t`Connect Nostr now to manage your assets.`}
            </div>
            <div className="account-nologin-content-btns">
              {/* <Button
                className="account-nologin-content-btns-deposit"
                onClick={() => {
                  onHandleRedirect("receive");
                }}
              >{t`Receive Assets`}</Button> */}
              <ConnectNostr />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default memo(Account);
