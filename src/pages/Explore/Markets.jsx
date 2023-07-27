import { useEffect, useState, useMemo, useCallback } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import BigNumber from "bignumber.js";
// import { RightSquareOutlined } from "@ant-design/icons";
import { Trans, t } from "@lingui/macro";
// import { useHistory } from "react-router-dom";
import { useTokenChangeQuery } from "hooks/graphQuery/useExplore";

export default function Markets() {
  // const history = useHistory();
  const [timer, setTimer] = useState(false);
  const { tokenList } = useSelector(({ market }) => market);
  const { list, fetching, reexcuteQuery } = useTokenChangeQuery({});
  const usdtDetail = useMemo(() => {
    return tokenList.find((k) => k?.name?.toUpperCase() == "USDT");
  }, [tokenList]);
  useEffect(() => {
    setInterval(() => {
      setTimer(true);
      reexcuteQuery();
    }, 30000);
    return () => setTimer(false);
  }, [reexcuteQuery]);
  const marketColumns = useMemo(() => {
    return [
      {
        title: t`Token`,
        dataIndex: "name",
      },
      {
        title: t`Channel`,
        dataIndex: "symbol",
      },
      {
        title: t`Price`,
        dataIndex: "deal_price",
        // defaultSortOrder: 'descend',
        sorter: (a, b) => a.deal_price - b.deal_price,
        render: (text, record) => {
          const tokenDetail = tokenList.find((k) => k?.name == record.name);
          //
          return text && tokenDetail && usdtDetail
            ? `$${numberWithCommas(
                limitDecimals(
                  BigNumber(text)
                    .div(usdtDetail?.decimals)
                    .div(tokenDetail?.decimals)
                    .toNumber(),
                  usdtDetail?.reserve
                )
              )}`
            : "--";
        },
      },
      {
        title: t`Change`,
        dataIndex: "tf_change",
        sorter: (a, b) => a.tf_change - b.tf_change,
        render: (text, record) => {
          const cls = text > 0 ? "color-green" : "color-red";
          return (
            <span className={!text ? "" : cls}>
              {text || text == 0 ? `${limitDecimals(text * 100, 2)}%` : "--"}
            </span>
          );
        },
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.change - b.change,
        // render: (text, record) => {
        //   const cls = text > 0 ? "color-green" : "color-red"
        //   return <span className={cls}>{text ? `${limitDecimals(text * 100, 2)}%` : "--"}</span>
        // },
      },
      {
        title: t`Volume(24H)`,
        dataIndex: "tf_total_price",
        sorter: (a, b) => a.tf_total_price - b.tf_total_price,
        render: (text, record) => {
          const tokenDetail = tokenList.find((k) => k?.name == record.name);
          //
          return text && tokenDetail && usdtDetail
            ? `${numberWithCommas(
                limitDecimals(
                  BigNumber(text)
                    .div(usdtDetail?.decimals)
                    .div(tokenDetail?.decimals)
                    .toNumber(),
                  usdtDetail?.reserve
                )
              )} USDT`
            : "--";
        },
        // defaultSortOrder: 'descend',
        // sorter: (a, b) => a.volume24H - b.volume24H,
        // render: (text, record) => {
        //   return text ? `$${numberWithCommas(limitDecimals(text, 2))}` : "--"
        // },
      },
    ];
  }, [tokenList, usdtDetail]);
  return (
    <>
      <div className="market-explore">
        <Table
          className="table-base explore-table"
          showSorterTooltip={false}
          loading={fetching && !timer}
          columns={marketColumns}
          rowKey="id"
          scroll={{
            x: "100%",
          }}
          dataSource={list?.filter((item) => item.name !== "USDT") || []}
          pagination={false}
        />
      </div>
    </>
  );
}
