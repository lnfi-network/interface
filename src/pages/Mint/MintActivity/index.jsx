import { Button, Spin, Form, Input, InputNumber, Tooltip, Row, Col, Select, Space, message, Modal } from "antd";
import { useMintAsset, useUnisatPay } from "hooks/useMintAssets";
import { useQueryAssetByEventIdOrAssetName, useQueryAssetByName } from "hooks/graphQuery/useExplore";
import PayAndMintProgress from "../comps/PayAndMintProgress";
import SubmitModal from "../comps/SubmitModal";
import CheckNostrButton from "components/CheckNostrButton";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { LeftOutlined, InfoCircleOutlined, QuestionCircleFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { QUOTE_ASSET, MINT_SERVICE_FEE } from "config/constants";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import { useLaunchMintActivity, useAllowance, useApprove } from "hooks/useNostrMint";
import { useSendListOrder, useQueryBalance } from "hooks/useNostrMarket";
import { CheckCircleOutlined, CloseCircleOutlined, SwapOutlined } from "@ant-design/icons";
import { t } from "@lingui/macro";
import "./index.scss";
const NOSTR_MINT_SEND_TO = process.env.REACT_APP_NOSTR_MINT_SEND_TO;
// const serviceFee = MINT_SERVICE_FEE;
export default function MintCreate() {
  const [form] = Form.useForm();
  const params = useParams();
  const history = useHistory();
  const { handleQueryAllowanceAsync, allowance } = useAllowance();
  const { handleApproveAsyncByCommand } = useApprove();
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const { handleLaunchMintActivityAsync } = useLaunchMintActivity();
  const [selectToken, setSelectToken] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [selectBalance, setSelectBalance] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [amount, setAmount] = useState(0);
  const [numberMint, setNumberMint] = useState(0);
  const [singleMint, setSingleMint] = useState(0);
  const [addressMints, setAddressMints] = useState(0);
  const [fee, setFee] = useState(0);
  const [selectAllowance, setSelectAllowance] = useState(0);
  const [quoteAllowance, setQuoteAllowance] = useState(0);
  // const [createdId, setCreatedId] = useState("85215b48fa3ca73e55f24d6ac55db97e5b25056909439bc9e31c7e0338a778d4");
  const [btnLoading, setBtnLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const showSuccessModal = () => {
    setIsSuccessModalOpen(true);
  };
  const handleSuccessOk = () => {
    setIsSuccessModalOpen(false);
  };
  const handleSuccessCancel = () => {
    setIsSuccessModalOpen(false);
    history.replace(`/mintassets/mint-assets`)
  };
  const reset = useCallback(() => {
    form.resetFields(["amount", "number", "addressMints"]);
    setPercentage(0);
    setAmount(0);
    setNumberMint(0);
    setSingleMint(0);
    setAddressMints(0);
  }, [form]);
  const { nostrAccount, account, balanceList } = useSelector(({ user }) => user);
  const { tokenList } = useSelector(({ market }) => market);
  const qutoAsset = useMemo(() => {
    return tokenList.find((tokenItem) => tokenItem?.name === QUOTE_ASSET);
  }, [tokenList]);
  const getTokenBalance = useCallback(
    (tokenName) => {
      return balanceList[tokenName]?.balanceShow || 0;
    },
    [balanceList]
  );
  const onConfirm = useCallback(
    async (values) => {
      // setSaveLoding(true);
      // console.log("values", values);
      try {
        await form.validateFields();
        showModal();
      } catch (error) {}

      // try {
      //   const ret = await handleLaunchMintActivityAsync({ ...values });
      //   const { sendEvent, result } = ret;
      //   console.log("ret", ret);
      //   if (ret?.code === 0) {
      //     message.success(t`Submit successfully`);
      //     // window._message.success(result.data);
      //     // const sendEventId = sendEvent.id;
      //     // history.replace(`/mint/create/${sendEventId}`);
      //   } else {
      //     message.error(ret.data || "Fail");
      //   }
      // } catch (error) {
      //   message.error(error.message || "Fail");
      // }
    },
    [form]
  );
  const onSave = useCallback(async () => {
    // setSaveLoding(true);
    // console.log("values", values);
    const values = form.getFieldsValue();
    try {
      setBtnLoading(true);
      const ret = await handleLaunchMintActivityAsync({ ...values });
      // console.log("ret", ret);
      if (ret?.code === 0) {
        // message.success(t`Submit successfully`);
        handleCancel();
        showSuccessModal();
        // window._message.success(result.data);
        // const sendEventId = sendEvent.id;
        // history.replace(`/mint/create/${sendEventId}`);
      } else {
        message.error(ret.data || "Fail");
      }
      setBtnLoading(false);
    } catch (error) {
      message.error(error.message || "Fail");
      setBtnLoading(false);
    }
  }, [form, handleLaunchMintActivityAsync]);
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
  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) => {
    console.log("option", option);
    return (
      (option?.value ?? "").toLowerCase().includes(input.toLowerCase()) ||
      (option?.id ?? "").toLowerCase().includes(input.toLowerCase())
    );
  };
  const options = useMemo(() => {
    return tokenList.map((tokenItem) => {
      return (
        <Select.Option value={tokenItem.name} label={tokenItem.name} key={tokenItem.id} id={tokenItem?.token}>
          <Space>
            <span aria-label={tokenItem.name} style={{ display: "inline-block", width: "260px" }}>
              {tokenItem.name}
            </span>
            <span>
              {tokenItem?.token?.replace(tokenItem?.token?.substring(15, tokenItem?.token?.length - 15), "***")}
            </span>
          </Space>
        </Select.Option>
      );
    });
  }, [tokenList]);
  const handleTokenChange = useCallback(
    async (value) => {
      console.log(`selected ${value}`);
      const token = tokenList.find((tokenItem) => tokenItem?.name === value);
      setSelectToken(token);
      setTotalSupply(token?.totalSupply);
      setSelectBalance(getTokenBalance(value));
      reset();
      const tokenAllowanceRet = await handleQueryAllowanceAsync(token?.name);
      const quoteAllowanceRet = await handleQueryAllowanceAsync(QUOTE_ASSET);
      setSelectAllowance(tokenAllowanceRet?.data?.amountShow);
      setQuoteAllowance(quoteAllowanceRet?.data?.amountShow);
    },
    [getTokenBalance, handleQueryAllowanceAsync, reset, tokenList]
  );
  const handleMax = useCallback(() => {
    form.setFieldValue("amount", selectBalance);
    setAmount(selectBalance);
    setPercentage(limitDecimals((selectBalance / totalSupply) * 100, 2, "floor"));
  }, [form, selectBalance, totalSupply]);
  const maxSuffix = useMemo(() => {
    return (
      <Button type="link" className="suffix-btn" onClick={handleMax}>
        Max
      </Button>
    );
  }, [handleMax]);
  useEffect(() => {
    if (Number(amount) && Number(numberMint)) {
      setSingleMint(amount / numberMint);
    }
  }, [amount, numberMint]);
  const amountChange = useCallback(
    (e) => {
      var value = e.target.value;
      if (Number(value)) {
        const inpVal = Number(value.replace(/[^\d]/g, ""));
        // const val = inpVal > selectBalance ? selectBalance : inpVal;
        setAmount(inpVal);
        setPercentage(limitDecimals((inpVal / totalSupply) * 100, 2, "floor"));
        form.setFieldValue("amount", inpVal);
      } else {
        setAmount(0);
      }
      form.validateFields(["amount"])
    },
    [form, totalSupply]
  );
  const numberChange = useCallback(
    (e) => {
      var value = e.target.value;
      if (Number(value)) {
        const val = Number(value.replace(/[^\d]/g, ""));
        setNumberMint(val);
        form.setFieldValue("number", val);
      } else {
        setNumberMint(0);
      }
    },
    [form]
  );
  const addressMintsChange = useCallback(
    (e) => {
      var value = e.target.value;
      if (Number(value)) {
        const inpVal = Number(value.replace(/[^\d]/g, ""));
        const val = inpVal > numberMint ? numberMint : inpVal;
        setAddressMints(val);
        form.setFieldValue("addressMints", val);
      } else {
        setAddressMints(0);
      }
    },
    [form, numberMint]
  );
  const mintFeeChange = useCallback(
    (e) => {
      var value = e.target.value;
      if (Number(value)) {
        const inpVal = Number(value.replace(/[^\d]/g, ""));
        setFee(inpVal);
        form.setFieldValue("fee", inpVal);
      }
    },
    [form]
  );
  const onApprove = useCallback(async () => {
    // if (Number(memoTotalValue) < selectedToken?.volume * qutoAssetVolume) {
    //   message.warning(`Minimum Qty is ${selectedToken?.volume * qutoAssetVolume} ${QUOTE_ASSET}`);
    //   return;
    // }
    try {
      await form.validateFields();
      setBtnLoading(true);
      var command = "";
      if (!selectAllowance || selectAllowance < amount) {
        command += `approve ${amount} ${selectToken?.name} to ${NOSTR_MINT_SEND_TO};`;
      }
      if (!quoteAllowance || quoteAllowance < MINT_SERVICE_FEE) {
        command += `approve ${MINT_SERVICE_FEE} ${QUOTE_ASSET} to ${NOSTR_MINT_SEND_TO}`;
      }
      let ret = await handleApproveAsyncByCommand(command);
      if (!ret) {
        return;
      }
      if (ret?.code === 0) {
        message.success("Approve Success");
        const tokenAllowanceRet = await handleQueryAllowanceAsync(selectToken?.name);
        const quoteAllowanceRet = await handleQueryAllowanceAsync(QUOTE_ASSET);
        setSelectAllowance(tokenAllowanceRet?.data?.amountShow);
        setQuoteAllowance(quoteAllowanceRet?.data?.amountShow);
      } else {
        message.error(ret.data);
      }
      setBtnLoading(false);
    } catch (e) {
      // console.log("messageApi.error(e.message);",e, e?.errorField);
      if (!e?.errorFields?.length) {
        message.error(e.message);
      }
    } finally {
      setBtnLoading(false);
    }
  }, [
    amount,
    form,
    handleApproveAsyncByCommand,
    handleQueryAllowanceAsync,
    quoteAllowance,
    selectAllowance,
    selectToken?.name
  ]);
  const memoButton = useMemo(() => {
    if (MINT_SERVICE_FEE > getTokenBalance(QUOTE_ASSET)) {
      return (
        <Button type="primary" size="large" style={{ width: "260px" }} disabled={true}>
          {"Insufficient balance"}
        </Button>
      );
    } else {
      return (
        <CheckNostrButton>
          <Button type="primary" style={{ width: "260px" }} size="large" onClick={onConfirm}>
            Launch Your Mint Activity
          </Button>
        </CheckNostrButton>
      );
    }
  }, [getTokenBalance, onConfirm]);
  const memoModalButton = useMemo(() => {
    if (MINT_SERVICE_FEE > getTokenBalance(QUOTE_ASSET)) {
      return (
        <Button type="primary" size="large" style={{ width: "200px" }} disabled={true}>
          {"Insufficient balance"}
        </Button>
      );
    } else if (selectAllowance && selectAllowance >= amount && quoteAllowance && quoteAllowance >= MINT_SERVICE_FEE) {
      return (
        <CheckNostrButton>
          <Button type="primary" style={{ width: "200px" }} size="large" loading={btnLoading} onClick={onSave}>
            Submit
          </Button>
        </CheckNostrButton>
      );
    } else {
      return (
        <CheckNostrButton>
          <Button type="primary" style={{ width: "200px" }} size="large" onClick={onApprove} loading={btnLoading}>
            Approve
          </Button>
        </CheckNostrButton>
      );
    }
  }, [amount, btnLoading, getTokenBalance, onApprove, onSave, quoteAllowance, selectAllowance]);
  return (
    <>
      <SubmitModal visible={submitModalVisible} setVisible={setSubmitModalVisible} />
      <div className="nostr-assets-container">
        <div className="nostr-activity-back">
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
        <h3 className="nostr-activity-titleh3">Launch Mint Activity</h3>
        <div className="nostr-activity-titleh3-description">
          Effortlessly launch a Fair Mint Activity for your Taproot asset on NostrAssets. You can create your own or
          import Taproot assets to set up Fair Mint Activities (as long as you hold ≥30% of the asset).
        </div>

        <Form
          name="mintCreate"
          layout="vertical"
          className="nostr-activity-form"
          form={form}
          // labelCol={{
          //   span: 8
          // }}
          // wrapperCol={{
          //   span: 16
          // }}
          style={{
            marginTop: "60px",
            padding: "0 300px 30px",
            maxWidth: "100%"
          }}
          // initialValues={{ decimal: 1, displayDecimal: 1 }}
          // onFinish={onConfirm}
          autoComplete="off"
        >
          {/* <h4 className="nostr-activity-form-groupInfo">Asset info</h4> */}
          <Form.Item
            label="Select Your Asset"
            name="asset"
            required
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: "Please Select Your Asset"
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (selectBalance / totalSupply < 0.3 || selectBalance == 0) {
                    return Promise.reject(new Error(t`Your asset holding should ≥30% to launch the mint activity.`));
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Select
              showSearch
              className="listing-select"
              optionLabelProp="label"
              size="large"
              filterOption={filterOption}
              placeholder="Search by Asset ID or Asset name"
              onChange={handleTokenChange}
            >
              {options}
            </Select>
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>{`Total Supply: ${totalSupply || "--"}; You current hold: ${
            selectBalance || selectBalance == 0 ? selectBalance : "--"
          }`}</div>
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
                message: "Please input the amount of asset you want to put in mint pool"
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value) {

                    if (!Number(value)) {
                      return Promise.reject(new Error(t`Invalid input format.`));
                    }
                    if(Number(value) > selectBalance || selectBalance == 0 || !selectBalance) {
                      return Promise.reject(new Error(t`Insufficient balance.`));
                    }
                    if (value / totalSupply < 0.05 || !value) {
                      return Promise.reject(new Error(t`Maximum Mint Amount should at least 5% of total supply.`));
                    }
                    return Promise.resolve();
                  } else {
                    if (Number(value) == 0) {
                      return Promise.reject(
                        new Error(t`Please input the amount of asset you want to put in mint pool.`)
                      );
                    } else {
                      return Promise.reject(new Error(t`Invalid input format.`));
                    }
                  }
                }
              })
            ]}
          >
            <Input placeholder="Please input the Maximum Mint Amount" suffix={maxSuffix} onChange={amountChange} />
          </Form.Item>
          <div>Percentage：{percentage ? `${percentage}%` : "--"}</div>
          <div style={{ marginBottom: "20px" }}>
            Required at least 5% of total supply put in mint pool to lanuch a mint activity
          </div>
          <Form.Item
            label="Number of Mints (10~5000)"
            required
            name="number"
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: "   Please setup the Number of Mints, every Single Mint Amount is equal."
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value) {
                    if (!Number(value)) {
                      return Promise.reject(new Error(t`Invalid input format.`));
                    }
                    if (Number(value) < 10 || Number(value) > 5000) {
                      return Promise.reject(new Error(t`Number of Mints should be 10~5000.`));
                    }
                    const amount = form.getFieldValue("amount");
                    if (Number(value) && Number(amount) && !Number.isInteger(Number(amount) / Number(value))) {
                      return Promise.reject(new Error(`Single Mint Amount must be an integer`));
                    }
                    return Promise.resolve();
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input
              size="large"
              onChange={numberChange}
              placeholder="Please setup the Number of Mints, every Single Mint Amount is equal."
            />
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>{`Single Mint Amount ${
            singleMint || "--"
          } (Maximum Mint Amount / Numberof Mints)`}</div>
          <Form.Item
            label="Maximum Mints Per Address"
            required
            name="addressMints"
            rules={[
              {
                required: true,
                message: "Please setup the Maximum Mints limit for each address"
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
            <Input
              size="large"
              placeholder="Please setup the Maximum Mints limit for each address"
              onChange={addressMintsChange}
            />
          </Form.Item>
          <Form.Item
            label="Mint Fee/Mint (≥0, Mint fee will send to your NostrAssets account after every mint)"
            name="fee"
            style={{ marginBottom: 0 }}
            required
            rules={[
              {
                required: true,
                message: "Please input the Mint Fee"
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
            <Input
              size="large"
              onChange={mintFeeChange}
              placeholder="   eg. setup 100, every mint will pay 100 sats to you"
            />
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>{fee} sats/Mint</div>
          {/* <Row className="nostr-activity-form-servicefee">
            <Col span={12}> */}
          {/* <Form.Item label={memoLabelServiceFee}>
            <span className="nostr-activity-form-servicefee__value">1200 sats</span>
          </Form.Item> */}
          <div>
            {memoLabelServiceFee}
            <span className="nostr-activity-form-servicefee__value" style={{ marginLeft: "20px" }}>
              {`${MINT_SERVICE_FEE} sats`}{" "}
              <span className="color-dark f12">{`(Balance: ${getTokenBalance(QUOTE_ASSET)} sats)`}</span>
            </span>
          </div>
          {/* </Col>
          </Row> */}
          <Row justify="center" className="submit">
            {}
            {/* <CheckNostrButton>
              <Button type="primary" size="middle" htmlType="submit">
                Launch Your Mint Activity
              </Button>
            </CheckNostrButton> */}
            {memoButton}
          </Row>
        </Form>
        <Modal
          title="Confirm"
          className="base-modal"
          open={isModalOpen}
          footer={memoModalButton}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div className="asset-confirm-content">
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Asset:</div>
              <div className="asset-confirm-item-value">{selectToken?.name}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Maximum Mint Amount:</div>
              <div className="asset-confirm-item-value">{amount ? `${numberWithCommas(amount)} ${selectToken?.name?.toLowerCase()}` : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Percentage:</div>
              <div className="asset-confirm-item-value">{percentage ? `${percentage}%` : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Number of Mints:</div>
              <div className="asset-confirm-item-value">{numberMint ? numberWithCommas(numberMint) : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Single Mint Amount:</div>
              <div className="asset-confirm-item-value">{singleMint ? `${numberWithCommas(singleMint)} ${selectToken?.name?.toLowerCase()}` : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Maximum Mints Per Address:</div>
              <div className="asset-confirm-item-value">{addressMints ? numberWithCommas(addressMints) : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Mint Fee/Mint:</div>
              <div className="asset-confirm-item-value">{fee ? `${numberWithCommas(fee)} ${QUOTE_ASSET?.toLowerCase()}` : "--"}</div>
            </div>
            <div className="asset-confirm-item">
              <div className="asset-confirm-item-label">Service Fee:</div>
              <div className="asset-confirm-item-value">
                {MINT_SERVICE_FEE ? `${numberWithCommas(MINT_SERVICE_FEE)} ${QUOTE_ASSET?.toLowerCase()}` : "--"}
              </div>
            </div>
            <div className="asset-confirm-item mt20 color-green-light f12">
              Once the mint activity is initiated, the settings cannot be modified. Please ensure that everything is
              correct before submitting.
            </div>
          </div>
        </Modal>
        <Modal
          title=""
          className="base-modal"
          open={isSuccessModalOpen}
          footer={
            <Button type="primary" style={{ width: "140px", marginTop: "20px" }} onClick={handleSuccessCancel}>
              OK
            </Button>
          }
          onOk={handleSuccessOk}
          onCancel={handleSuccessCancel}
        >
          <div>
            <div className="tc">
              <CheckCircleOutlined style={{ fontSize: "30px", color: "#38c89d", verticalAlign: "middle" }} />
              <span className="f18 b" style={{ marginLeft: "8px" }}>
                Success!
              </span>
            </div>
            <div className="mt20">
              You've successfully launched the mint activity. Visit the Mint Assets page to monitor the minting process
              of your asset.
            </div>
            <div className="mt20">
              Additionally, you should share your mint activity to increase its visibility and enhance the chances of
              your asset being minted.
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
