import { Form, Row, Col, Input, Button, Space, Select } from "antd";
import { useSize, useThrottleFn } from "ahooks";
import { useEffect, useMemo, useState, useCallback } from "react";
import { to } from "await-to-js";

import ConnectNostr from "components/Common/ConnectNostr";
import EllipsisMiddle from "components/EllipsisMiddle";
import { useTaprootDeposit, useQueryBalance } from "hooks/useNostrMarket";
import dayjs from "dayjs";
import QRCode from "qrcode.react";
import IconBtc from "img/ic_btc_40.svg";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setOnlyMobileSupportedVisible } from "store/reducer/modalReducer";
import useDevice from "hooks/useDevice";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
export default function TaprootFormItems({ form, nostrAccount, notifiApi, messageApi }) {
  //const { width } = useSize(document.querySelector("body"));
  /*   const [amount, setAmount] = useState(0); */
  const [btnLoading, setBtnLoading] = useState(false);
  const [payInvoice, setPaymentInvoice] = useState(null);
  const { tokenList } = useSelector(({ market }) => market);
  const { handleGetTaprootDepositInvoice } = useTaprootDeposit();
  const dispatch = useDispatch();
  const device = useDevice();
  const tokens = useMemo(() => {
    return tokenList.filter((item) => item.assetType === "TAPROOT");
  }, [tokenList]);
  const options = useMemo(() => {
    return tokens.map((tokenItem) => (
      <Select.Option value={tokenItem.name} key={tokenItem.id}>
        {tokenItem.name}
      </Select.Option>
    ));
  }, [tokens]);

  /* 
    create invoice from nostr
  */
  const handleCreateInvoice = useCallback(async () => {
    // if (device.isMobile) {
    //   dispatch(setOnlyMobileSupportedVisible(true));
    //   return;
    // }
    const [validateErr, _] = await to(form.validateFields());
    if (validateErr) {
      return;
    }
    setBtnLoading(true);
    setPaymentInvoice(null);
    try {
      const values = form.getFieldsValue(true);
      const createRet = await handleGetTaprootDepositInvoice(
        values.amount,
        values.depositOrWithdrawFormNostrAddress,
        values.depositOrWithdrawToken
      );
      if (createRet.code !== 0) {
        throw new Error(createRet.msg);
      }
      setPaymentInvoice({ invoice: createRet.data, createTime: Date.now() });
    } catch (e) {
      messageApi.error({
        content: e.message
      });
    } finally {
      setBtnLoading(false);
    }
  }, [form, handleGetTaprootDepositInvoice, messageApi]);

  const memoSubmitButton = useMemo(() => {
    return nostrAccount ? (
      <>
        {!payInvoice && (
          <Space>
            <Button
              type="primary"
              size="large"
              loading={btnLoading}
              disabled={!nostrAccount}
              onClick={handleCreateInvoice}
            >
              Create Invoice
            </Button>
          </Space>
        )}
      </>
    ) : (
      <ConnectNostr />
    );
  }, [btnLoading, handleCreateInvoice, nostrAccount, payInvoice]);

  const memoPaymentInvoice = useMemo(() => {
    return payInvoice ? (
      <>
        <span className="deposit-invoices-time">{dayjs(payInvoice.createTime).format("YYYY-MM-DD HH:mm:ss")}</span>
        <EllipsisMiddle suffixCount={20}>{payInvoice.invoice}</EllipsisMiddle>
      </>
    ) : (
      ""
    );
  }, [payInvoice]);
  const { run: handleAmountOnChange } = useThrottleFn(
    async ({ target: { value } }) => {
      if (!Number.isNaN(value) && value) {
        let splitValue = value.split(".");

        const formatValue = splitValue[0];

        form.setFieldValue("amount", Number(formatValue));
        if (payInvoice) {
          setPaymentInvoice(null);
        }
      }
    },
    {
      wait: 500
    }
  );
  useEffect(() => {
    form.setFieldValue("depositOrWithdrawFormNostrAddress", nostrAccount);
    if (tokens.length > 0) {
      form.setFieldValue("depositOrWithdrawToken", tokens[0].name);
    }
    form.setFieldValue("amount", 0);
  }, [form, nostrAccount, tokens]);
  useEffect(() => {
    if (nostrAccount) {
      setPaymentInvoice(null);
    }
  }, [nostrAccount]);
  return (
    <>
      <Form.Item
        name="depositOrWithdrawFormNostrAddress"
        label="Receiving Nostr Address"
        tooltip="The Nostr address is obtained from any Nostr clients (Damus,Amethyst,Iris etc.) or wallets that support the Nostr protocol. Please make sure to confirm that the Nostr address you are receiving asset is correct and securely store the private key associated with that address."
        rules={[
          {
            required: true
          },
          ({ getFieldValue }) => ({
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
        <Input size="large" style={{ maxWidth: "460px" }} placeholder="Please input your nostr address" />
      </Form.Item>
      <Form.Item name="depositOrWithdrawToken" label="Receive Token">
        <Select
          placeholder="Please select the token which you want to receive."
          allowClear={false}
          size="large"
          style={{ maxWidth: "460px" }}
        >
          {options}
        </Select>
      </Form.Item>
      <Form.Item label="Amount">
        <Row className="withdraw-amount-row" align="middle">
          <Col span={14}>
            <Form.Item
              name="amount"
              noStyle
              rules={[
                () => ({
                  validator(_, value) {
                    if (Number.isNaN(Number(value))) {
                      form.setFieldValue("amount", "");
                      return Promise.reject(new Error(`Please input receive amount.`));
                    }
                    if (Number(value) <= 0) {
                      return Promise.reject(new Error(`Please input receive amount.`));
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input placeholder="Please input your amount" size="large" onChange={handleAmountOnChange} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Button type="link" loading={btnLoading} onClick={handleCreateInvoice} size="small">
              Create New Invoice
            </Button>
          </Col>
        </Row>
      </Form.Item>
      {memoPaymentInvoice && (
        <div className="deposit-invoices">
          <div className="deposit-invoices-title">Generated invoices:(only show the last 1 invoice):</div>
          <div className="deposit-invoices-item">{memoPaymentInvoice}</div>
          {payInvoice?.invoice && (
            <Row className="deposit-invoices-qrcode" justify="center">
              <QRCode
                renderAs="canvas"
                level="L"
                value={payInvoice.invoice}
                size={200}
                imageSettings={{
                  src: IconBtc,
                  width: 24,
                  height: 24
                }}
              />
            </Row>
          )}
        </div>
      )}
      <Row justify="center" className="mb20 fixed-btn">
        {memoSubmitButton}
      </Row>
    </>
  );
}
