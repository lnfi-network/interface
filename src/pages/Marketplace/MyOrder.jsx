import "./index.scss";
import { useCallback, useState, useEffect, useMemo } from "react";

import { Spin, Table, Select, Pagination, Collapse, Button, Row, Col, Form, message, Tooltip } from "antd";
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
import { useCancelOrder, useRepairOrder } from "hooks/useNostrMarket";
import BigNumber from "bignumber.js";
import { utcToClient } from "lib/dates";
import { QUOTE_ASSET } from "config/constants";
import { convertDollars, statusMap } from "lib/utils/index";
import useDevice from "hooks/useDevice";
const initQuery = {
  type: "",
  token: "",
  nostrAddress: "",
  status: ""
};
function RepairButton({ reexcuteQuery, row }) {
  const [loading, setLoading] = useState(false);
  const { handleRepairOrderAsync } = useRepairOrder();
  const onRepairOrder = useCallback(
    async (orderId) => {
      setLoading(true);
      try {
        const ret = await handleRepairOrderAsync(orderId);
        if (ret.code == 0) {
          message.success(t`Submit successfully`);
          setLoading(false);
          reexcuteQuery && reexcuteQuery();
        } else {
          setLoading(false);
          message.error(ret.data || "Fail");
        }
      } catch (error) {
        setLoading(false);
      }
    },
    [handleRepairOrderAsync, reexcuteQuery]
  );
  return (
    <Button
      className="repair"
      size="small"
      loading={loading}
      // type="primary"
      danger
      onClick={() => {
        //
        onRepairOrder(row.id);
      }}
    >{t`Repair`}</Button>
  );
}
function CancelButton({ reexcuteQuery, row }) {
  const device = useDevice();
  const [cancelLoading, setCancelLoading] = useState(false);
  const { handleCancelOrderAsync } = useCancelOrder();
  const onCancelOrder = useCallback(
    async (orderId) => {
      setCancelLoading(true);
      try {
        const ret = await handleCancelOrderAsync(orderId);
        if (ret.code == 0) {
          message.success(t`Submit successfully`);
          setCancelLoading(false);
          reexcuteQuery && reexcuteQuery();
        } else {
          setCancelLoading(false);
          message.error(ret.data || "Fail");
        }
      } catch (error) {
        setCancelLoading(false);
      }
    },
    [handleCancelOrderAsync, reexcuteQuery]
  );
  return device.isMobile ? (
    <Button
      className="cancel btn-grey"
      loading={cancelLoading}
      type={"default"}
      size="small"
      onClick={() => {
        //
        onCancelOrder(row.id);
      }}
    >{t`Cancel`}</Button>
  ) : (
    <Button
      className="cancel"
      loading={cancelLoading}
      type={"text"}
      onClick={() => {
        //
        onCancelOrder(row.id);
      }}
    >{t`Cancel`}</Button>
  );
}
export default function MyOrder() {
  const device = useDevice();
  const [currentRow, setCurrentRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [type, setType] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [filter, setFilter] = useState({ ...initQuery });
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const { handleGetNostrAccount } = useGetNostrAccount();
  const { nostrAccount } = useSelector(({ user }) => user);
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const { handleCancelOrderAsync } = useCancelOrder();
  const { list, total, fetching, reexcuteQuery } = useMyOrderQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    type,
    token,
    status,
    owner: nostrAccount
  });
  useEffect(() => {
    if (!nostrAccount) {
      handleGetNostrAccount();
    }
  }, [handleGetNostrAccount, nostrAccount]);
  const memoTokenList = useMemo(() => {
    var arr = [{ label: "All Token", value: "" }];
    tokenList.forEach((item) => {
      if (item.name !== QUOTE_ASSET) {
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
      label: t`Buy/Sell`
    },
    {
      value: "buy",
      label: t`Buy`
    },
    {
      value: "sell",
      label: t`Sell`
    }
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
        label: t`All Status`
      },
      {
        value: "Open Orders",
        label: t`Open Orders`
      },
      {
        value: "History Orders",
        label: t`History Orders`
      }
    ];
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
  const columns = useMemo(() => {
    return [
      {
        title: t`Event ID`,
        dataIndex: "event_id",
        width: 180,
        render(text, _) {
          return text ? <EllipsisMiddle suffixCount={6}>{nip19.noteEncode(text)}</EllipsisMiddle> : "--";
        }
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
        }
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
          return <span className={cls}>{row?.label ? row?.label : text || "--"}</span>;
        }
      },

      {
        title: t`Token`,
        dataIndex: "token"
      },
      {
        title: t`Price`,
        dataIndex: "price",
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == QUOTE_ASSET);
          return text && cur ? (
            <div>
              <div className="color-yellow">
                {text && cur
                  ? `${numberWithCommas(limitDecimals(text / cur?.decimals, cur?.reserve))} ${QUOTE_ASSET}`
                  : "--"}
              </div>
              <div className="color-dark">
                {/* {quote_pirce ? `≈$${numberWithCommas(limitDecimals((text / cur?.decimals) * quote_pirce, 2))}` : "--"} */}
                {convertDollars(text / cur?.decimals, quote_pirce)}
              </div>
            </div>
          ) : (
            "--"
          );
          // return (
          //   <span className="color-yellow">
          //     {text && cur
          //       ? `${numberWithCommas(limitDecimals(text / cur?.decimals, cur?.reserve))} ${QUOTE_ASSET}`
          //       : "--"}
          //   </span>
          // );
        }
      },
      {
        title: t`Remaining`,
        dataIndex: "deal_volume",
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == row.token);
          return <span>{numberWithCommas(BigNumber(row.volume).minus(text).div(cur?.decimals).toNumber())}</span>;
        }
      },
      {
        title: t`Amount`,
        dataIndex: "volume",
        // render: (text) => <span>{text ? numberWithCommas(text) : "--"}</span>,
        render: (text, row) => {
          const cur = tokenList.find((item) => item.name == row.token);
          return <span>{numberWithCommas(BigNumber(text).div(cur?.decimals).toNumber())}</span>;
        }
      },
      {
        title: t`Address`,
        dataIndex: "owner",
        width: 180,
        render(text) {
          return (
            <Row>
              <Col className="f12 Poppins">
                {text ? <EllipsisMiddle suffixCount={6}>{nip19.npubEncode(text)}</EllipsisMiddle> : text || "--"}
              </Col>
            </Row>
          );
        }
      },
      {
        title: t`Status`,
        dataIndex: "status",
        render: (text) => {
          const { cls, txt, tip } = statusMap(text);
          return (
            <Tooltip title={tip || ""}>
              <span className={cls}>{txt || "--"}</span>
            </Tooltip>
          );
        }
      },
      {
        title: t`Action`,
        dataIndex: "status",
        render: (text, row) => {
          if (["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"].includes(text)) {
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
              <CancelButton reexcuteQuery={reexcuteQuery} row={row}></CancelButton>
            );
          } else if (["TRADE_FAIL"].includes(text)) {
            return <RepairButton reexcuteQuery={reexcuteQuery} row={row}></RepairButton>;
          } else {
            return <span>--</span>;
          }
        }
      }
    ];
  }, [quote_pirce, reexcuteQuery, tokenList, typeOptions]);

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
        ...values
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
          status: ""
        }}
      >
        <Form.Item label={t``} name="type" className="token-item">
          <Select
            className="select"
            options={typeOptions}
            onChange={typeChange}
            style={{
              width: "100%",
              minWidth: "140px"
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
              minWidth: "140px"
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
              minWidth: "140px"
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
    if (!device.isMobile) {
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
    device.isMobile,
    form,
    memoTokenList,
    onFinish,
    statusChange,
    statusOptions,
    tokenChange,
    typeChange,
    typeOptions
  ]);
  const listMemo = useMemo(() => {
    return list.map((item) => {
      const typeOpt = typeOptions.find((k) => k.value == item.type);
      const cur = tokenList.find((l) => l.name == item.token);
      const qutoAsset = tokenList.find((j) => j.name == QUOTE_ASSET);
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
      const { cls: statusCls, txt, tip } = statusMap(item?.status);
      return (
        <div className="my-order-small" key={item?.event_id}>
          <div className="my-order-section">
            <div className="key title">{item?.token}</div>
            <div className="value time">
              {/* {item.create_time ? dayjs(item.create_time).format("YYYY-MM-DD HH:mm:ss") : "--"} */}
              {utcToClient(item.create_time)}
            </div>
          </div>
          <div className="my-order-section">
            <div className="key ID">ID</div>
            <div className="value">{item.id || "--"}</div>
          </div>
          <div className="my-order-section">
            <div className="key">Direction</div>
            <div className="value">
              <span className={cls}>{typeOpt?.label ? typeOpt?.label : item?.type || "--"}</span>
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Amount</div>
            <div className="value">{numberWithCommas(BigNumber(item.volume).div(cur?.decimals).toNumber())}</div>
          </div>
          <div className="my-order-section">
            <div className="key">Remaining</div>
            <div className="value">
              {numberWithCommas(BigNumber(item.volume).minus(item.deal_volume).div(cur?.decimals).toNumber())}
            </div>
          </div>
          <div className="my-order-section">
            <div className="key">Price</div>
            <div className="value">
              <span className="color-yellow">
                {item.price && qutoAsset
                  ? `${numberWithCommas(
                      limitDecimals(item.price / qutoAsset?.decimals, qutoAsset?.reserve)
                    )} ${QUOTE_ASSET}`
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
              <Tooltip title={tip || ""}>
                <span className={statusCls}>{txt || "--"}</span>
              </Tooltip>
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
          {["INIT", "PUSH_MARKET_SUCCESS", "PUSH_MARKET_FAIL", "PART_SUCCESS"].includes(item.status) && (
            <div>
              <CancelButton reexcuteQuery={reexcuteQuery} row={item}></CancelButton>
            </div>
          )}
          {["TRADE_FAIL"].includes(item.status) && (
            <div>
              <RepairButton reexcuteQuery={reexcuteQuery} row={item}></RepairButton>
            </div>
          )}
        </div>
      );
    });
  }, [list, reexcuteQuery, tokenList, typeOptions]);
  return (
    <>
      <div className="marketplace-orderHistory">
        <div className="marketplace-filters">{filters}</div>
        {!device.isMobile ? (
          <Table
            className="table-light explore-table"
            loading={fetching}
            scroll={{
              x: 1200
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
              }
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
                  <Pagination current={pageIndex} pageSize={pageSize} total={total} onChange={onPageChange} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
