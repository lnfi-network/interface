import "./explore.scss";
import { useCallback, useState, useEffect, useMemo } from "react";

import {
  Table,
  Select,
  Tooltip,
  Input,
  Collapse,
  Button,
  Row,
  Col,
  Form,
} from "antd";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
const { Panel } = Collapse;
import EllipsisMiddle from "components/EllipsisMiddle";
import MarketDetail from "./comps/ExploreDetails/MarketDetail";
import { useMarketQuery } from "hooks/graphQuery/useExplore";
import { useSelector } from "react-redux";
const initQuery = {
  type: "",
  token: "",
  nostrAddress: "",
};

export default function MarketTransactions() {
  const [currentRow, setCurrentRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [width, setWidth] = useState(document.body.clientWidth);
  const [filter, setFilter] = useState({ ...initQuery });
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const { tokenList } = useSelector(({ market }) => market);
  const { list, total, fetching, reexcuteQuery } = useMarketQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    filter,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typeOptions = [
    {
      value: "",
      label: t`All`,
    },
    {
      value: "PlaceOrder",
      label: t`PlaceOrder`,
    },
    {
      value: "Batch",
      label: t`Batch`,
    },
    {
      value: "Cancel Order",
      label: t`Cancel Order`,
    },
    {
      value: "Take order",
      label: t`Take order`,
    },
  ];
  const tokenOptions = useMemo(() => {
    return [
      {
        value: "",
        label: t`All`,
      },
      {
        value: "ordi",
        label: t`ordi`,
      },
    ];
  }, []);
  const memoTokenList = useMemo(() => {
    var arr = [{ label: "All", value: "" }];
    tokenList.forEach((item) => {
      if (item.name !== "USDT") {
        arr.push({ ...item, label: item.name, value: item.name });
      }
    });
    return arr;
    // tokenList.filter((tokenItem) => tokenItem.name !== "USDT")
  }, [tokenList]);
  const handleResize = useCallback(() => {
    setWidth(document.body.clientWidth);
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
        dataIndex: "messageid",
        // width: 180,
        render(text, _) {
          return <EllipsisMiddle suffixCount={6}>{text}</EllipsisMiddle>;
        },
      },
      {
        title: t`Time`,
        dataIndex: "create_time",
        // width: 120,
        render: (text) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--",
      },
      {
        title: t`Type`,
        dataIndex: "type",
      },
      {
        title: t`Token`,
        dataIndex: "token",
      },
      {
        title: t`Address`,
        dataIndex: "nostr_address",
        // width: 180,
        render(text) {
          return (
            <Row>
              <Col className="f12 Poppins">
                {text ? (
                  <EllipsisMiddle suffixCount={6}>{text}</EllipsisMiddle>
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
        render: (text, row) => {
          let cls;
          let txt;
          switch (text?.toLowerCase()) {
            case "scucess":
              cls = "color-green";
              txt = "Success";
              break;
            case "success":
              cls = "color-green";
              txt = "Success";
              break;
            case "fail":
              cls = "color-red";
              txt = "Failed";
              break;
            case "failed":
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
          if (txt == "Failed") {
            return (
              <Tooltip color="#6f6e84" title={row?.message_detail || ""}>
                <span className={cls}>{txt || text || "--"}</span>
              </Tooltip>
            );
          } else {
            return <span className={cls}>{txt || text || "--"}</span>;
          }
        },
      },
      {
        title: t`Detail`,
        dataIndex: "detail",
        render: (text, row) => (
          <span
            className="detail"
            onClick={() => {
              setCurrentRow({
                ...row,
              });
              setOpenDrawer(true);
            }}
          >{t`Detail`}</span>
        ),
      },
    ];
  }, []);

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
        }}
      >
        <Form.Item label={t`Type`} name="type" className="token-item">
          <Select
            className="select"
            options={typeOptions}
            style={{
              width: "100%",
              minWidth: "140px",
            }}
          />
        </Form.Item>
        <Form.Item label={t`Token`} name="token" className="token-item">
          <Select
            className="select"
            options={memoTokenList}
            style={{
              width: "100%",
              minWidth: "140px",
            }}
          />
        </Form.Item>
        <Form.Item label={""} name="nostrAddress">
          <Input
            className="input address"
            placeholder={t`Please enter Event ID or Address`}
          />
        </Form.Item>
        <Form.Item className="search-btn-item">
          <Button htmlType="submit" type="primary">
            {t`Search`}
          </Button>
          <Button type="default" onClick={handleReset}>
            {t`Reset`}
          </Button>
        </Form.Item>
      </Form>
    );
    if (width > 850) {
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
  }, [form, handleReset, memoTokenList, onFinish, typeOptions, width]);
  return (
    <>
      <div className="market-explore">
        <div className="market-explore-filters">{filters}</div>
        <Table
          className="table-light explore-table"
          loading={fetching}
          scroll={{
            x: 768,
          }}
          // sticky
          showSorterTooltip={false}
          rowKey="messageid"
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
        <MarketDetail
          detail={currentRow}
          open={openDrawer}
          onClose={onCloseDrawer}
        />
      </div>
    </>
  );
}
