import { Button, Spin, Form, Input, InputNumber, Row, Col } from "antd";
import { useMintAsset, useUnisatPay } from "hooks/useMintAssets";
import { useQueryAssetByEventIdOrAssetName, useQueryAssetByName } from "hooks/graphQuery/useExplore";
import PayAndMintProgress from "../comps/PayAndMintProgress";
import SubmitModal from "../comps/SubmitModal";
import CheckNostrButton from "components/CheckNostrButton";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
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
  const { list, fetching: loadingData } = useQueryAssetByEventIdOrAssetName({ eventId: params?.eventId });
  const QueryGraphaql = useQueryAssetByName();
  const client = useClient();
  const { handleUnisatPay } = useUnisatPay();
  const { handleCreateAssetAsync, handleUpdateAssetAsync, handleCreateMintPayAsync } = useMintAsset();
  const { nostrAccount, account } = useSelector(({ user }) => user);
  const [payTxId, setPayTxId] = useState(null);
  const payBtnDisable = useMemo(() => {
    return !!payTxId || !params?.eventId;
  }, [params?.eventId, payTxId]);

  const memoEventId = useMemo(() => {
    const { eventId } = params;
    return eventId ? eventId : "";
  }, [params]);
  const onSave = useCallback(
    async (values) => {
      try {
        const jsonStr = JSON.stringify(values);
        const encodeAssetData = window.btoa(jsonStr);
        setSaveLoding(true);
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
      }
    },
    [memoEventId, handleCreateAssetAsync, history, handleUpdateAssetAsync]
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
    }
  }, [form, handleCreateMintPayAsync, handleUnisatPay, memoEventId]);

  const formReadOnly = useMemo(() => {
    return !!params?.eventId && nostrAccount !== creator;
  }, [creator, nostrAccount, params?.eventId]);

  const memoConfirmBtn = useMemo(() => {}, []);
  useEffect(() => {
    if (list.length > 0) {
      const assetItem = list[0];
      if (assetItem) {
        setCreator(assetItem.creator);
      }
      const payTxHash = assetItem.pay_tx_hash;
      const detailData = JSON.parse(assetItem.data);
      form.setFieldsValue({
        ...detailData
      });
      if (payTxHash) {
        setPayTxId(payTxHash);
        setAssetMintProgress({
          status: assetItem.status,
          payTxHash: payTxHash
        });
      }
    }
  }, [form, list]);

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
        <h3 className="nostr-assets-titleh3">Create Asset</h3>
        <div className="nostr-assets-titleh3-description">
          Deploy Taproot
          Assets将会直接发送至您的NostrAssets账户中，deploy出的token完全由您自己管理。您可以自己自行设置mint规则
        </div>

        <Spin spinning={loadingData}>
          <Form
            name="mintCreate"
            layout="inline"
            className="nostr-assets-form"
            form={form}
            disabled={formReadOnly}
            labelCol={{
              span: 8
            }}
            wrapperCol={{
              span: 16
            }}
            style={{
              maxWidth: "100%"
            }}
            initialValues={{}}
            onFinish={onSave}
            autoComplete="off"
          >
            <h4 className="nostr-assets-form-groupInfo">Asset info</h4>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Asset Name"
                  name="name"
                  validateTrigger="onBlur"
                  rules={[
                    {
                      required: true,
                      message: "Please input asset name"
                    },
                    () => ({
                      async validator(_, value) {
                        if (value) {
                          const tableName = `${GRAPH_BASE}nostr_create_assets`;
                          const res = await client
                            .query(QueryGraphaql, { name: value, creator: nostrAccount })
                            .toPromise();
                          if (res.data[tableName].length > 0) {
                            return Promise.reject(new Error("This assetName already exists"));
                          }
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Please input asset name!"));
                      }
                    })
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Asset Symbol"
                  name="symbol"
                  rules={[
                    {
                      required: true,
                      message: "Please input the asset symbol"
                    }
                  ]}
                >
                  <Input placeholder="Please input the asset symbol" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Total Supply"
                  name="amount"
                  rules={[
                    {
                      required: true,
                      message: "How many of this asset will supply"
                    }
                  ]}
                >
                  <InputNumber
                    min={1}
                    size="middle"
                    controls={false}
                    placeholder="How many of this asset will supply"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Description (Optional)" name="description">
                  <Input placeholder="Please input the description" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Asset Deploy Decimal"
                  name="decimal"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the asset deploy decimal."
                    }
                  ]}
                >
                  <InputNumber
                    min={1}
                    size="middle"
                    controls={false}
                    placeholder="Please enter the asset deploy decimal"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Asset Display Decimal"
                  name="displayDecimal"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the asset display decimal."
                    }
                  ]}
                >
                  <InputNumber
                    min={1}
                    size="middle"
                    controls={false}
                    placeholder="Please enter the asset display decimal"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Logo URL"
                  name="logo"
                  rules={[
                    {
                      required: true,
                      message: "Please input your asset's logo url."
                    },
                    {
                      type: "url"
                    }
                  ]}
                >
                  <Input placeholder="Please input your asset logo url." />
                </Form.Item>
              </Col>
            </Row>

            <h4 className="nostr-assets-form-groupInfo">Social Media (Optional)</h4>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item label="Twitter" name="twitter">
                  <Input placeholder="Please input twitter ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Telegram" name="telegram">
                  <Input placeholder="Please input telegram ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Discord" name="discord">
                  <Input placeholder="Please input discord ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nostr Address" name="nostrAddress">
                  <Input placeholder="Please input nostr address" />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="center" className="submit">
              <Button type="primary" size="middle" htmlType="submit" loading={saveLoding}>
                Save
              </Button>
            </Row>

            <Row className="nostr-assets-form-servicefee">
              <Col span={12}>
                <Form.Item label="Service fee:">
                  <span className="nostr-assets-form-servicefee__value">0.005BTC</span>
                </Form.Item>
              </Col>
            </Row>

            <h4 className="nostr-assets-form-groupInfo">Payment & Asset mint Progress</h4>
            <Row style={{ width: "100%" }}>
              <PayAndMintProgress assetMintProgress={assetMintProgress} />
            </Row>
          </Form>
        </Spin>
        <div className="nostr-assets-mint">
          {account ? (
            <CheckNostrButton>
              <Button
                type="primary"
                size="middle"
                disabled={payBtnDisable}
                onClick={onPaymentAndCreateAsset}
                loading={payBtnLoading}
              >
                Cofirm Payment and Create Asset
              </Button>
            </CheckNostrButton>
          ) : (
            <ConnectWallet tokenPlatform="BRC20" />
          )}
        </div>
      </div>
    </>
  );
}
