import { Button, Spin, Form, Input, InputNumber, Tooltip, Row, Col, Select } from "antd";
import { useMintAsset, useUnisatPay } from "hooks/useMintAssets";
import { useQueryAssetByEventIdOrAssetName, useQueryAssetByName } from "hooks/graphQuery/useExplore";
import PayAndMintProgress from "../comps/PayAndMintProgress";
import SubmitModal from "../comps/SubmitModal";
import CheckNostrButton from "components/CheckNostrButton";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { LeftOutlined, InfoCircleOutlined, QuestionCircleFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useClient } from "urql";
import "./index.scss";
import ConnectWallet from "components/Common/ConnectWallet";
const GRAPH_BASE = process.env.REACT_APP_GRAPH_BASE;
export default function MintCreate() {
  const [form] = Form.useForm();
  const params = useParams();
  const history = useHistory();
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  // const [createdId, setCreatedId] = useState("85215b48fa3ca73e55f24d6ac55db97e5b25056909439bc9e31c7e0338a778d4");
  const [saveLoding, setSaveLoding] = useState(false);
  const [payBtnLoading, setPayBtnLoading] = useState(false);
  const [assetMintProgress, setAssetMintProgress] = useState(null);
  const [creator, setCreator] = useState(null);
  const {
    list,
    fetching: loadingData,
    reexcuteQuery
  } = useQueryAssetByEventIdOrAssetName({ eventId: params?.eventId });
  const QueryGraphaql = useQueryAssetByName();
  const client = useClient();
  const { handleUnisatPay } = useUnisatPay();
  const { handleCreateAssetAsync, handleUpdateAssetAsync, handleCreateMintPayAsync } = useMintAsset();
  const { nostrAccount, account } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const [payTxId, setPayTxId] = useState(null);
  const memoEventId = useMemo(() => {
    const { eventId } = params;
    return eventId ? eventId : "";
  }, [params]);
  const payBtnDisable = useMemo(() => {
    return !!payTxId || !params?.eventId || nostrAccount !== creator;
  }, [creator, nostrAccount, params?.eventId, payTxId]);
  const memoSaveDisable = useMemo(() => {
    return !!payTxId || (creator !== nostrAccount && params?.eventId);
  }, [creator, nostrAccount, params?.eventId, payTxId]);

  const showConnectBtn = useMemo(() => {
    if (!params.eventId) {
      return true;
    } else {
      if (payTxId) {
        return false;
      }
      if (nostrAccount !== creator) {
        return false;
      }
      return true;
    }
  }, [creator, nostrAccount, params.eventId, payTxId]);

  const onSave = useCallback(
    async (values) => {
      setSaveLoding(true);
      try {
        const jsonStr = JSON.stringify(values);
        const encodeAssetData = window.btoa(jsonStr);
        if (!memoEventId) {
          // create
          const ret = await handleCreateAssetAsync({ encodeAssetData });
          const { sendEvent, result } = ret;
          if (result.code === 0) {
            window._message.success(result.data);
            const sendEventId = sendEvent.id;
            history.replace(`/mint/create/${sendEventId}`);
          } else {
            throw new Error(result.msg);
          }
        } else {
          // update existing asset
          const ret = await handleUpdateAssetAsync({ id: memoEventId, encodeAssetData });
          const { result } = ret;
          if (result.code === 0) {
            window._message.success("Update Asset submitted successfully");
          } else {
            throw new Error(result.msg);
          }
        }
      } catch (err) {
        window._message.error(err.message);
      } finally {
        setSaveLoding(false);
        setCreator(nostrAccount);
      }
    },
    [memoEventId, handleCreateAssetAsync, history, handleUpdateAssetAsync, nostrAccount]
  );
  const onPaymentAndCreateAsset = useCallback(async () => {
    try {
      setPayBtnLoading(true);
      //await form.validateFields();
      const formData = form.getFieldsValue();
      const encodeAssetData = window.btoa(JSON.stringify(formData));
      const txId = await handleUnisatPay(memoEventId);
      if (!txId) throw new Error("Pay failed.");
      setPayTxId(txId);
      const ret = await handleCreateMintPayAsync({ id: memoEventId, txId, encodeAssetData });
      const { result } = ret;
      if (result.code !== 0) {
        throw new Error(result.data);
      }
      window._message.success(result.data);
      setSubmitModalVisible(true);
    } catch (err) {
      if (err.message) {
        window._message.error(err.message);
      }
    } finally {
      setPayBtnLoading(false);
      reexcuteQuery();
    }
  }, [form, handleCreateMintPayAsync, handleUnisatPay, memoEventId, reexcuteQuery]);

  const formReadOnly = useMemo(() => {
    return (!!params?.eventId && nostrAccount !== creator) || !!payTxId;
  }, [creator, nostrAccount, params?.eventId, payTxId]);
  const memoLabelServiceFee = useMemo(() => {
    return (
      <>
        <span style={{ paddingRight: "5px" }}>Service fee</span>
        <Tooltip title="NostrAssets charges only sats as a fixed service fee when creating mint activities. This fee is deducted from your NostrAssets account and remains constant, regardless of the mint pool amount or your asset's value.">
          <InfoCircleOutlined />
        </Tooltip>
      </>
    );
  }, []);
  useEffect(() => {
    if (list.length > 0) {
      const assetItem = list[0];
      if (assetItem) {
        setCreator(assetItem.creator);
      }
      const payTxHash = assetItem.pay_tx_hash || payTxId;
      const detailData = JSON.parse(assetItem.data);
      form.setFieldsValue({
        ...detailData
      });
      if (payTxHash) {
        setPayTxId(payTxHash);
        setAssetMintProgress({
          status: assetItem.status,
          payTxHash: payTxHash,
          createTxHash: assetItem.create_tx_hash
        });
      }
    }
  }, [form, list, payTxId]);
  const options = useMemo(() => {
    return tokenList.map((tokenItem) => {
      return (
        <Select.Option value={tokenItem.name} key={tokenItem.id}>
          <span>{tokenItem.name}</span>
          <span>{tokenItem.token}</span>
        </Select.Option>
      );
    });
  }, [tokenList]);
  const handleTokenChange = useCallback((name) => {}, []);
  const handleMax = useCallback(() => {
    // if (buyOrSell === "sell") {
    //   const maxAmount = getTokenBalance(selectedToken?.name);
    //   form.setFieldValue("amount", maxAmount);
    //   setAmountValue(maxAmount);
    // } else {
    //   if (!priceValue) {
    //     const maxAmount = 0;
    //     form.setFieldValue("amount", maxAmount);
    //     setAmountValue(0);
    //   } else {
    //     const maxAmount = parseInt(getTokenBalance(QUOTE_ASSET) / priceValue);
    //     form.setFieldValue("amount", maxAmount);
    //     setAmountValue(maxAmount);
    //   }
    // }
    // form.validateFields(["amount"]);
  }, []);
  const maxSuffix = useMemo(() => {
    return (
      <Button type="link" className="suffix-btn" onClick={handleMax}>
        Max
      </Button>
    );
  }, [handleMax]);
  return (
    <>
      <SubmitModal visible={submitModalVisible} setVisible={setSubmitModalVisible} />
      <div className="nostr-assets-container">
        <div className="nostr-assets-back">
          <Button
            type="link"
            onClick={() => {
              history.goBack(-1);
            }}
            icon={<LeftOutlined />}
          >
            Back
          </Button>
        </div>
        <h3 className="nostr-assets-titleh3">Launch Mint Activity</h3>
        <div className="nostr-assets-titleh3-description">
          Effortlessly launch a Fair Mint Activity for your Taproot asset on NostrAssets. You can create your own or
          import Taproot assets to set up Fair Mint Activities (as long as you hold ≥30% of the asset).
        </div>

        <Form
          name="mintCreate"
          layout="vertical"
          className="nostr-assets-form"
          form={form}
          disabled={formReadOnly}
          // labelCol={{
          //   span: 8
          // }}
          // wrapperCol={{
          //   span: 16
          // }}
          style={{
            marginTop: "60px",
            padding: "0 300px",
            maxWidth: "100%"
          }}
          initialValues={{ decimal: 1, displayDecimal: 1 }}
          onFinish={onSave}
          autoComplete="off"
        >
          {/* <h4 className="nostr-assets-form-groupInfo">Asset info</h4> */}
          <Form.Item
            label="Select Your Asset"
            name="asset"
            required
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: "Please Select Your Asset"
              }
            ]}
          >
            <Select className="listing-select" onChange={handleTokenChange}>
              {options}
            </Select>
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>Total Supply: - -; You current hold: - -</div>
          <Form.Item
            label={
              <Tooltip
                placement="top"
                title="The maximum allocation for users to mint in the mint pool is typically set at a minimum of 5% of the total supply to launch a mint activity. The asset amount will be deducted from your NostrAssets account, so please ensure you maintain an adequate balance in NostrAssets."
              >
                Maximum Mint Amount <InfoCircleOutlined />
              </Tooltip>
            }
            name="amount"
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: "Please input the Maximum Mint Amount"
              }
            ]}
          >
            <Input placeholder="Please input the Maximum Mint Amount" suffix={maxSuffix} />
          </Form.Item>
          <div>Percentage：--</div>
          <div style={{ marginBottom: "20px" }}>
            Required at least 5% of total supply put in mint pool to lanuch a mint activity
          </div>
          <Form.Item
            label="Number of Mints (10~5000)"
            required
            name="amount"
            style={{ marginBottom: 0 }}
            rules={[
              /*  {
                      required: true,
                      message: "How many of this asset will supply"
                    }, */
              {
                validator(_, value) {
                  if (value) {
                    if (Number(value) < 100 || Number(value) > 100000000000) {
                      return Promise.reject(new Error("Total Supply is a number from 100 to 100000000000."));
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please enter the supply mount value"));
                }
              }
            ]}
          >
            <Input size="middle" controls={false} placeholder="Please setup the Number of Mints, every Single Mint Amount is equal." />
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>Single Mint Amount - -</div>
          <Form.Item label="Maximum Mints Per Address" required name="description">
            <Input placeholder="Please setup the Maximum Mints limit for each address" maxLength={500} />
          </Form.Item>
          <Form.Item
            label="Mint Fee/Mint (≥0, Mint fee will send to your NostrAssets account after every mint)"
            name="decimal"
            style={{ marginBottom: 0 }}
            required
            rules={[
              {
                validator(_, value) {
                  if (value) {
                    if (Number(value) < 0 || Number(value) > 18) {
                      return Promise.reject(new Error("Asset Deploy Decimal is a number from 0 to 18."));
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please enter the asset deploy decimal."));
                }
              }
            ]}
          >
            <Input size="middle" controls={false} placeholder="eg. setup 100, every mint will pay 100 sats to you" />
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>--sats/Mint</div>
          {/* <Row className="nostr-assets-form-servicefee">
            <Col span={12}> */}
          {/* <Form.Item label={memoLabelServiceFee}>
            <span className="nostr-assets-form-servicefee__value">1200 sats</span>
          </Form.Item> */}
          <div>
            {memoLabelServiceFee}<span className="nostr-assets-form-servicefee__value" style={{marginLeft: "20px"}}>1200 sats (Balance: 100 sats)</span>
          </div>
          {/* </Col>
          </Row> */}
          <Row justify="center" className="submit">
            <Button type="primary" disabled={memoSaveDisable} size="middle" htmlType="submit" loading={saveLoding}>
              Launch Your Mint Activity
            </Button>
          </Row>
        </Form>
      </div>
    </>
  );
}
