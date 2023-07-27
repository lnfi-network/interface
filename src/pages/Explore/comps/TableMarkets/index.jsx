import { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Progress, Modal, Typography, Button } from "antd";
import { useSelector } from "react-redux";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import { RightSquareOutlined } from "@ant-design/icons";
import { Trans, t } from "@lingui/macro";
import { useHistory } from "react-router-dom";
const { Paragraph } = Typography;
export default function TableMarkets() {
  const history = useHistory();
  const wsContractList = useSelector(({ basic }) => basic.wsContractList);
  const allIndexTagPrice = useSelector(({ basic }) => basic.allIndexTagPrice);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState({});
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    setDetail(null);
  };
  const handleClickRow = useCallback((text, record, str) => {
    //
    setDrawerTitle(str);
    setDetail(record);
    showDrawer();
  }, []);
  const goTrade = useCallback(
    (row) => {
      const splArr = row.contractName.split("-");
      const params =
        splArr[0] == "E" ? splArr[1] : splArr[1] + "?altcoin=" + splArr[0];
      history.push(`/trade/${params}`);
    },
    [history]
  );
  const marketColumns = useMemo(() => {
    return [
      {
        title: t`Token`,
        dataIndex: "contractName",
        render: (text, record) => {
          return text?.indexOf("E-") > -1 ? record?.symbol : text;
        },
        // sorter: (a, b) => a.market.charCodeAt(0) - b.market.charCodeAt(0),

        // sortDirections: ['descend'],
        // defaultSortOrder: 'descend',
      },
      {
        title: t`Price`,
        dataIndex: "meta",
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.indexPrice - b.indexPrice,
        // render: (text, record) => (record?.meta?.open ? `$${numberWithCommas(record?.meta?.open)}` : "--"),
        render: (text, record) => {
          const tagPriceRow = allIndexTagPrice?.find(
            (item) => record.contractName == item.contract_name
          );
          //
          return tagPriceRow?.tag_price
            ? limitDecimals(
                tagPriceRow?.tag_price,
                record?.coinResultVo?.symbolPricePrecision || 4
              )
            : "--";
        },
      },
      {
        title: t`Long Position Users`,
        dataIndex: "longUsers",
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.volume24H - b.volume24H,
        render: (text, record) => {
          //
          const amount = record?.meta?.amount || 0;
          return numberWithCommas(
            limitDecimals((amount * record?.multiplier) / 211, 0)
          );
        },
      },
      {
        title: t`Short Position Users`,
        dataIndex: "shortUsers",
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.volume24H - b.volume24H,
        render: (text, record) => {
          //
          const amount = record?.meta?.amount || 0;
          return numberWithCommas(
            limitDecimals((amount * record?.multiplier) / 241, 0)
          );
        },
      },
      {
        title: t`24H Trading Volume`,
        dataIndex: "meta",
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.volume24H - b.volume24H,
        render: (text, record) => {
          //
          const amount = record?.meta?.amount || 0;
          return (
            numberWithCommas(limitDecimals(amount * record?.multiplier, 0)) +
            " " +
            record.marginCoin
          );
        },
      },
      {
        title: t`Market Markers`,
        dataIndex: "markers",
        render: (text, r) => (
          <div
            className="color-teal"
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              handleClickRow(text, r, t`Market Marker`);
            }}
          >
            <span>
              {`${text.substring(0, 6)}...${text.substring(42 - 6)}`}{" "}
            </span>
            <RightSquareOutlined style={{ fontSize: "14px" }} />
          </div>
        ),
      },
      // Table.EXPAND_COLUMN,
      {
        title: t`Auditors`,
        dataIndex: "auditors",
        render: (text, r) => (
          <div
            className="color-teal"
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              handleClickRow(text, r, t`Auditor`);
            }}
          >
            <span>
              {`${text.substring(0, 6)}...${text.substring(42 - 6)}`}{" "}
            </span>
            <RightSquareOutlined style={{ fontSize: "14px" }} />
          </div>
        ),
      },
      {
        title: t`Action`,
        dataIndex: "",
        key: "x",
        render: (text, record) => {
          return (
            <div
              className="color-yellow go-trade"
              onClick={() => {
                goTrade(record);
              }}
            >
              <Trans>Trade</Trans>
            </div>
          );
        },
      },
      // Table.EXPAND_COLUMN,
    ];
  }, [allIndexTagPrice, goTrade, handleClickRow]);
  const marketDataSource = useMemo(() => {
    //
    if (wsContractList) {
      const result = wsContractList.map((item) => {
        return {
          ...item,
          key: item.symbol,
          markers: "0x1Bb268a9f67388907c863272f618a9873C7009Fd",
          auditors: "0x1Bb268a9f67388907c863272f618a9873C7009Fd",
          markerList: [
            {
              marker: "FINRA",
              key: "FINRA",
              walletAddress: "0x1Bb268a9f67388907c863272f618a9873C7009Fd",
              website: "https://www.finra.org/",
              info:
                "The Financial Industry Regulatory Authority (FINRA) is the largest independent …",
              nst: "488000000",
              creatTime: "01/03/23",
              awardList: [
                {
                  key: "1111",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "2222",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "3333",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
              ],
            },
            {
              marker: "Marker-1",
              key: "Marker-1",
              walletAddress: "0x1Bb268a9f67388907c863272f618a9873C7009Fd",
              website: "https://www.finra.org/",
              info:
                "The Financial Industry Regulatory Authority (FINRA) is the largest independent …",
              nst: "488000000",
              creatTime: "01/03/23",
              awardList: [
                {
                  key: "1111",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "2222",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "3333",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
              ],
            },
            {
              marker: "Marker-2",
              key: "Marker-2",
              walletAddress: "0x1Bb268a9f67388907c863272f618a9873C7009Fd",
              website: "https://www.finra.org/",
              info:
                "The Financial Industry Regulatory Authority (FINRA) is the largest independent …",
              nst: "488000000",
              creatTime: "01/03/23",
              awardList: [
                {
                  key: "1111",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "2222",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
                {
                  key: "3333",
                  date: "2023-02-24 16:23:23",
                  currency: "NST",
                  amount: "20",
                  txid:
                    "0x9595edd10e4602e0c57131b1866a1ca6f899471e4ffc28ceddd9b952d75b0279",
                },
              ],
            },
          ],
        };
      });
      // const filterMarkets = socketMarkets.filter((item) => item.market);
      return result;
    } else {
      return [];
    }
  }, [wsContractList]);
  const markerColumns = [
    {
      title: t`Market Marker`,
      dataIndex: "marker",
      width: 80,
    },
    {
      title: t`Wallet Address`,
      dataIndex: "walletAddress",
      // defaultSortOrder: 'descend',
      width: 160,
      render: (text) => (
        <Paragraph
          copyable={{
            tooltips: false,
            text: text,
          }}
        >
          {`${text.substring(0, 6)}...${text.substring(42 - 6)}`}
        </Paragraph>
      ),
    },
    {
      title: t`Website`,
      dataIndex: "website",
      render: (text) => (
        <a href="text" target="_blank" style={{ textDecoration: "underline" }}>
          {text}
        </a>
      ),
    },
    {
      title: t`Info`,
      dataIndex: "info",
    },
    {
      title: t`Total Reward(NST)`,
      dataIndex: "nst",
      // defaultSortOrder: 'descend',
      sorter: (a, b) => a.nst - b.nst,
      render: (text) => `${numberWithCommas(text)}`,
    },
    // Table.EXPAND_COLUMN,
    {
      title: t`Join Time`,
      dataIndex: "creatTime",
    },
    Table.EXPAND_COLUMN,
    // {
    //   title: t`操作`,
    //   dataIndex: "creatTime",
    //   render: () => <span className="color-green">查看收益</span>,
    // },
  ];
  const awardColumns = [
    {
      title: t`Date`,
      dataIndex: "date",
    },
    {
      title: t`Currency`,
      dataIndex: "currency",
    },
    {
      title: t`Amount`,
      dataIndex: "amount",
    },
    {
      title: t`Txid`,
      dataIndex: "txid",
      render: (text) => (
        <Paragraph
          copyable={{
            tooltips: false,
          }}
        >
          {text}
        </Paragraph>
      ),
    },
  ];
  return (
    <>
      <div className="dashboard-market">
        {/* <div className="dashboard-market-title">
          <Trans>Markets</Trans>
        </div> */}
        <div className="dashboard-market-content">
          <Table
            className="table-base table-light dashboard-market-content-table"
            showSorterTooltip={false}
            columns={marketColumns}
            rowKey="id"
            dataSource={marketDataSource}
            pagination={false}
          />
        </div>
      </div>
      <Modal
        className="base-modal dashboard-modal"
        footer={null}
        title={drawerTitle}
        width={1000}
        open={open}
        onOk={onClose}
        onCancel={onClose}
      >
        {/* <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p> */}

        {/* <Drawer
        className="drawer-base drawer-order"
        width={600}
        title={drawerTitle}
        placement="right"
        onClose={onClose}
        open={open}
      > */}
        <Table
          className="table-base"
          showSorterTooltip={false}
          columns={markerColumns}
          dataSource={detail?.markerList || []}
          pagination={false}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => (
              <div
                className="color-green"
                style={{ width: "90px", cursor: "pointer" }}
                onClick={(e) => onExpand(record, e)}
              >
                <Trans>Reward</Trans>
              </div>
            ),
            expandedRowRender: (record) => (
              <>
                <div className="award-title">
                  <span>
                    <Trans>Market Marker</Trans>：FINRA
                  </span>
                  <span>
                    <Trans>Total Reward</Trans>：488,000,000NST
                  </span>
                </div>
                <Table
                  className="table-base"
                  showSorterTooltip={false}
                  columns={awardColumns}
                  dataSource={record.awardList}
                  pagination={false}
                />
              </>
            ),
          }}
        />
      </Modal>
    </>
  );
}
