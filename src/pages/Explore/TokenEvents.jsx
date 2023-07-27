import "./explore.scss";
import { useCallback, useState, useEffect, useMemo } from "react";
import { isEqual } from "lodash";
import {
  Table,
  Select,
  Input,
  Collapse,
  Button,
  Row,
  Col,
  Form,
  Tooltip,
} from "antd";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
const { Panel } = Collapse;
import EllipsisMiddle from "components/EllipsisMiddle";
import TokenDetail from "./comps/ExploreDetails/TokenDetail";
import { useTokenQuery } from "hooks/graphQuery/useExplore";
import { useSelector } from "react-redux";
import { getQueryVariable } from "lib/url";
const initQuery = {
  type: "",
  token: "",
  nostrAddress: "",
};

export default function TokenTransfers() {
  const [currentRow, setCurrentRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [width, setWidth] = useState(document.body.clientWidth);
  const [filter, setFilter] = useState({
    ...initQuery,
    nostrAddress: getQueryVariable("nostrAddress"),
    type: getQueryVariable("type"),
  });
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const { tokenList } = useSelector(({ market }) => market);
  const { list, total, fetching, reexcuteQuery } = useTokenQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    filter,
  });
  // useEffect(() => {
  //   handleQueryTokenList()
  // }, [handleQueryTokenList])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typeOptions = [
    {
      value: "",
      label: t`All`,
    },
    {
      value: "deposit",
      label: t`Deposit`,
    },
    {
      value: "withdraw",
      label: t`Withdraw`,
    },
    {
      value: "approve",
      label: t`Approve`,
    },
    {
      value: "transfer",
      label: t`Transfer`,
    },

    {
      value: "transferFrom",
      label: t`transferFrom`,
    },
    {
      value: "openPro",
      label: t`openPro`,
    },
    {
      value: "closePro",
      label: t`closePro`,
    },
    {
      value: "deleteAddressBook",
      label: t`deleteAddressBook`,
    },
    {
      value: "addressBookAdd",
      label: t`addressBookAdd`,
    },
  ];
  const memoTokenList = useMemo(() => {
    var arr = [{ label: "All", value: "" }];
    tokenList.forEach((item) => {
      // if (item.name !== "USDT") {
      arr.push({ ...item, label: item.name, value: item.name });
      // }
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
    //
    return [
      {
        title: t`Event ID`,
        dataIndex: "event_id",
        // width: 180,
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
        dataIndex: "create_at",
        // width: 120,
        render: (text) =>
          text ? dayjs.unix(text).format("YYYY-MM-DD HH:mm:ss") : "--",
      },
      {
        title: t`Type`,
        dataIndex: "type",
        render: (text) => {
          const row = typeOptions.find((item) => item.value == text);
          return row?.label ? row?.label : text || "--";
        },
      },
      {
        title: t`Token`,
        dataIndex: "token",
        render: (text) => {
          return text == "--" ? (
            <Tooltip
              color="#6f6e84"
              title={t`This is batch event, please view on detail.`}
            >
              <span>{text}</span>
            </Tooltip>
          ) : (
            text || "--"
          );
        },
      },
      {
        title: t`Address`,
        dataIndex: "sender_address",
        // width: 180,
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
        render: (text, row) => {
          let cls;
          let txt;
          switch (text) {
            case 0:
              cls = "color-green";
              txt = "Success";
              break;
            case 1:
              cls = "color-red";
              txt = "Failed";
              break;
            default:
              cls = "";
              txt = "";
          }
          if (txt == "Failed") {
            // var msg = row?.error
            //   ? JSON.parse(row?.error)
            //   : null;
            // try {
            //   msg = msg?.data ? JSON.parse(msg?.data) : msg;
            // } catch (error) { }
            //
            return (
              <Tooltip color="#6f6e84" title={row?.error}>
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
  }, [typeOptions]);

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
      if (isEqual(filter, filterObj)) {
        reexcuteQuery();
      } else {
        setFilter({ ...filterObj });
      }
      // reexcuteQuery();
    },
    [filter, reexcuteQuery]
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
          nostrAddress: getQueryVariable("nostrAddress"),
          type: getQueryVariable("type"),
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
  }, [form, handleReset, memoTokenList, onFinish, typeOptions, width]);
  return (
    <>
      <div className="market-explore">
        <div className="market-explore-filters">{filters}</div>
        <Table
          className="table-light explore-table"
          loading={fetching}
          scroll={{
            x: 850,
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
        <TokenDetail
          detail={currentRow}
          open={openDrawer}
          onClose={onCloseDrawer}
        />
      </div>
    </>
  );
}
