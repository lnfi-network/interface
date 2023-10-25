import "./index.scss";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useDebounce } from "ahooks";
import { Table, Select, Input, Collapse, Button, Row, Col, Form } from "antd";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
const { Panel } = Collapse;
import EllipsisMiddle from "components/EllipsisMiddle";
import OrderDetail from "./comps/OrderDetail";
import { useListingOrderQuery } from "hooks/graphQuery/useExplore";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import BigNumber from "bignumber.js";
import { getQueryVariable } from "lib/url";
import { utcToClient } from "lib/dates";
import { QUOTE_ASSET } from "config/constants";
import { convertDollars } from "lib/utils/index";
const initQuery = {
  type: "",
  token: "",
  nostrAddress: "",
  status: ""
};

export default function OrderHistory() {
  const [currentRow, setCurrentRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [type, setType] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [nostrAddress, setNostrAddress] = useState(getQueryVariable("nostrAddress"));
  const debouncedNostrAddress = useDebounce(nostrAddress, { wait: 1000 });
  const [width, setWidth] = useState(document.body.clientWidth);
  const [filter, setFilter] = useState({
    ...initQuery,
    nostrAddress: getQueryVariable("nostrAddress")
  });
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const { list, total, fetching, reexcuteQuery } = useListingOrderQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    type,
    token,
    status,
    nostrAddress: debouncedNostrAddress
  });
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
      // {
      //   value: "Unfilled",
      //   label: t`Unfilled`,
      // },
      // {
      //   value: "Partial",
      //   label: t`Partial`,
      // },
      // {
      //   value: "Filled",
      //   label: t`Filled`,
      // },
      // {
      //   value: "Cancelled",
      //   label: t`Cancelled`,
      // },
    ];
  }, []);
  const handleResize = useCallback(() => {
    setWidth(document.body.clientWidth);
  }, []);
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
  const addressChange = useCallback((e) => {
    //
    setPageIndex(1);
    setNostrAddress(e.target.value);
  }, []);
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
              <div className="color-yellow">{text && cur
                ? `${numberWithCommas(limitDecimals(text / cur?.decimals, cur?.reserve))} ${QUOTE_ASSET}`
                : "--"}</div>
              <div className="color-dark">
                {/* {quote_pirce ? `≈$${numberWithCommas(limitDecimals(text / cur?.decimals * quote_pirce, 2))}` : "--"} */}
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
          //   quote_pirce
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
        // render: (text) => <span>{text ? numberWithCommas(text) : "--"}</span>
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
          //       INIT_PENDING(0,"下单扣款中"),

          // INIT(0,"下单成功"),

          // INIT_FAIL(0,"下单成功"),

          // // 先放数据库中 然后加载到内存
          // PUSH_MARKET_SUCCESS(0,"推送撮合系统成功"),

          // PUSH_MARKET_FAIL(0,"推送撮合系统失败"),

          // TAKE_LOCK(0,"指定订单交易中"),

          // PART_SUCCESS(0,"部分成交"),

          // TRADE_PENDING(0,"交易中"),

          // TRADE_FAI(0,"交易失败"),

          // SUCCESS(0,"订单完成"),

          // CANCEL_PENDING(0,"取消中"),

          // CANCEL(0,"取消完成"),

          // CANCEL_FAIL(0,"取消失败"),
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
            case "CANCEL":
              txt = "Cancelled";
              break;
            case "INIT_FAIL":
              txt = "Init Fail";
              break;
            default:
              cls = "";
              txt = "";
          }
          return <span className={cls}>{txt || text || "--"}</span>;
        }
      },
      {
        title: t`Detail`,
        dataIndex: "detail",
        render: (text, row) => (
          <span
            className="detail"
            onClick={() => {
              setCurrentRow({
                ...row
              });
              setOpenDrawer(true);
            }}
          >{t`Detail`}</span>
        )
      }
    ];
  }, [quote_pirce, tokenList, typeOptions]);

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
        <Form.Item label={""} name="nostrAddress" initialValue={getQueryVariable("nostrAddress")}>
          <Input
            className="input address"
            onChange={addressChange}
            style={{
              minWidth: "240px"
            }}
            placeholder={t`Please enter Event ID or Address`}
          />
        </Form.Item>
        {/* <Form.Item className="search-btn-item">
        <Button htmlType="submit" type="primary">
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
    addressChange,
    form,
    memoTokenList,
    onFinish,
    statusChange,
    statusOptions,
    tokenChange,
    typeChange,
    typeOptions,
    width
  ]);
  return (
    <>
      <div className="marketplace-orderHistory">
        <div className="marketplace-filters">{filters}</div>
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
        <OrderDetail detail={currentRow} open={openDrawer} onClose={onCloseDrawer} />
      </div>
    </>
  );
}
