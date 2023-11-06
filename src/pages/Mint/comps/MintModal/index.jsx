import { Modal, Button, Form, Input, Tooltip, Row, Col } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAllowance, useApprove, useMintActivity } from "hooks/useNostrMint";
import { QUOTE_ASSET } from "config/constants";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useMintActivityDetailStats } from "hooks/graphQuery/useMintQuery";
import { InfoCircleOutlined, DownCircleOutlined } from "@ant-design/icons";
import MintSuccessModal from "../MintSuccessModal";
import { useHistory } from "react-router-dom";
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
export default function MintModal({ visible, setVisible, mintDetail, reexcuteQueryMintAssetDetail }) {
  //todo queryAllowance & approve & submit & requery
  const history = useHistory();
  const { nostrAccount, npubNostrAccount, balanceList } = useSelector(({ user }) => user);
  const { handleQueryBalance } = useQueryBalance();
  const { allowance, handleQueryAllowanceAsync } = useAllowance(QUOTE_ASSET);
  const { handleApproveAsync } = useApprove();
  const { handleMintActivityAsync } = useMintActivity();
  const [totalMintAmount, setTotalMintAmount] = useState(0);
  const [approveBtnLoading, setApproveBtnLoading] = useState(false);
  const [mintFee, setMintFee] = useState(0);
  const [mintLoading, setMintLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { hadMintCount, reexcuteQuery: reQueryHadMintCount } = useMintActivityDetailStats(
    mintDetail?.id,
    nostrAccount
  );
  const [form] = Form.useForm();

  const tokenName = useMemo(() => {
    return mintDetail?.token_name;
  }, [mintDetail?.token_name]);
  const remainingNumber = useMemo(() => {
    // console.log("mintDetail", mintDetail);
    if(mintDetail?.max_amount) {
      return (mintDetail.max_amount - mintDetail.received_amount) / mintDetail.single_amount
    }
    
  }, [mintDetail])
  const totalFee = useMemo(() => {
    return Number(mintFee) + 1000;
  }, [mintFee]);
  const balance = useMemo(() => {
    return balanceList[QUOTE_ASSET];
  }, [balanceList]);

  const maxMintNumber = useMemo(() => {
    const maxAddress = mintDetail?.max_address || 0;
    return Number(maxAddress) - hadMintCount;
  }, [hadMintCount, mintDetail?.max_address]);

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
        setMintFee(Number(value) * mintDetail?.mint_fee);
      }
    },
    [form, mintDetail?.mint_fee, mintDetail?.single_amount]
  );
  const onNumberMintMax = useCallback(() => {
    const max = remainingNumber > maxMintNumber ? maxMintNumber : remainingNumber
    form.setFieldValue("mintNumber", max);
    const singleMintAmount = Number(mintDetail?.single_amount) || 0;
    setTotalMintAmount(singleMintAmount * max);
    setMintFee(max * mintDetail?.mint_fee);
    form.validateFields(["mintNumber"])
  }, [form, maxMintNumber, mintDetail?.mint_fee, mintDetail?.single_amount, remainingNumber]);

  const memoNumberMintsExtra = useMemo(() => {
    // Remaining maximum share
    return <span className="number-mint-etra">Maximum Shares Per Address {mintDetail?.max_address}</span>;
  }, [mintDetail?.max_address]);
  const onApprove = useCallback(async () => {
    try {
      setApproveBtnLoading(true);
      await form.validateFields();
      const ret = await handleApproveAsync(totalFee, QUOTE_ASSET);
      if (ret.code !== 0) {
        throw new Error(ret.data);
      }
      await handleQueryAllowanceAsync(QUOTE_ASSET);
      window._message.success(ret.data);
    } catch (e) {
      e.message && window._message.error(e.message);
    } finally {
      setApproveBtnLoading(false);
    }
  }, [form, handleApproveAsync, handleQueryAllowanceAsync, totalFee]);

  const onMint = useCallback(async () => {
    try {
      setMintLoading(true);
      await form.validateFields();
      const addressNum = form.getFieldValue("mintNumber");
      const ret = await handleMintActivityAsync(mintDetail?.id, addressNum);
      if (ret.code !== 0) {
        throw new Error(ret.data);
      }
      await handleQueryAllowanceAsync(QUOTE_ASSET);
      await handleQueryBalance(npubNostrAccount);
      //queryBalance
      handleCancel();
      //window._message.success(ret.data);
      setSuccessModalVisible(true);
    } catch (e) {
      e.message && window._message.error(e.message);
    } finally {
      setMintLoading(false);
      reexcuteQueryMintAssetDetail();
      reQueryHadMintCount();
    }
  }, [
    form,
    handleCancel,
    handleMintActivityAsync,
    handleQueryAllowanceAsync,
    handleQueryBalance,
    mintDetail?.id,
    npubNostrAccount,
    reQueryHadMintCount,
    reexcuteQueryMintAssetDetail
  ]);

  const submitBtn = useMemo(() => {
    if (!balance?.balance || balance?.balance < totalFee) {
      return (
        <Button type="primary" size="middle" disabled>
          Insufficient Balance
        </Button>
      );
    }
    if (maxMintNumber === 0) {
      return (
        <Button type="primary" size="middle" disabled>
          Insufficient Number of Mints
        </Button>
      );
    }
    if (allowance?.amount < totalFee) {
      return (
        <Button className="mint-modal-btn" type="primary" size="middle" loading={approveBtnLoading} onClick={onApprove}>
          Approve
        </Button>
      );
    }
    return (
      <Button className="mint-modal-btn" type="primary" size="middle" loading={mintLoading} onClick={onMint}>
        Mint
      </Button>
    );
  }, [allowance?.amount, approveBtnLoading, balance?.balance, mintLoading, onApprove, onMint, totalFee, maxMintNumber]);

  useEffect(() => {
    handleQueryAllowanceAsync(QUOTE_ASSET);
  }, [handleQueryAllowanceAsync]);

  useEffect(() => {
    const mintNumer = form.getFieldValue("mintNumber") || 1;
    if (mintDetail?.mint_fee) {
      setMintFee(mintNumer * mintDetail?.mint_fee);
    }
  }, [form, mintDetail?.mint_fee]);

  return (
    <>
      <MintSuccessModal
        visible={successModalVisible}
        setVisible={setSuccessModalVisible}
        tokenName={mintDetail?.token_name}
        totalMintAmount={totalMintAmount}
        mintTokenNumber={mintDetail?.single_amount}
      />
      <Modal
        className="nostrswap-modal"
        open={visible}
        width="500px"
        title={`Mint ${tokenName}`}
        zIndex={1002}
        footer={null}
        destroyOnClose={true}
        onCancel={() => {
          handleCancel();
        }}
      >
        <Form className="mint-form" {...layout} form={form} name="mintForm" autoComplete="off" preserve={false}>
          <Form.Item label="Asset Amount per share:" className="form-item-display">
            <span className="form-item-display__text">
              {mintDetail?.single_amount || 0} {tokenName}
            </span>
          </Form.Item>
          <Form.Item
            label="Shares"
            required
            extra={memoNumberMintsExtra}
            rules={[
              {
                validator(_, value) {
                  if (value) {
                    if(Number(value) > maxMintNumber) {
                      return Promise.reject(new Error(`Maximum shares per address is ${maxMintNumber}, already minted ${hadMintCount} shares.`));
                    }
                    if(Number(value) > remainingNumber) {
                      return Promise.reject(new Error(`Exceeds the remaining shares ${remainingNumber}.`));
                    }
                    if (Number(value) < 1) {
                      return Promise.reject(new Error(`Shares at least 1.`));
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please enter the Shares"));
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
            <span className="form-item-display__text f16">{totalMintAmount} {tokenName}</span>
          </Form.Item>
          <Form.Item
            label={
              <Tooltip
                placement="top"
                title="The Mint Fee is determined by the asset deployer and may vary for different mint activities."
              >
                Mint Fee <InfoCircleOutlined />
              </Tooltip>
            }
            className="form-item-display"
          >
            <span className="form-item-display__text">{mintFee} sats</span>
          </Form.Item>
          <Form.Item
            label={
              <Tooltip placement="top" title="NostrAssets only charges sats as the service fee when minting assets.">
                Service Fee <InfoCircleOutlined />
              </Tooltip>
            }
            className="form-item-display"
          >
            <span className="form-item-display__text">1000 sats</span>
          </Form.Item>
          <Form.Item label="Total Fee" className="form-item-display">
            <div className="form-item-display__text">
              {totalFee} sats{" "}
              
            </div>
            <div className="form-item-display__text-tip">
              <span>Balance: {balance?.balanceShow || 0} sats</span>
              <DownCircleOutlined onClick={() => history.push("/receive")} style={{ fontSize: "14px", color: "#38c89d", cursor:"pointer", marginLeft: "6px", verticalAlign: "middle" }} />
            </div>
            
          </Form.Item>

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