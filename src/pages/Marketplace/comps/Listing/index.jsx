import BaseModal from "components/Common/Modal/Modal";
import { Button, Select, message, Input, Form, Row, Radio, Modal } from "antd";
import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import classNames from "classnames";
import "./index.scss";
import { t } from "@lingui/macro";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { useAllowance, useApprove, useSendListOrder, useQueryBalance } from "hooks/useNostrMarket";
import { limitDecimals } from "lib/numbers";
import { nul } from "lib/utils/math";
import { useDeepCompareEffect } from "ahooks";
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
  const { tokenList } = useSelector(({ market }) => market);
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
      return balanceList[tokenName]?.balanceShow;
    },
    [balanceList]
  );
  const memoTokenList = useMemo(() => {
    return tokenList.filter((tokenItem) => tokenItem.name !== "USDT") || [];
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
        const maxAmount = parseInt(getTokenBalance("USDT") / priceValue);
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
      return balanceList["USDT"].balanceShow;
    }
  }, [balanceList]);

  const memoTotalValue = useMemo(() => {
    return limitDecimals(nul(priceValue, amountValue), 4, "round");
  }, [amountValue, priceValue]);
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
      if (Number(memoTotalValue) < 10) {
        message.warning(t`Minimum Qty is 10 USDT`);
        return;
      }
      setBtnLoading(true);
      const values = form.getFieldsValue();
      const side = buyOrSell;
      // side, amount, buyTokenName, price, payTokenName
      const amount = values.amount;
      const buyTokenName = selectedToken?.name;
      const price = values.price;
      const payTokenName = "usdt";
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
        handleQueryAllowance("USDT");
      } else {
        handleQueryAllowance(selectedToken?.name);
      }
    }
  }, [
    form,
    memoTotalValue,
    buyOrSell,
    selectedToken?.name,
    handleLimitOrderAsync,
    onCancel,
    reexcuteQuery,
    messageApi,
    handleQueryBalance,
    nostrAccount,
    handleQueryAllowance
  ]);
  const onPriceChange = useCallback(
    ({ target: { value } }) => {
      if (Number(value)) {
        const match = value.match(/\d+\.?\d{0,4}/);
        //
        form.setFieldValue("price", match[0]);
        setPriceValue(match[0]);
      } else if (value && !Number.isNaN(value) && Number(value) >= 0) {
        setPriceValue(value);
      } else {
        setPriceValue(0);
      }
      if (Number(value) && Number(form.getFieldValue("amount"))) {
        form.validateFields(["amount"]);
      }
    },
    [form]
  );
  const onAmountChange = useCallback(
    ({ target: { value } }) => {
      if (Number(value)) {
        const match = value.match(/\d+\.?\d{0,4}/);
        form.setFieldValue("amount", match[0]);
        setAmountValue(match[0]);
      } else if (value && !Number.isNaN(value) && Number(value) >= 0) {
        setAmountValue(value);
      } else {
        setAmountValue(0);
      }
    },
    [form]
  );
  const onApprove = useCallback(async () => {
    if (Number(memoTotalValue) < 10) {
      message.warning(t`Minimum Qty is 10 USDT`);
      return;
    }
    try {
      setBtnLoading(true);
      let ret = null;
      if (buyOrSell === "buy") {
        ret = await handleApproveAsync(Number(memoTotalValue), "USDT");
        handleQueryAllowance("USDT");
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
      messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  }, [
    buyOrSell,
    handleApproveAsync,
    memoTotalValue,
    handleQueryAllowance,
    amountValue,
    selectedToken?.name,
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
        Number(allowance?.amountShow) === 0
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
        Number(allowance?.amountShow) === 0
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
      //
      handleQueryAllowance("USDT");
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

                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input className="listing-input" onChange={onPriceChange} />
            </Form.Item>
            <span className="listing-form-usdt f12">USDT</span>
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

                      if (Number(value) < selectedToken.volume) {
                        return Promise.reject(
                          new Error(`Minimum Qty is ${selectedToken.volume} ${selectedToken?.name}`)
                        );
                      }
                      if (
                        Number(form.getFieldValue("price")) &&
                        Number(value) &&
                        Number(form.getFieldValue("price")) * Number(value) < 10
                      ) {
                        return Promise.reject(new Error(t`Minimum Qty is 10 USDT`));
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
              {memoTotalValue} <span>USDT</span>
            </div>
          </Form.Item>
          {
            buyOrSell == "buy" && (
              <div className="limit-buy-available">
                Balance: {balance} <span>USDT</span>
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
