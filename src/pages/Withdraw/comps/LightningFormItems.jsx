import { Form, Row, Col, Input, Button, Select } from "antd";

import { useEffect, useMemo, useState, useCallback } from "react";
import ConnectNostr from "components/Common/ConnectNostr";
import { useWeblnWithdraw } from "hooks/useNostrMarket";
import { to } from "await-to-js";
import { useSelector } from "react-redux";
import useWebln from "hooks/useWebln";
import { sleep } from "lib/utils";
import { useDispatch } from "react-redux";
import { setOnlyMobileSupportedVisible } from "store/reducer/modalReducer";
import useDevice from "hooks/useDevice";
import { nip19 } from "nostr-tools";
export default function LightningFormItems({ form, nostrAccount, balance, messageApi, handleQueryBalance }) {
  const { TextArea } = Input;
  const [btnLoading, setBtnLoading] = useState(false);
  const { handleWeblnWithdrawAsync } = useWeblnWithdraw();
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const { npubNostrAccount } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const { makeInvoice } = useWebln();
  const dispatch = useDispatch();
  const device = useDevice();
  const handleWithdraw = useCallback(async () => {
    if (device.isMobile) {
      dispatch(setOnlyMobileSupportedVisible(true));
      return;
    }
    try {
      const [validateErr] = await to(form.validateFields());
      if (validateErr) {
        return;
      }
      if (!withdrawAmount) {
        messageApi.error({
          content: "The minimum withdrawal quantity is 1 SATS."
        });
        return;
      }
      if (withdrawAmount > Number(balance)) {
        messageApi.error({
          content: "Insfufficient balance."
        });
        return;
      }
      setBtnLoading(true);
      const values = form.getFieldsValue(true);
      const withdrawRet = await handleWeblnWithdrawAsync(withdrawAmount, values.invoice);
      if (withdrawRet?.code === 0) {
        messageApi.success({
          content: <p className="message-content">{withdrawRet.data}</p>
        });
        await sleep(4000);
        await handleQueryBalance(npubNostrAccount);
      } else {
        throw new Error(`Withdraw failed: ${withdrawRet?.data}`);
      }
    } catch (e) {
      messageApi.error({
        content: e.message
      });
    } finally {
      setBtnLoading(false);
      form.setFieldValue("invoice", "");
      setWithdrawAmount(0);
    }
  }, [
    balance,
    device.isMobile,
    dispatch,
    form,
    handleQueryBalance,
    handleWeblnWithdrawAsync,
    messageApi,
    npubNostrAccount,
    withdrawAmount
  ]);
  const handleMakeInvoice = useCallback(async () => {
    if (device.isMobile) {
      dispatch(setOnlyMobileSupportedVisible(true));
      return;
    }
    const [err, invoice] = await to(makeInvoice("", npubNostrAccount));
    if (err) {
      messageApi.error({
        content: err.message
      });
      return;
    }
    if (invoice) {
      form.setFieldValue("invoice", invoice?.paymentRequest);
      const parsedData = window.lightningPayReq.decode(invoice?.paymentRequest);
      const amount = parsedData.satoshis;
      setWithdrawAmount(amount);
      await to(form.validateFields());
    }
  }, [device.isMobile, dispatch, form, makeInvoice, messageApi, npubNostrAccount]);
  const memoWithdrawBalance = useMemo(() => {
    return <span className="withdraw-amount-balance">Nostr Account balance: {balance} SATS</span>;
  }, [balance]);
  const memoWithdrawBtn = useMemo(() => {
    return nostrAccount ? (
      <Button type="primary" size="large" className="withdraw-send-btn" loading={btnLoading} onClick={handleWithdraw}>
        Send
      </Button>
    ) : (
      <ConnectNostr />
    );
  }, [btnLoading, handleWithdraw, nostrAccount]);
  const tokens = useMemo(() => {
    return tokenList.filter((item) => item.assetType === "LIGHTNING");
  }, [tokenList]);
  const options = useMemo(() => {
    return tokens.map((tokenItem) => (
      <Select.Option value={tokenItem.name} key={tokenItem.id}>
        {tokenItem.name}
      </Select.Option>
    ));
  }, [tokens]);
  const handleInvoiceChange = useCallback((e) => {
    const value = e.target.value;
    try {
      const parsedData = window.lightningPayReq.decode(value);
      const amount = parsedData.satoshis || 0;
      setWithdrawAmount(amount);
    } catch (err) {
      setWithdrawAmount(0);
    }
  }, []);

  useEffect(() => {
    form.setFieldValue("depositOrWithdrawFormNostrAddress", nostrAccount);
    if (tokens.length > 0) {
      form.setFieldValue("depositOrWithdrawToken", tokens[0].name);
    }
    form.setFieldValue("depositOrWithdrawToken", "SATS");
  }, [form, nostrAccount, tokens]);
  return (
    <>
      <Form.Item
        name="depositOrWithdrawFormNostrAddress"
        label="Send From Nostr Address"
        tooltip="The Nostr address is obtained from any Nostr clients (Damus,Amethyst,Iris etc.) or wallets that support the Nostr protocol. Please make sure to confirm that the Nostr address you are sending asset is correct and securely store the private key associated with that address."
        rules={[
          {
            required: true
          },
          () => ({
            validator(_, value) {
              if (value) {
                if (!/npub\w{59}/.test(value)) {
                  return Promise.reject(new Error(t`Please input a valid Nostr address.`));
                }
                nip19.decode(value).data;
                return Promise.resolve();
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input readOnly size="large" style={{ maxWidth: "460px" }} placeholder="Please input your nostr address" />
      </Form.Item>

      <Form.Item name="depositOrWithdrawToken" label="Send Token">
        <Select
          placeholder="Please select the token which you want to send."
          allowClear={false}
          size="large"
          style={{ maxWidth: "460px" }}
        >
          {options}
        </Select>
      </Form.Item>
      <Form.Item label="Invoice">
        <Row className="withdraw-amount-row" align="middle">
          <Col span={16}>
            <Form.Item
              name="invoice"
              label="Invoice"
              noStyle
              rules={[
                {
                  required: true
                },
                () => ({
                  validator(_, value) {
                    if (value) {
                      if (!/^lnbc\w+$/.test(value)) {
                        return Promise.reject(new Error(`Please input a valid invoice.`));
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <TextArea
                placeholder="Please input an invoice"
                onChange={handleInvoiceChange}
                onBlur={handleInvoiceChange}
                autoSize={{
                  minRows: 2,
                  maxRows: 6
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Button type="link" onClick={handleMakeInvoice}>
              Create Invoice
            </Button>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item label="Send Amount" extra={memoWithdrawBalance}>
        <Row className="withdraw-amount-row">
          <Col span={24}>
            <Form.Item name="amount" noStyle>
              <div className="lightning-withdraw">
                <span className="lightning-withdraw-amount">{withdrawAmount}</span>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      {/*  <Row justify="center" className="lightning-withdraw-tip">
        <span>
          Lightning network send asset needs to create an invoice before the
          transaction. You can create an invoice in the platform or wallet
          account you want to deposit, or you can create it directly when
          sending asset from NostrAssets.
        </span>
      </Row> */}
      <Row justify="center" className="mb20 fixed-btn">
        {memoWithdrawBtn}
      </Row>
      {/*  <Form.Item
        wrapperCol={{
          offset: 7,
          span: 17,
        }}
      >
        {memoWithdrawBtn}
      </Form.Item> */}
    </>
  );
}
