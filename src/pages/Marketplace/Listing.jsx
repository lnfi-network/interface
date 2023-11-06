import "./index.scss";
import { useCallback, useImperativeHandle, useState, useEffect, useMemo, useRef } from "react";
import ListingModalForm from "./comps/Listing";
import { useQueryBalance } from "hooks/useNostrMarket";
import { Select, Radio, Collapse, Button, Spin, Form, Pagination, Tooltip, message, Empty } from "antd";
import { t } from "@lingui/macro";
// import * as dayjs from "dayjs";
const { Panel } = Collapse;
// import { AppstoreOutlined, MenuOutlined } from "@ant-design/icons";
// import { usePostNostr } from "hooks/useNostr";
import EllipsisMiddle from "components/EllipsisMiddle";
import { useListingQuery } from "hooks/graphQuery/useExplore";
import * as dayjs from "dayjs";
import MarketModalForm from "./comps/Market";
import { useSelector } from "react-redux";
import useGetNostrAccount from "hooks/useGetNostrAccount";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { getQueryVariable } from "lib/url";
import { QUOTE_ASSET } from "config/constants";
// import { useCancelOrder } from "hooks/useNostrMarket";
import { nip19 } from "nostr-tools";
import BigNumber from "bignumber.js";
import { utcToClient } from "lib/dates";
import CheckNostrButton from "components/CheckNostrButton";
import { convertDollars } from "lib/utils/index";
// import { add, cut, nul, division } from "lib/utils/math";

// const initQuery = {
//   type: "",
//   token: "",
//   // side: "buy",
// };

export default function Listing({ refListing }) {
  // const { handleCancelOrderAsync } = useCancelOrder();
  const [width, setWidth] = useState(document.body.clientWidth);
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const [timer, setTimer] = useState(false);
  const timerInterval = useRef(null);
  const [type, setType] = useState("Buy");
  const [token, setToken] = useState(getQueryVariable("token"));
  const [sort, setSort] = useState("Price From Low to High");
  const [marketData, setMarketData] = useState({});
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [isMarketModalForm, setIsMarketModalForm] = useState(false);
  const { nostrAccount } = useSelector(({ user }) => user);
  const { handleGetNostrAccount } = useGetNostrAccount();

  const { list, total, fetching, reexcuteQuery } = useListingQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    type,
    token,
    sort
  });
  const refresh = useCallback(() => {
    reexcuteQuery();
  }, [reexcuteQuery]);
  useImperativeHandle(refListing, () => {
    return {
      refresh: refresh,
      token: token
    };
  });
  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimer(true);
      reexcuteQuery();
    }, 30000);
    return () => {
      setTimer(false);
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, [reexcuteQuery]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sortOptions = [
    {
      value: "Price From Low to High",
      label: t`Price From Low to High`
    },
    {
      value: "Price From High to Low",
      label: t`Price From High to Low`
    },
    {
      value: "Amount From Small to Large",
      label: t`Amount From Small to Large`
    },
    {
      value: "Amount From Large to Small",
      label: t`Amount From Large to Small`
    },
    {
      value: "From Latest to Earliest",
      label: t`From Latest to Earliest`
    },
    {
      value: "From Earliest to Latest",
      label: t`From Earliest to Latest`
    }
  ];
  const memoTokenList = useMemo(() => {
    return tokenList.filter((tokenItem) => tokenItem.name !== QUOTE_ASSET) || [];
  }, [tokenList]);
  const typeChange = useCallback(
    (e) => {
      //
      setPageIndex(1);
      setType(e.target.value);
      if (e.target.value == "Sell") {
        setSort("Price From High to Low");
        form.setFieldValue("sort", "Price From High to Low");
      } else {
        setSort("Price From Low to High");
        form.setFieldValue("sort", "Price From Low to High");
      }
    },
    [form]
  );
  const tokenChange = useCallback((value) => {
    setPageIndex(1);
    setToken(value);
  }, []);
  const sortChange = useCallback((value) => {
    setPageIndex(1);
    setSort(value);
  }, []);
  const handleResize = useCallback(() => {
    setWidth(document.body.clientWidth);
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  const onPageChange = useCallback((page, pageSize) => {
    setPageIndex(page);
    setPageSize(pageSize);
  }, []);

  const onFinish = useCallback(
    (values) => {
      let filterObj = {
        ...values
      };
      // setFilter(filterObj);
      reexcuteQuery();
    },
    [reexcuteQuery]
  );

  const handleBuyOrSellByMarket = useCallback(
    async (item) => {
      //
      if (!nostrAccount) {
        const retAddress = await handleGetNostrAccount();
        //
        if (retAddress) {
          setMarketData(item);
          if (retAddress !== item.owner) {
            //refMarketModalForm.current.showModal();
            setIsMarketModalForm(true);
          }
        }
      } else {
        setMarketData(item);
        if (nostrAccount !== item.owner) {
          //refMarketModalForm.current.showModal();
          setIsMarketModalForm(true);
        }
      }
    },
    [handleGetNostrAccount, nostrAccount]
  );
  const listingList = useMemo(() => {
    const row = tokenList.find((item) => item.name == QUOTE_ASSET);
    const curToken = tokenList.find((item) => item.name == token);
    return list && list.length ? (
      list.map((item) => (
        <div className="trade-item" key={item.id}>
          <div className="trade-item-head">
            <span className="trade-item-title">{item?.token || "--"}</span>
            <span className="trade-item-id">#{item?.id}</span>
          </div>

          <div className="trade-item-section">
            <div className="trade-item-label">{t`Price`}</div>
            <div className="trade-item-value color-yellow">
              <div>
                {/* to do */}
                <span className="usd">
                  {item?.price && row
                    ? numberWithCommas(
                        limitDecimals(BigNumber(item?.price).div(row?.decimals).toNumber(), row?.reserve)
                      )
                    : "--"}
                </span>{" "}
                {QUOTE_ASSET}
              </div>
              <div className="f12 color-dark" style={{ textAlign: "right" }}>
                {/* {item?.price && row
                  ? `≈$${numberWithCommas(
                      limitDecimals(BigNumber(item?.price).div(row?.decimals).times(quote_pirce).toNumber(), 2)
                    )}`
                  : "--"} */}
                {convertDollars(item?.price / row?.decimals, quote_pirce)}
              </div>
            </div>
          </div>
          <div className="trade-item-section">
            <div className="trade-item-label">{t`Remaining`}</div>
            <div className="trade-item-value">
              <span>
                {item.volume && curToken
                  ? BigNumber(item.volume).minus(item.deal_volume).div(curToken?.decimals).toNumber()
                  : "--"}
              </span>{" "}
              {item.token}
            </div>
          </div>
          <div className="trade-item-section">
            <div className="trade-item-label">{t`Amount`}</div>
            <div className="trade-item-value">
              <span className="amount">
                {item.volume && curToken ? BigNumber(item.volume).div(curToken?.decimals).toNumber() : "--"}{" "}
                {item?.token}
              </span>
            </div>
          </div>
          <div className="trade-item-section">
            <div className="trade-item-label">{t`Total Value`}</div>
            <div className="trade-item-value">
              <div>
                {item?.total_price && row && curToken
                  ? numberWithCommas(
                      limitDecimals(
                        BigNumber(item?.total_price).div(curToken?.decimals).div(row?.decimals).toNumber(),
                        row?.reserve
                      )
                    )
                  : "--"}{" "}
                {QUOTE_ASSET}
              </div>
              <div className="f12 color-dark" style={{ textAlign: "right" }}>
                {/* {item?.price && row
                  ? `≈$${numberWithCommas(
                      limitDecimals(
                        BigNumber(item?.total_price)
                          .div(curToken?.decimals)
                          .div(row?.decimals)
                          .times(quote_pirce)
                          .toNumber(),
                        2
                      )
                    )}`
                  : "--"} */}
                {convertDollars(item?.total_price / row?.decimals, quote_pirce)}
              </div>
            </div>
          </div>
          <div className="trade-item-section bg-grey mt5 pt10">
            <div className="trade-item-label">{type == "Buy" ? t`Seller` : t`Buyer`}</div>
            <div className="trade-item-value">
              {item.owner ? <EllipsisMiddle suffixCount={4}>{nip19.npubEncode(item.owner)}</EllipsisMiddle> : "--"}
            </div>
          </div>
          <div className="trade-item-section bg-grey">
            <div className="trade-item-label">{t`Date`}</div>
            <div className="trade-item-value">{utcToClient(item?.create_time)}</div>
          </div>
          <div className="trade-item-section bg-grey">
            <Tooltip
              color="#6f6e84"
              title={item.owner == nostrAccount ? "Trading your own orders is not supported" : ""}
            >
              <CheckNostrButton>
                <Button
                  type="primary"
                  className={type == "Buy" ? "buy-btn" : "sell-btn"}
                  // onClick={handleBuyOrSellByMarket}
                  disabled={item.owner == nostrAccount}
                  onClick={() => handleBuyOrSellByMarket(item)}
                >
                  {type == "Buy" ? `Buy ${item.token}` : `Sell ${item.token}`}
                </Button>
              </CheckNostrButton>
            </Tooltip>
          </div>
        </div>
      ))
    ) : (
      <Empty style={{ margin: "0 auto" }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  }, [handleBuyOrSellByMarket, list, nostrAccount, quote_pirce, token, tokenList, type]);
  const filters = useMemo(() => {
    const _form = (
      <Form
        onFinish={onFinish}
        form={form}
        initialValues={{
          type: "Buy",
          token: getQueryVariable("token"),
          sort: "Price From Low to High"
        }}
      >
        <Form.Item label={t``} name="type" className="token-item">
          <Radio.Group buttonStyle="solid" onChange={typeChange}>
            <Radio.Button value="Buy">{t`Buy`}</Radio.Button>
            <Radio.Button value="Sell" className="sell">{t`Sell`}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={t``} name="token" className="token-item">
          <Select
            className="select"
            options={memoTokenList}
            onChange={tokenChange}
            fieldNames={{ label: "name", value: "name" }}
            style={{
              width: "100%",
              minWidth: "140px"
            }}
          />
        </Form.Item>
        <Form.Item label={t``} name="sort" className="token-item">
          <Select
            className="select"
            options={sortOptions}
            onChange={sortChange}
            style={{
              width: "100%",
              minWidth: "140px"
            }}
          />
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
  }, [onFinish, form, typeChange, memoTokenList, tokenChange, sortOptions, sortChange, width]);

  useEffect(() => {
    const defaultTokenSelect = memoTokenList?.[0];
    if (defaultTokenSelect) {
      form.setFieldValue("token", defaultTokenSelect.name);
      setToken(defaultTokenSelect.name);
    }
  }, [form, memoTokenList]);

  return (
    <>
      {isMarketModalForm && (
        <MarketModalForm
          data={marketData}
          setIsMarketModalForm={setIsMarketModalForm}
          isMarketModalForm={isMarketModalForm}
          reexcuteQuery={reexcuteQuery}
        />
      )}
      <div className="marketplace-listing">
        <div className="marketplace-filters listing">{filters}</div>
        <div className="trade-list">
          {fetching && !timer ? (
            <div className="flex1 tc mt30">
              <Spin />
            </div>
          ) : (
            listingList
          )}
        </div>
        <div className="tc mt20">
          <Pagination current={pageIndex} pageSize={pageSize} total={total} onChange={onPageChange} />
        </div>
      </div>
    </>
  );
}
