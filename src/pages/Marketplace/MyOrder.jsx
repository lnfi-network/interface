import "./index.scss";
import { useCallback, useState, useEffect, useMemo } from "react";

import {
  Spin,
  Table,
  Select,
  Pagination,
  Collapse,
  Button,
  Row,
  Col,
  Form,
  message,
} from "antd";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
const { Panel } = Collapse;
import EllipsisMiddle from "components/EllipsisMiddle";
// import ExploreDetails from "../Explore/comps/ExploreDetails";
import { useMyOrderQuery } from "hooks/graphQuery/useExplore";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { useSelector } from "react-redux";
import useGetNostrAccount from "hooks/useGetNostrAccount";
import { nip19 } from "nostr-tools";
import { useCancelOrder } from "hooks/useNostrMarket";
import BigNumber from "bignumber.js";
import { utcToClient } from "lib/dates"
const initQuery = {
  type: "",
  token: "",
  nostrAddress: "",
  status: "",
};
function CancelButton({ reexcuteQuery, row }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const { handleCancelOrderAsync } = useCancelOrder();
  const onCancelOrder = useCallback(
    async (orderId) => {
      setCancelLoading(true);
      const ret = await handleCancelOrderAsync(orderId);
      if (ret.code == 0) {
        message.success(t`Submit successfully`);
        setCancelLoading(false);
        reexcuteQuery();
      } else {
        setCancelLoading(false);
        message.error(ret.data || "Fail");
      }
    },
    [handleCancelOrderAsync, reexcuteQuery]
  );
  return (
    <Button
      className="cancel"
      loading={cancelLoading}
      type="link"
      onClick={() => {
        //
        onCancelOrder(row.id);
      }}
    >{t`Cancel`}</Button>
  );
}
export default function MyOrder() {
  const [currentRow, setCurrentRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [type, setType] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [width, setWidth] = useState(document.body.clientWidth);
  const [filter, setFilter] = useState({ ...initQuery });
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const { handleGetNostrAccount } = useGetNostrAccount();
  const { nostrAccount } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const { handleCancelOrderAsync } = useCancelOrder();
  const { list, total, fetching, reexcuteQuery } = useMyOrderQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    type,
    token,
    status,
    owner: nostrAccount,
  });
  useEffect(() => {
    if (!nostrAccount) {
      handleGetNostrAccount();
    }
  }, [handleGetNostrAccount, nostrAccount]);
  const memoTokenList = useMemo(() => {
    var arr = [{ label: "All Token", value: "" }];
    tokenList.forEach((item) => {
      if (item.name !== "USDT") {
        arr.push({ ...item, label: item.name, value: item.name });
      }
    });
    return arr;
    // tokenList.filter((tokenItem) => tokenItem.name !== "USDT")
  }, [tokenList]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typeOptions = [
    {
      value: "",
      label: t`Buy/Sell`,
    },
    {
      value: "buy",
      label: t`Buy`,
    },
    {
      value: "sell",
      label: t`Sell`,
    },
  ];
  const typeChange = useCallback((value) => {
    setPageIndex(1);
    setType(value);
  }, []);
  const tokenChange = useCallback((value) => {
    setPageIndex(1);
    setToken(value);
  }, []);
  const statusChange = useCallback((value) => {
    setPageIndex(1);
    setStatus(value);
  }, []);
  const statusOptions = useMemo(() => {
    return [
      {
        value: "",
        label: t`All Status`,
      },
      {
        value: "Open Orders",
        label: t`Open Orders`,
      },
      {
        value: "History Orders",
        label: t`History Orders`,
      },
    ];
  }, []);
  const handleResize = useCallback(() => {
    setWidth(document.body.clientWidth);
  }, []);
  const onCancelOrder = useCallback(
    async (orderId) => {
      setCancelLoading(true);
      const ret = await handleCancelOrderAsync(orderId);
      if (ret.code == 0) {
        message.success(t`Submit successfully`);
        setCancelLoading(false);
        reexcuteQuery();
      } else {
        setCancelLoading(false);
        message.error(ret.data || "Fail");
      }
    },
    [handleCancelOrderAsync, reexcuteQuery]
  );
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  const columns = useMemo(() => {
    return [
      {
        title: t`Event ID`,
        dataIndex: "event_id",
        width: 180,
        render(text, _) {
          return text ? (
            <EllipsisMiddle suffixCount={6}>
              {nip19.noteEncode(text)}
            </EllipsisMiddle>
          ) : (
            "--"
          );
        },
      },
      {
        title: t`Time`,
        dataIndex: "create_time",
        width: 120,
        render: (text) => utcToClient(text)
      },
      {
        title: t`Order ID`,
        dataIndex: "id",
        render: (text) => {
          return text || "--";
        },
      },
      {
        title: t`Type`,
        dataIndex: "type",
        render: (text) => {
          const row = typeOptions.find((item) => item.value == text);
          let cls;
          switch (text?.toLowerCase()) {
            case "buy":
              cls = "color-green";
              break;
            case "sell":
              cls = "color-red";
              break;
            default:
              cls = "";
          }
          return (
            <span className={cls}>
              {row?.label ? row?.label : text || "--"}
            </span>
          );
        },
      },

      {
        title: t`Token`,
        dataIndex: "token",
      },
      {
        title: t`Price`,
        dataIndex: "price",
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == "USDT");
          return (
            <span className="color-yellow">
              {text && cur
                ? `${numberWithCommas(
                  limitDecimals(text / cur?.decimals, cur?.reserve)
                )} USDT`
                : "--"}
            </span>
          );
        },
      },
      {
        title: t`Remaining`,
        dataIndex: "deal_volume",
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == row.token);
          return (
            <span>
              {numberWithCommas(
                BigNumber(row.volume).minus(text).div(cur?.decimals).toNumber()
              )}
            </span>
          );
        },
      },
      {
        title: t`Amount`,
        dataIndex: "volume",
        // render: (text) => <span>{text ? numberWithCommas(text) : "--"}</span>,
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == row.token);
          return (
            <span>
              {numberWithCommas(BigNumber(text).div(cur?.decimals).toNumber())}
            </span>
          );
        },
      },
      {
        title: t`Address`,
        dataIndex: "owner",
        width: 180,
        render(text) {
          return (
            <Row>
              <Col className="f12 Poppins">
                {text ? (
                  <EllipsisMiddle suffixCount={6}>
                    {nip19.npubEncode(text)}
                  </EllipsisMiddle>
                ) : (
                  text || "--"
                )}
              </Col>
            </Row>
          );
        },
      },
      {
        title: t`Status`,
        dataIndex: "status",
        render: (text) => {
          //           INIT(0,"下单成功"),

          // // 先放数据库中 然后加载到内存
          // PUSH_MARKET_SUCCESS(0,"推送撮合系统成功"),

          // PUSH_MARKET_FAIL(0,"推送撮合系统失败"),

          // TAKE_LOCK(0,"指定订单交易中"),

          // PART_SUCCESS(0,"部分成交"),

          // TRADE_PENDING(0,"交易中"),

          // SUCCESS(0,"订单完成"),

          // CANCEL_PENDING(0,"取消中"),

          // CANCEL(0,"取消完成"),
          let cls;
          let txt;
          switch (text) {
            case "INIT":
            case "PUSH_MARKET_SUCCESS":
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
            case "CANCEL_FAIL":
              txt = "Cancel Fail";
              break;
            case "CANCEL":
              txt = "Cancelled";
              break;
            default:
              cls = "";
              txt = "";
          }
          return <span className={cls}>{txt || text || "--"}</span>;
        },
      },
      {
        title: t`Action`,
        dataIndex: "status",
        render: (text, row) => {
          if (
            [
              "INIT",
              "PUSH_MARKET_SUCCESS",
              "PUSH_MARKET_FAIL",
              "TAKE_LOCK",
              "PART_SUCCESS",
            ].includes(text)
          ) {
            return (
              // <Button
              //   className="cancel"
              //   loading={cancelLoading}
              //   type="link"
              //   onClick={() => {
              //     //
              //     onCancelOrder(row.id);
              //   }}
              // >{t`Cancel`}</Button>
              <CancelButton
                reexcuteQuery={reexcuteQuery}
                row={row}
              ></CancelButton>
            );
          } else {
            return <span>--</span>;
          }
        },
      },
    ];
  }, [reexcuteQuery, tokenList, typeOptions]);

  const onPageChange = useCallback((page, pageSize) => {
    setPageIndex(page);
    setPageSize(pageSize);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
    setCurrentRow(null);
  }, []);

  const onFinish = useCallback(
    (values) => {
      let filterObj = {
        ...values,
      };
      //
      setFilter(filterObj);
      reexcuteQuery();
    },
    [reexcuteQuery]
  );

  const handleReset = useCallback(() => {
    form.resetFields();
  }, [form]);
  const filters = useMemo(() => {
    const _form = (
      <Form
        onFinish={onFinish}
        form={form}
        initialValues={{
          type: "",
          token: "",
          status: "",
        }}
      >
        <Form.Item label={t``} name="type" className="token-item">
          <Select
            className="select"
            options={typeOptions}
            onChange={typeChange}
            style={{
              width: "100%",
              minWidth: "140px",
            }}
          />
        </Form.Item>
        <Form.Item label={t``} name="token" className="token-item">
          <Select
            className="select"
            onChange={tokenChange}
            options={memoTokenList}
            style={{
              width: "100%",
              minWidth: "140px",
            }}
          />
        </Form.Item>
        <Form.Item label={t``} name="status" className="token-item">
          <Select
            className="select"
            onChange={statusChange}
            options={statusOptions}
            style={{
              width: "100%",
              minWidth: "140px",
            }}
          />
        </Form.Item>
        {/* <Form.Item className="search-btn-item">
          <Button>Button htmlType="submit" type="primary">
            {t`Search`}
          </Button>
          <Button type="default" onClick={handleReset}>
            {t`Reset`}
          </Button>
        </Form.Item> */}
      </Form>
    );
    if (width > 768) {
      return _form;
    } else {
      return (
        <Collapse defaultActiveKey={[]} ghost expandIconPosition="end">
          <Panel header={t`Filters`} key="1">
            {_form}
          </Panel>
        </Collapse>
      );
    }
  }, [
    form,
    memoTokenList,
    onFinish,
    statusChange,
    statusOptions,
    tokenChange,
    typeChange,
    typeOptions,
    width,
  ]);
  const listMemo = useMemo(() => {
    return list.map((item) => {
      const typeOpt = typeOptions.find((k) => k.value == item.type);
      const cur = tokenList.find((l) => l.name == item.token);
      const usdtToken = tokenList.find((j) => j.name == "USDT");
      let cls;
      switch (item?.type?.toLowerCase()) {
        case "buy":
          cls = "color-green";
          break;
        case "sell":
          cls = "color-red";
          break;
        default:
          cls = "";
      }
      let statusCls;
      let statusTxt;
      switch (item?.status) {
        case "INIT":
        case "PUSH_MARKET_SUCCESS":
        case "TAKE_LOCK":
        case "TRADE_PENDING":
          statusTxt = "Unfilled";
          break;
        case "PART_SUCCESS":
          statusTxt = "Partial";
          statusCls = "color-yellow";
          break;
        case "SUCCESS":
          statusCls = "color-green";
          statusTxt = "Filled";
          break;
        case "CANCEL":
          statusTxt = "Cancelled";
          break;
        default:
          statusCls = "";
          statusTxt = "";
      }
      return (
        <div className="my-order-small" key={item?.event_id}>
          <div className="my-order-section">
            <div className="key title">{item?.token}</div>
            <div className="value time">
              {item.create_time
                ? dayjs(item.create_time).format("YYYY-MM-DD HH:mm:ss")
                : "--"}
            </div>
          </div>
          <div className="my-order-section">
            <div className="key ID">ID</div>
            <div className="value">{item.id || "--"}</div>
          </div>
          <div className="my-order-section">
            <div className="key">Direction</div>
            <div className="value">
              <span className={cls}>
                {typeOpt?.label ? typeOpt?.label : item?.type || "--"}
              </span>
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Amount</div>
            <div className="value">
              {numberWithCommas(
                BigNumber(item.volume).div(cur?.decimals).toNumber()
              )}
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Remaining</div>
            <div className="value">
              {numberWithCommas(
                BigNumber(item.volume)
                  .minus(item.deal_volume)
                  .div(cur?.decimals)
                  .toNumber()
              )}
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Price</div>
            <div className="value">
              <span className="color-yellow">
                {item.price && usdtToken
                  ? `${numberWithCommas(
                    limitDecimals(
                      item.price / usdtToken?.decimals,
                      usdtToken?.reserve
                    )
                  )} USDT`
                  : "--"}
              </span>
            </div>
          </div>
          {/* <div className="my-order-section">
          <div className="key">Total Value</div>
          <div className="value">token</div>
        </div> */}
          <div className="my-order-section">
            <div className="key">Status</div>
            <div className="value">
              <span className={statusCls}>
                {statusTxt || item?.status || "--"}
              </span>
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Event ID</div>
            <div className="value">
              <EllipsisMiddle suffixCount={6}>{item?.event_id}</EllipsisMiddle>
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Address</div>
            <div className="value">
              <EllipsisMiddle suffixCount={6}>{item?.owner}</EllipsisMiddle>
            </div>
          </div>
          {[
            "INIT",
            "PUSH_MARKET_SUCCESS",
            "PUSH_MARKET_FAIL",
            "TAKE_LOCK",
            "PART_SUCCESS",
          ].includes(item.status) && (
              <div>
                <Button
                  className="btn-grey btn-Cancel"
                  onClick={() => {
                    //
                    onCancelOrder(item.id);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
        </div>
      );
    });
  }, [list, onCancelOrder, tokenList, typeOptions]);
  return (
    <>
      <div className="marketplace-orderHistory">
        <div className="marketplace-filters">{filters}</div>
        {width > 768 ? (
          <Table
            className="table-light explore-table"
            loading={fetching}
            scroll={{
              x: 1200,
            }}
            // sticky
            showSorterTooltip={false}
            rowKey="id"
            columns={columns}
            dataSource={list}
            pagination={{
              current: pageIndex,
              total: total,
              pageSize,
              position: ["bottomCenter"],
              onChange: (page, pageSize) => {
                onPageChange(page, pageSize);
              },
            }}
          />
        ) : (
          <>
            {fetching ? (
              <div className="flex1 tc mt30">
                <Spin />
              </div>
            ) : (
              <>
                {listMemo}
                <div className="tc mt20 mb20">
                  <Pagination
                    current={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onChange={onPageChange}
                  />
                </div>
              </>
            )}
          </>
        )}
        {/* <div className="my-order-small">
          <div className="my-order-section">
            <div className="key title">token</div>
            <div className="value">{item?.token}</div>
          </div>
          <div className="my-order-section">
            <div className="key ID">ID</div>
            <div className="value">{item.id || "--"}</div>
          </div>
          <div className="my-order-section">
            <div className="key">Direction</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Amount</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Remaining</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Price</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Total Value</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Status</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Message ID</div>
            <div className="value">token</div>
          </div>
          <div className="my-order-section">
            <div className="key">Nostr Address</div>
            <div className="value">token</div>
          </div>
          <div>
            <Button className="btn-grey btn-Cancel">Cancel</Button>
          </div>
        </div> */}
        {/* <ExploreDetails
          detail={currentRow}
          open={openDrawer}
          onClose={onCloseDrawer}
        /> */}
      </div>
    </>
  );
}
