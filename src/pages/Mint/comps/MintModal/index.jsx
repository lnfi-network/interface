import { Modal, Button, Form, Input, InputNumber, Row, Col } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";

import "./index.scss";

import { useSelector } from "react-redux";
const layout = {
  labelCol: {
    span: 10
  },
  wrapperCol: {
    span: 14
  }
};
export default function MintModal({ visible, setVisible, mintDetail }) {
  console.log("🚀 ~ file: index.jsx:16 ~ MintModal ~ mintDetail:", mintDetail);
  //todo queryAllowance & approve & submit & requery
  const { npubNostrAccount } = useSelector(({ user }) => user);
  const [totalMintAmount, setTotalMintAmount] = useState(0);
  const [form] = Form.useForm();
  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);
  const onMintNumberChange = useCallback(
    ({ target: { value } }) => {
      if (Number.isNaN(Number(value))) {
        form.setFieldValue("mintNumber", "");
      } else {
        const singleMintAmount = Number(mintDetail?.single_amount) || 0;
        setTotalMintAmount(singleMintAmount * Number(value));
      }
    },
    [form, mintDetail?.single_amount]
  );
  const onNumberMintMax = useCallback(() => {
    console.log(1);
    form.setFieldValue("mintNumber", mintDetail?.max_address);
  }, [form, mintDetail?.max_address]);

  const submitBtn = useMemo(() => {
    return (
      <Button type="primary" size={"middle"}>
        Ok
      </Button>
    );
  }, []);

  const tokenName = useMemo(() => {
    return mintDetail?.token_name;
  }, [mintDetail?.token_name]);

  return (
    <>
      <Modal
        className="nostrswap-modal"
        open={visible}
        width="500px"
        title={`Mint ${tokenName}`}
        zIndex={1002}
        footer={null}
        onCancel={() => {
          handleCancel();
        }}
      >
        <Form className="mint-form" {...layout} form={form} name="mintForm" autoComplete="off">
          <Form.Item label="Single Mint Amount:" className="form-item-display">
            <span className="form-item-display__text">
              {mintDetail?.single_amount || 0} {tokenName}
            </span>
          </Form.Item>
          <Form.Item
            label="Number of Mints"
            required
            rules={[
              {
                validator(_, value) {
                  if (value) {
                    if (Number(value) < 1 || Number(value) > mintDetail?.max_address) {
                      return Promise.reject(
                        new Error(`The Number of Mints is a number from 1 to ${mintDetail?.max_address}.`)
                      );
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please enter the Number of mints"));
                }
              }
            ]}
            name="mintNumber"
            className="form-item-display"
          >
            <Input
              className="mint-number"
              size="middle"
              onChange={onMintNumberChange}
              suffix={
                <Button onClick={onNumberMintMax} className="mint-number-max" type="link">
                  Max
                </Button>
              }
            />
          </Form.Item>
          <Form.Item label="Total Mint Amount:" className="form-item-display">
            <span className="form-item-display__text">{totalMintAmount}</span>
          </Form.Item>
          <Form.Item label="Mint Fee:" className="form-item-display">
            <span className="form-item-display__text">{mintDetail?.mint_fee} sats</span>
          </Form.Item>
          <Form.Item label="Service Fee:" className="form-item-display">
            <span className="form-item-display__text">1000 sats</span>
          </Form.Item>
          <Form.Item label="Total Fee" className="form-item-display">
            <span className="form-item-display__text">
              {Number(mintDetail?.mint_fee) + 1000} sats{" "}
              <span className="form-item-display__text-tip">(Balance: 100sats)</span>
            </span>
          </Form.Item>
          {/*  <Form.Item label={buyOrSell === "buy" ? "Buy Amount" : "Sell Amount"}>
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
          </Form.Item> */}

          {/* <Form.Item
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
          </Form.Item> */}

          <Form.Item wrapperCol={24} align="middle">
            <Row justify="center" style={{ marginTop: "10px" }}>
              {submitBtn}
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
