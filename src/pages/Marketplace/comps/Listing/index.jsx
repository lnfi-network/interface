import BaseModal from "components/Common/Modal/Modal";
import { Button, Select, message, Input, Form, Row, Radio, Modal, Tooltip, Checkbox } from "antd";
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
  const { handleQueryAllowance, allowance, loading: allownceLoading } = useAllowance();
  const { handleApproveAsync, handleApproveAsyncByCommand } = useApprove();

  const { handleLimitOrderAsync } = useSendListOrder();
  const { handleQueryBalance } = useQueryBalance();
  const [btnLoading, setBtnLoading] = useState(false);
  const { tokenList, quote_pirce } = useSelector(({ market }) => market);
  const { balanceList, nostrAccount } = useSelector(({ user }) => user);
  const [priceValue, setPriceValue] = useState(0);
  const [amountValue, setAmountValue] = useState(0);
  const [approveAllChecked, setApproveAllChecked] = useState(true);
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
  const onApproveAllChange = (e) => {
    // console.log('checked = ', e.target.checked);
    setApproveAllChecked(e.target.checked);
  };
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

      if (ret?.code === 0) {
        message.success(t`Submit successfully`);
        reexcuteQuery && reexcuteQuery();
        onCancel();
      } else {
        throw new Error(ret?.data);
      }
    } catch (e) {
      messageApi.error(e.message);
    } finally {
      await handleQueryBalance(nip19.npubEncode(nostrAccount));
      setBtnLoading(false);
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
    messageApi
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
      if (approveAllChecked) {
        let command = "";
        for (let key in balanceList) {
          // console.log("balanceList", key);
          balanceList[key]?.balanceShow;
          if (Number(balanceList[key]?.balanceShow)) {
            command += `approve ${balanceList[key]?.balanceShow} ${key} to ${process.env.REACT_APP_NOSTR_MARKET_SEND_TO};`;
          }
        }
        ret = await handleApproveAsyncByCommand(command);
        if (buyOrSell === "buy") {
          handleQueryAllowance(QUOTE_ASSET);
        } else {
          handleQueryAllowance(selectedToken?.name);
        }
      } else {
        if (buyOrSell === "buy") {
          ret = await handleApproveAsync(Number(memoTotalValue), QUOTE_ASSET);
          await handleQueryAllowance(QUOTE_ASSET);
        } else {
          ret = await handleApproveAsync(Number(amountValue), selectedToken?.name);
          await handleQueryAllowance(selectedToken?.name);
        }
      }

      if (ret?.code === 0) {
        messageApi.open({
          type: "success",
          content: "Approve successfully"
        });
      } else {
        throw new Error(ret?.data);
      }
    } catch (e) {
      e.message && messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  }, [
    form,
    approveAllChecked,
    buyOrSell,
    balanceList,
    handleApproveAsyncByCommand,
    memoTotalValue,
    handleApproveAsync,
    handleQueryAllowance,
    amountValue,
    selectedToken?.name,
    messageApi
  ]);
  const approveAll = useMemo(() => {
    if (buyOrSell === "buy") {
      if (
        !allowance?.amountShow ||
        Number(allowance?.amountShow) === 0 ||
        Number(allowance?.amountShow) < Number(memoTotalValue)
      ) {
        return (
          <div className="tc mb20">
            <Checkbox
              checked={approveAllChecked}
              style={{ fontSize: "12px", verticalAlign: "text-bottom" }}
              onChange={onApproveAllChange}
            >
              Approve all balance
            </Checkbox>
            <Tooltip
              placement="top"
              title="After checking to approve all current balances, if the cumulative transactions of this asset do not exceed the approved amount, you only need to sign the transaction for each transaction without repeated approve process."
            >
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        );
      }
    } else {
      // const selectedTokenBalance = getTokenBalance(selectedToken?.name);
      // console.log("allowance amountShow", Number(allowance?.amountShow), Number(amountValue));
      if (
        !allowance?.amountShow ||
        Number(allowance?.amountShow) === 0 ||
        Number(allowance?.amountShow) < Number(amountValue)
      ) {
        return (
          <div className="tc mb20">
            <Checkbox
              checked={approveAllChecked}
              style={{ fontSize: "12px", verticalAlign: "text-bottom" }}
              onChange={onApproveAllChange}
            >
              Approve all balance
            </Checkbox>
            <Tooltip
              placement="top"
              title="After checking to approve all current balances, if the cumulative transactions of this asset do not exceed the approved amount, you only need to sign the transaction for each transaction without repeated approve process."
            >
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        );
      }
    }
  }, [allowance?.amountShow, amountValue, approveAllChecked, buyOrSell, memoTotalValue]);
  const memoButton = useMemo(() => {
    if (buyOrSell === "buy") {
      // Insufficient balance
      if ((Number(memoTotalValue) && Number(balance) && Number(memoTotalValue) > Number(balance)) || !Number(balance)) {
        return (
          <>
            <Button
              type="primary"
              className={classNames("listing-submit-btn")}
              // size="large"
              loading={btnLoading}
              disabled={true}
            >
              {"Insufficient balance"}
            </Button>
          </>
        );
      }
      // approve
      if (Number(allowance?.amountShow) < Number(memoTotalValue)) {
        return (
          <Button
            type="primary"
            className="listing-submit-btn"
            // size="large"
            onClick={onApprove}
            disabled={Number(balance) === 0 || allownceLoading}
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
            {`Buy ${selectedToken?.name}`}
          </Button>
        </>
      );
    } else {
      const selectedTokenBalance = getTokenBalance(selectedToken?.name);
      // Insufficient balance
      if (
        (Number(amountValue) && Number(selectedTokenBalance) && Number(amountValue) > Number(selectedTokenBalance)) ||
        !Number(selectedTokenBalance)
      ) {
        return (
          <>
            <Button
              type="primary"
              className={classNames("listing-submit-btn")}
              // size="large"
              loading={btnLoading}
              disabled={true}
            >
              {"Insufficient balance"}
            </Button>
          </>
        );
      }

      if (Number(allowance?.amountShow) < Number(amountValue) || !Number(allowance?.amountShow)) {
        return (
          <Button
            type="primary"
            className={classNames("listing-submit-btn", {
              "listing-submit-btn__sell": buyOrSell === "sell"
            })}
            // size="large"
            onClick={onApprove}
            loading={btnLoading}
            disabled={Number(selectedTokenBalance) === 0 || allownceLoading}
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
          loading={btnLoading}
          onClick={onListingSubmit}
          disabled={!Number(selectedTokenBalance) || allownceLoading}
        >
          {`Sell ${selectedToken?.name}`}
        </Button>
      );
    }
  }, [
    allowance?.amountShow,
    allownceLoading,
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
                      if (Number(value) && Number(price) && Number(value) * Number(price) > 60 * 10000) {
                        return Promise.reject(new Error(`Max limit of total value is 600000 sats`));
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
            {approveAll}
            {/* <div className="tc mb20">
              <Checkbox
                checked={approveAllChecked}
                style={{ fontSize: "12px", verticalAlign: "text-bottom" }}
                onChange={onApproveAllChange}
              >
                Approve all balance
              </Checkbox>
              <Tooltip
                placement="top"
                title="After checking to approve all current balances, if the cumulative transactions of this asset do not exceed the approved amount, you only need to sign the transaction for each transaction without repeated approve process."
              >
                <InfoCircleOutlined />
              </Tooltip>
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
