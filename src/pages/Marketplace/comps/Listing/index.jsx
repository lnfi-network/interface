import BaseModal from "components/Common/Modal/Modal";
import { Button, Select, message, Input, Form, Row, Radio, Modal, Tooltip } from "antd";
import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import classNames from "classnames";
import "./index.scss";
import { t } from "@lingui/macro";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { useAllowance, useApprove, useSendListOrder, useQueryBalance } from "hooks/useNostrMarket";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import { nul } from "lib/utils/math";
import { QUOTE_ASSET, FEE } from "config/constants";
import { InfoCircleOutlined } from "@ant-design/icons";
import { convertDollars } from "lib/utils/index";
const layout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 17
  }
};

function ListingModalForm({ reexcuteQuery, isListFormShow, setIsListFormShow, token }) {
  const [form] = Form.useForm();
  const [buyOrSell, setBuyOrSell] = useState("buy");
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedToken, setSelectedToken] = useState(null);
  const { handleQueryAllowance, allowance } = useAllowance();
  const { handleApproveAsync } = useApprove();
  const { handleLimitOrderAsync } = useSendListOrder();
  const { handleQueryBalance } = useQueryBalance();
  const [btnLoading, setBtnLoading] = useState(false);
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const { balanceList, nostrAccount } = useSelector(({ user }) => user);
  const [priceValue, setPriceValue] = useState(0);
  const [amountValue, setAmountValue] = useState(0);

  const titleOptions = useMemo(() => {
    return [
      {
        label: "Buy Token",
        value: "buy"
      },
      {
        label: "Sell Token",
        value: "sell"
      }
    ];
  }, []);
  const getTokenBalance = useCallback(
    (tokenName) => {
      return balanceList[tokenName]?.balanceShow || 0;
    },
    [balanceList]
  );
  const qutoAssetVolume = useMemo(() => {
    return tokenList.find((tokenItem) => tokenItem?.name === QUOTE_ASSET)?.volume || 10;
  }, [tokenList]);
  const qutoAsset = useMemo(() => {
    return tokenList.find((tokenItem) => tokenItem?.name === QUOTE_ASSET);
  }, [tokenList]);
  const memoTokenList = useMemo(() => {
    return tokenList.filter((tokenItem) => tokenItem.name !== QUOTE_ASSET) || [];
  }, [tokenList]);
  const onCancel = useCallback(() => {
    setIsListFormShow(false);
  }, [setIsListFormShow]);
  const handleBuyOrSellChange = useCallback(({ target: { value } }) => {
    setBuyOrSell(value);
  }, []);
  const buyOrSellSelect = useMemo(() => {
    return (
      <div className={classNames("market-form-title")}>
        <Radio.Group
          className={classNames({
            "sell-button-checked": buyOrSell === "sell"
          })}
          options={titleOptions}
          onChange={handleBuyOrSellChange}
          value={buyOrSell}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
    );
  }, [buyOrSell, handleBuyOrSellChange, titleOptions]);

  const handleMax = useCallback(() => {
    if (buyOrSell === "sell") {
      const maxAmount = getTokenBalance(selectedToken?.name);
      form.setFieldValue("amount", maxAmount);
      setAmountValue(maxAmount);
    } else {
      if (!priceValue) {
        const maxAmount = 0;
        form.setFieldValue("amount", maxAmount);
        setAmountValue(0);
      } else {
        const maxAmount = parseInt(getTokenBalance(QUOTE_ASSET) / priceValue);
        form.setFieldValue("amount", maxAmount);
        setAmountValue(maxAmount);
      }
    }
    form.validateFields(["amount"]);
  }, [buyOrSell, form, getTokenBalance, priceValue, selectedToken?.name]);
  const sellSuffix = useMemo(() => {
    return (
      <Button type="link" className="suffix-btn" onClick={handleMax}>
        Max
      </Button>
    );
  }, [handleMax]);
  const balance = useMemo(() => {
    if (Object.keys(balanceList).length > 0) {
      return balanceList[QUOTE_ASSET]?.balanceShow || 0;
    }
  }, [balanceList]);

  const memoTotalValue = useMemo(() => {
    return limitDecimals(nul(priceValue, amountValue), qutoAsset?.reserve, "round");
  }, [amountValue, priceValue, qutoAsset?.reserve]);
  const min = (num) => {
    let str = "0.";
    if (num == 0) {
      return 1;
    } else {
      for (let index = 0; index < num; index++) {
        if (index == num - 1) {
          str += "1";
        } else {
          str += "0";
        }
      }
      return str;
    }
  };
  const fee = useMemo(() => {
    if (buyOrSell == "buy") {
      return limitDecimals(amountValue * FEE, selectedToken?.reserve, "round") == 0
        ? min(selectedToken?.reserve)
        : limitDecimals(amountValue * FEE, selectedToken?.reserve, "round");
    } else {
      return limitDecimals(memoTotalValue * FEE, qutoAsset?.reserve, "round") == 0
        ? min(qutoAsset?.reserve)
        : limitDecimals(memoTotalValue * FEE, qutoAsset?.reserve, "round");
    }
  }, [amountValue, buyOrSell, memoTotalValue, qutoAsset?.reserve, selectedToken?.reserve]);
  //
  const options = useMemo(() => {
    return memoTokenList.map((tokenItem) => {
      const tokenBalance = Number(getTokenBalance(tokenItem.name)) || 0;
      return (
        <Select.Option value={tokenItem.id} key={tokenItem.id}>
          <span className="select-token-name">{tokenItem.name}</span>
          <span className="select-token-balance">
            Balance: ({parseFloat(limitDecimals(tokenBalance, tokenItem.reserve))})
          </span>
        </Select.Option>
      );
    });
  }, [getTokenBalance, memoTokenList]);
  const handleTokenChange = useCallback(
    (id) => {
      const tempSelectedToken = tokenList.find((item) => item.id === id);
      setSelectedToken(tempSelectedToken);

      setPriceValue("");
      setAmountValue("");
      form.setFieldValue("amount", "");
      form.setFieldValue("price", "");
    },
    [form, tokenList]
  );
  const onListingSubmit = useCallback(async () => {
    // form.validateFields();
    try {
      await form.validateFields();
      // if (Number(memoTotalValue) < selectedToken?.volume * qutoAssetVolume) {
      //   message.warning(`Minimum Qty is ${selectedToken?.volume * qutoAssetVolume} ${QUOTE_ASSET}`);
      //   return;
      // }
      setBtnLoading(true);
      const values = form.getFieldsValue();
      const side = buyOrSell;
      // side, amount, buyTokenName, price, payTokenName
      const amount = values.amount;
      const buyTokenName = selectedToken?.name;
      const price = values.price;
      const payTokenName = QUOTE_ASSET;
      let ret = await handleLimitOrderAsync({
        side,
        amount,
        buyTokenName,
        price,
        payTokenName: payTokenName
      });
      if (!ret) {
        return;
      }
      if (ret?.code === 0) {
        message.success(t`Submit successfully`);
        /* modalRef.current.handleCancel(); */

        await handleQueryBalance(nip19.npubEncode(nostrAccount));
        // setTimeout(() => {
        reexcuteQuery && reexcuteQuery();
        onCancel();
        // }, 500)
      } else {
        messageApi.open({
          type: "error",
          content: ret.data
        });
      }
    } catch (e) {
      messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
      //refresh balanceList

      if (buyOrSell === "buy") {
        handleQueryAllowance(QUOTE_ASSET);
      } else {
        handleQueryAllowance(selectedToken?.name);
      }
    }
  }, [
    form,
    selectedToken?.name,
    buyOrSell,
    handleLimitOrderAsync,
    handleQueryBalance,
    nostrAccount,
    reexcuteQuery,
    onCancel,
    messageApi,
    handleQueryAllowance
  ]);
  const onPriceChange = useCallback(
    ({ target: { value } }) => {
      if (Number(value)) {
        // let reg = new RegExp('/\d+\.?\d{0,' + selectedToken?.reserve || 4 + '}/')
        // const match = value.match(/\d+\.?\d{0,4}/);
        let reg = new RegExp("\\d+\\.?\\d{0," + qutoAsset?.reserve + "}");
        const match = value.match(reg);
        // console.log("match", qutoAsset,qutoAsset?.reserve, qutoAsset?.reserve == 0);
        if (qutoAsset?.reserve == 0) {
          form.setFieldValue("price", Math.floor(value));
          setPriceValue(Math.floor(value));
        } else {
          form.setFieldValue("price", match[0]);
          setPriceValue(match[0]);
        }
      } else if (value && !Number.isNaN(value) && Number(value) >= 0) {
        setPriceValue(value);
      } else {
        setPriceValue(0);
      }
      if (Number(value) && Number(form.getFieldValue("amount"))) {
        form.validateFields(["amount"]);
      }
    },
    [form, qutoAsset]
  );
  const onAmountChange = useCallback(
    ({ target: { value } }) => {
      if (Number(value)) {
        let reg = new RegExp("\\d+\\.?\\d{0," + selectedToken?.reserve + "}");
        const match = value.match(reg);
        // console.log("match", match);
        if (selectedToken?.reserve == 0) {
          form.setFieldValue("amount", Math.floor(value));
          setAmountValue(Math.floor(value));
        } else {
          form.setFieldValue("amount", match[0]);
          setAmountValue(match[0]);
        }
      } else if (value && !Number.isNaN(value) && Number(value) >= 0) {
        setAmountValue(value);
      } else {
        setAmountValue(0);
      }
      if (Number(value) && Number(form.getFieldValue("price"))) {
        form.validateFields(["price"]);
      }
    },
    [form, selectedToken]
  );
  const onApprove = useCallback(async () => {
    // if (Number(memoTotalValue) < selectedToken?.volume * qutoAssetVolume) {
    //   message.warning(`Minimum Qty is ${selectedToken?.volume * qutoAssetVolume} ${QUOTE_ASSET}`);
    //   return;
    // }
    try {
      await form.validateFields();
      setBtnLoading(true);
      let ret = null;
      if (buyOrSell === "buy") {
        ret = await handleApproveAsync(Number(memoTotalValue), QUOTE_ASSET);
        handleQueryAllowance(QUOTE_ASSET);
      } else {
        ret = await handleApproveAsync(Number(amountValue), selectedToken?.name);
        handleQueryAllowance(selectedToken?.name);
      }
      if (!ret) {
        return;
      }
      if (ret?.code === 0) {
        messageApi.open({
          type: "success",
          content: ret.data
        });
      } else {
        messageApi.open({
          type: "error",
          content: ret.data
        });
      }
    } catch (e) {
      // console.log("messageApi.error(e.message);",e, e?.errorField);
      if (!e?.errorFields?.length) {
        messageApi.error(e.message);
      }
    } finally {
      setBtnLoading(false);
    }
  }, [
    memoTotalValue,
    selectedToken?.name,
    form,
    buyOrSell,
    handleApproveAsync,
    handleQueryAllowance,
    amountValue,
    messageApi
  ]);
  /*  const initForm = useCallback(() => {
    form.setFieldsValue({
      price: "",
      amount: "",
    });
    setPriceValue(0);
    setAmountValue(0);
  }, [form]); */

  const memoButton = useMemo(() => {
    if (buyOrSell === "buy") {
      //
      if (Number(memoTotalValue) && Number(balance) && Number(memoTotalValue) > Number(balance)) {
        return (
          <>
            <Button
              type="primary"
              className={classNames("listing-submit-btn")}
              // size="large"
              loading={btnLoading}
              onClick={onListingSubmit}
              disabled={true}
            >
              {"Insufficient balance"}
            </Button>
          </>
        );
      }
      if (
        (allowance?.amountShow && Number(balance) > 0 && Number(allowance?.amountShow) < Number(memoTotalValue)) ||
        Number(allowance?.amountShow) === 0 ||
        !allowance?.amountShow
      ) {
        return (
          <Button
            type="primary"
            className="listing-submit-btn"
            // size="large"
            onClick={onApprove}
            disabled={Number(balance) === 0}
            loading={btnLoading}
          >
            Approve
          </Button>
        );
      }
      return (
        <>
          <Button
            type="primary"
            className={classNames("listing-submit-btn")}
            // size="large"
            loading={btnLoading}
            onClick={onListingSubmit}
            disabled={!Number(balance) || Number(balance) === 0}
          >
            {Number(balance) > 0 ? `Buy ${selectedToken?.name}` : "Insufficient balance"}
          </Button>
        </>
      );
    } else {
      const selectedTokenBalance = getTokenBalance(selectedToken?.name);
      if (Number(amountValue) && Number(selectedTokenBalance) && Number(amountValue) > Number(selectedTokenBalance)) {
        return (
          <>
            <Button
              type="primary"
              className={classNames("listing-submit-btn")}
              // size="large"
              loading={btnLoading}
              onClick={onListingSubmit}
              disabled={true}
            >
              {"Insufficient balance"}
            </Button>
          </>
        );
      }

      if (
        (allowance?.amountShow && Number(balance) > 0 && Number(allowance?.amountShow) < Number(amountValue)) ||
        Number(allowance?.amountShow) === 0 ||
        !allowance?.amountShow
      ) {
        return (
          <Button
            type="primary"
            className={classNames("listing-submit-btn", {
              "listing-submit-btn__sell": buyOrSell === "sell"
            })}
            // size="large"
            onClick={onApprove}
            loading={btnLoading}
            disabled={Number(selectedTokenBalance) === 0}
          >
            Approve
          </Button>
        );
      }
      return (
        <Button
          type="primary"
          className={classNames("listing-submit-btn", {
            "listing-submit-btn__sell": buyOrSell === "sell"
          })}
          // size="large"
          loading={btnLoading}
          onClick={onListingSubmit}
          disabled={!Number(selectedTokenBalance) || Number(selectedTokenBalance) === 0}
        >
          {Number(selectedTokenBalance) > 0 ? `Sell ${selectedToken?.name}` : "Insufficient balance"}
        </Button>
      );
    }
  }, [
    allowance?.amountShow,
    amountValue,
    balance,
    btnLoading,
    buyOrSell,
    getTokenBalance,
    memoTotalValue,
    onApprove,
    onListingSubmit,
    selectedToken?.name
  ]);
  useEffect(() => {
    if (memoTokenList.length > 0) {
      const tokenItem = selectedToken || tokenList.find((item) => item.name === token) || memoTokenList[0];
      if (!selectedToken) {
        setSelectedToken(tokenItem);
      }
      form.setFieldValue("token", tokenItem.id);
    }
  }, [form, memoTokenList, memoTokenList.length, selectedToken, token, tokenList]);

  useEffect(() => {
    if (buyOrSell === "buy" && selectedToken?.name) {
      handleQueryAllowance(QUOTE_ASSET);
    } else if (buyOrSell === "sell" && selectedToken?.name) {
      handleQueryAllowance(selectedToken?.name);
    }
  }, [buyOrSell, handleQueryAllowance, selectedToken?.name]);

  return (
    <>
      {contextHolder}

      <Modal
        className="nostrswap-modal"
        open={isListFormShow}
        width="420px"
        zIndex={999}
        title={buyOrSellSelect}
        footer={null}
        /* onOk={handleOk} */
        onCancel={onCancel}
      >
        <Form className="listing-form" {...layout} form={form} name="listingForm" autoComplete="off">
          <Form.Item label="Token">
            <Form.Item
              noStyle
              name="token"
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Select className="listing-select" onChange={handleTokenChange}>
                {options}
              </Select>
            </Form.Item>
          </Form.Item>

          <Form.Item label={buyOrSell === "buy" ? "Buy Price" : "Sell Price"}>
            <Form.Item
              name="price"
              noStyle
              rules={[
                {
                  required: true
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (!Number(value)) {
                        return Promise.reject(new Error(t`Invalid input format.`));
                      }
                      const amount = form.getFieldValue("amount");
                      // if (
                      //   Number(value) &&
                      //   Number(amount) &&
                      //   Number(value) * Number(amount) < selectedToken?.volume * qutoAssetVolume
                      // ) {
                      //   return Promise.reject(new Error(`Minimum Qty is ${selectedToken?.volume * qutoAssetVolume} USDT`));
                      // }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input className="listing-input" onChange={onPriceChange} />
            </Form.Item>
            <span className="listing-form-usdt f12">{QUOTE_ASSET}</span>

            <span className="f12 color-dark">
              {"   "}
              {/* {priceValue && quote_pirce ? `≈$${numberWithCommas(limitDecimals(priceValue * quote_pirce, 2))}` : ""} */}
              {convertDollars(priceValue, quote_pirce, " ")}
            </span>
          </Form.Item>
          <Form.Item label={buyOrSell === "buy" ? "Buy Amount" : "Sell Amount"}>
            <Form.Item
              name="amount"
              noStyle
              rules={[
                {
                  required: true
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (!Number(value)) {
                        return Promise.reject(new Error(t`Invalid input format.`));
                      }
                      const price = form.getFieldValue("price");
                      if (Number(value) && Number(price) && Number(value) * Number(price) < 10000) {
                        return Promise.reject(new Error(`Min limit of total value is 10000 sats`));
                      }
                      if (Number(value) && Number(price) && Number(value) * Number(price) > 30000) {
                        return Promise.reject(new Error(`Max limit of total value is 30000 sats`));
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input
                className="listing-input"
                type="text"
                suffix={sellSuffix}
                placeholder=""
                onChange={onAmountChange}
              />
            </Form.Item>
            <span className="listing-form-usdt f12">{selectedToken?.name}</span>
          </Form.Item>

          <Form.Item label="Total Value" className="listing-form-total-stats">
            <div className="listing-form-total-value">
              {memoTotalValue} <span>{QUOTE_ASSET}</span>{" "}
              <span className="f12 color-dark">
                {"   "}
                {/* {memoTotalValue && quote_pirce
                  ? `≈$${numberWithCommas(limitDecimals(memoTotalValue * quote_pirce, 2))}`
                  : ""} */}
                {convertDollars(memoTotalValue, quote_pirce, " ")}
              </span>
            </div>
          </Form.Item>
          <Form.Item
            label={
              <Tooltip
                placement="top"
                title="Service fee rate 0.4%, only charged when order is filled. If the calculated fee less than the 1 unit of the asset, will be charged in the smallest unit of asset."
              >
                Service Fee <InfoCircleOutlined />
              </Tooltip>
            }
            className="listing-form-total-stats"
          >
            <div className="f12">
              {buyOrSell === "buy" ? (
                <div>
                  {`0.4% ${numberWithCommas(fee)} ${selectedToken?.name}`}
                  <span className="f12 color-dark">(Only charged when order filled)</span>
                </div>
              ) : (
                <div>
                  {`0.4% ${numberWithCommas(fee)} ${QUOTE_ASSET}`}
                  <span className="f12 color-dark">(Only charged when order filled)</span>
                </div>
              )}
            </div>
          </Form.Item>
          {
            buyOrSell == "buy" && (
              <div className="limit-buy-available">
                Balance: {balance} <span>{QUOTE_ASSET}</span>
              </div>
            )
            // <Form.Item label="Balance" className="listing-form-total-stats">
            //   <div className="listing-form-total-value">
            //     {balance} <span>USDT</span>
            //   </div>
            // </Form.Item>
          }
          <Form.Item wrapperCol={24} align="middle" className="">
            {/* <div className="listing-form-balance">
              <div className="listing-form-balance-container">
                <span className="listing-form-balance-label">Balance:</span>
                <span className="listing-form-balance-value">
                  {balance} USDT
                </span>
              </div>
            </div> */}
            <Row justify="center" style={{ marginTop: "10px" }}>
              {memoButton}
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/*  <BaseModal
        width="420px"
        initForm={initForm}
        title={buyOrSellSelect}
        ref={modalRef}
      >
      
      </BaseModal> */}
    </>
  );
}
export default memo(ListingModalForm);
