import {
  Form,
  Select,
  Input,
  Col,
  Row,
  Button,
  Radio,
  Spin,
  message,
  notification,
  Empty,
  Modal,
  Tooltip,
  Popover,
  Space
} from "antd";
import { useMemo, memo, useCallback, useState, useEffect } from "react";
import "./WithdrawForm.scss";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedTokenPlatForm, setConnectPlat } from "store/reducer/userReducer";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import { ContainerOutlined } from "@ant-design/icons";
import { useSize, useThrottleFn } from "ahooks";
import * as Lockr from "lockr";
import { useParams } from "react-router-dom";
import { useWithdraw, useQueryBalance } from "hooks/useNostrMarket";
import LightningFormItems from "./LightningFormItems";
import TaprootFormItems from "./TaprootFormItems";

function WithdrawForm() {
  const { width } = useSize(document.querySelector("body"));
  const [form] = Form.useForm();
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [notifiApi, notifiContextHolder] = notification.useNotification();
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const dispatch = useDispatch();
  const Option = Select.Option;
  const { nostrAccount, npubNostrAccount, selectedTokenPlatform, connectPlat, balanceList } = useSelector(
    ({ user }) => user
  );
  const [historyAddress, setHistoryAddress] = useState([]);
  const { tokenList } = useSelector(({ market }) => market);
  const [btnLoading, setBtnLoading] = useState(false);
  const { handleWithdrawAsync } = useWithdraw();
  const { handleQueryBalance } = useQueryBalance();
  const layout = useMemo(() => {
    return selectedTokenPlatform === "Lightning" || selectedTokenPlatform === "Taproot"
      ? {
          labelCol: {
            span: 8
          },
          wrapperCol: {
            span: 16
          }
        }
      : {
          labelCol: {
            span: 5
          },
          wrapperCol: {
            span: 19
          }
        };
  }, [selectedTokenPlatform]);
  const memoCurrentPlatformTokenList = useMemo(() => {
    const filterdTokenList = tokenList.filter((tokenItem) => tokenItem.chainName === selectedTokenPlatform);

    return [...filterdTokenList];
  }, [selectedTokenPlatform, tokenList]);
  const options = useMemo(() => {
    return memoCurrentPlatformTokenList.map((tokenItem) => (
      <Option value={tokenItem.name} key={tokenItem.id}>
        {tokenItem.name}
      </Option>
    ));
  }, [memoCurrentPlatformTokenList]);

  const balance = useMemo(() => {
    return selectedToken && balanceList[selectedToken] ? balanceList[selectedToken]?.balanceShow : 0.0;
  }, [balanceList, selectedToken]);

  const satsBalance = useMemo(() => {
    return balanceList["SATS"] ? balanceList["SATS"]?.balanceShow : 0.0;
  }, [balanceList]);

  const tapRootBalance = useMemo(() => {
    return balanceList["TAP"] ? balanceList["TAP"]?.balanceShow : 0.0;
  }, [balanceList]);

  const networkFee = 0;
  const recieveAmount = useMemo(() => {
    return limitDecimals(Number(withdrawAmount - networkFee), 4, true);
  }, [withdrawAmount]);

  const symbol = useMemo(() => {
    return selectedToken;
  }, [selectedToken]);

  const handlePlatformChange = useCallback(
    async ({ target: { value } }) => {
      form.setFieldValue("walletAddress", "");
      if (nostrAccount) {
        setHistoryAddress(Lockr.get(`${nostrAccount}-${value}-addresses`) || []);
      }

      dispatch(setSelectedTokenPlatForm(value));
    },
    [dispatch, form, nostrAccount]
  );

  const handleTokenChange = useCallback(
    async (value) => {
      try {
        setSelectedToken(value);
      } catch (e) {
        messageApi.error({
          content: e.message
        });
      }
    },
    [messageApi]
  );

  const { run: handleAmountOnChange } = useThrottleFn(
    ({ target: { value } }) => {
      if (Number.isNaN(Number(value)) && value) {
        form.setFieldValue("amount", "");
        setWithdrawAmount(0);
      }
      if (!Number.isNaN(Number(value)) && value) {
        let splitValue = value.split(".");
        if (splitValue[1]?.length > 4) {
          splitValue[1] = splitValue[1].substring(0, 4);
        }
        const formatValue = splitValue.join(".");
        setWithdrawAmount(formatValue);
        form.setFieldValue("amount", formatValue);
      }
    },
    {
      wait: 200
    }
  );

  const memoWithdrawBalance = useMemo(() => {
    return (
      <span className="withdraw-amount-balance">
        {symbol} balance: {balance}
      </span>
    );
  }, [balance, symbol]);
  const onSetMaxWithdrawAmount = useCallback(() => {
    const maxWithdrawAmount = balance;
    if (maxWithdrawAmount) {
      form.setFieldsValue({
        amount: maxWithdrawAmount
      });
      setWithdrawAmount(maxWithdrawAmount);
    }
  }, [balance, form]);
  const onSetCurrentAddressFromStorage = useCallback(
    (address) => {
      if (address) {
        form.setFieldValue("walletAddress", address);
        setSelectedAddress(address);
      }
    },
    [form]
  );

  const memoHistoryWalletAddresses = useMemo(() => {
    return (
      <>
        <Space direction="vertical">
          {historyAddress.map((address, index) => (
            <Radio
              checked={address === selectedAddress}
              key={`radio-${address}`}
              value={address}
              onClick={() => {
                onSetCurrentAddressFromStorage(address);
              }}
            >
              {address}
            </Radio>
          ))}
        </Space>
      </>
    );
  }, [historyAddress, onSetCurrentAddressFromStorage, selectedAddress]);
  const suffixMoreAddress = useMemo(() => {
    return (
      <>
        {historyAddress.length > 0 ? (
          <span className="withdraw-amount-more-address">
            <Popover content={memoHistoryWalletAddresses} title="" trigger="click">
              <ContainerOutlined />
            </Popover>
          </span>
        ) : null}
      </>
    );
  }, [historyAddress.length, memoHistoryWalletAddresses]);
  const withdrawAmountSuffix = useMemo(() => {
    return (
      <span className="withdraw-amount-suffix">
        <Button type="link" onClick={onSetMaxWithdrawAmount}>
          Max
        </Button>
        |<span className="withdraw-amount-suffix__symbol">{symbol}</span>
      </span>
    );
  }, [onSetMaxWithdrawAmount, symbol]);

  const onFinish = useCallback(
    async (values) => {
      const { walletAddress } = values;
      if (walletAddress) {
        const storegedWalletAddressesSet = new Set(
          Lockr.get(`${nostrAccount}-${selectedTokenPlatform}-addresses`) || []
        );
        storegedWalletAddressesSet.add(walletAddress);
        Lockr.set(`${nostrAccount}-${selectedTokenPlatform}-addresses`, [...storegedWalletAddressesSet]);
        setHistoryAddress([...storegedWalletAddressesSet]);
      }
      try {
        setBtnLoading(true);
        const { amount, token, walletAddress } = values;
        const retWithdraw = await handleWithdrawAsync(amount, token, walletAddress);
        if (!retWithdraw.code == 0) {
          messageApi.error({
            content: retWithdraw.msg
          });
          return;
        }
        messageApi.success({
          content: "Submit successully."
        });
      } catch (err) {
        messageApi.error({
          content: err.message
        });
      } finally {
        setBtnLoading(false);
        // refresh balance
        npubNostrAccount && handleQueryBalance(npubNostrAccount);
      }
    },
    [handleQueryBalance, handleWithdrawAsync, messageApi, nostrAccount, npubNostrAccount, selectedTokenPlatform]
  );
  useEffect(() => {
    if (params.platform) {
      dispatch(setSelectedTokenPlatForm(params.platform));
      dispatch(setConnectPlat(params.platform));
      form.setFieldValue("platform", params.platform);
    }
  }, [connectPlat, dispatch, form, params.platform]);
  useEffect(() => {
    if (memoCurrentPlatformTokenList.length > 0) {
      const tokenFirst = memoCurrentPlatformTokenList[0];
      if (params?.symbol && selectedTokenPlatform === "BTC") {
        setSelectedToken(params.symbol);
        form.setFieldValue("token", params.symbol);
      } else {
        setSelectedToken(tokenFirst?.name);
        form.setFieldValue("token", tokenFirst?.name);
      }
    }
  }, [connectPlat, form, memoCurrentPlatformTokenList, params?.symbol, selectedTokenPlatform]);

  useEffect(() => {
    if (nostrAccount) {
      setHistoryAddress(Lockr.get(`${nostrAccount}-${selectedTokenPlatform}-addresses`) || []);
    } else {
      setHistoryAddress([]);
    }
  }, [nostrAccount, selectedTokenPlatform]);

  return (
    <>
      {contextHolder}
      {notifiContextHolder}
      <div className="withdraw-form">
        <Form
          {...layout}
          form={form}
          requiredMark={false}
          name="WithdrawForm"
          autoComplete="off"
          onFinish={onFinish}
          initialValues={{
            platform: selectedTokenPlatform,
            amount: "0.00"
          }}
          style={{
            maxWidth: "650px",
            width: "100%"
          }}
        >
          <Form.Item
            name="platform"
            label="Select Network"
            tooltip="We currently support Lightning、ERC20 and Taproot network, please select the network of the token you want send asset to."
            rules={[
              {
                required: true
              }
            ]}
          >
            <Radio.Group value={selectedTokenPlatform || "Lightning"} onChange={handlePlatformChange}>
              <Radio.Button className="network-selector-btn" value="Lightning">
                Lightning
              </Radio.Button>

              {/* <Radio.Button className="network-selector-btn" value="BTC">
                BRC20
              </Radio.Button> */}
              <Radio.Button className="network-selector-btn" value="Taproot">
                Taproot
              </Radio.Button>
              <Radio.Button className="network-selector-btn" value="ETH">
                ERC20
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {(selectedTokenPlatform === "ETH" || selectedTokenPlatform === "BTC") && (
            <>
              <Form.Item
                label="Token"
                name="token"
                rules={[
                  {
                    required: true,
                    message: "Please select send token"
                  }
                ]}
              >
                <Select
                  onChange={handleTokenChange}
                  placeholder="Please select the token which you want to send."
                  allowClear={false}
                  size="large"
                  style={{ maxWidth: "460px" }}
                >
                  {options}
                </Select>
              </Form.Item>
              <Form.Item
                name="walletAddress"
                label="Wallet Address"
                tooltip="The asset will be deducted from the balance of you connected Nostr account and will be credited to your wallet account."
                rules={[
                  {
                    required: true
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value) {
                        if (selectedTokenPlatform === "ETH" && !/^0x\w{40}$/.test(value)) {
                          return Promise.reject(new Error(`Please input a valid wallet address.`));
                        }
                        if (selectedTokenPlatform === "BTC" && !/^bc\w{40}$/.test(value)) {
                          return Promise.reject(new Error(`Please input a valid wallet address.`));
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
                  style={{ maxWidth: "460px" }}
                  placeholder="Please input your wallet address."
                  suffix={suffixMoreAddress}
                  onBlur={({ target: { value } }) => {
                    setSelectedAddress(value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Send Amount" extra={memoWithdrawBalance}>
                <Row className="withdraw-amount-row">
                  <Col span={24}>
                    <Form.Item
                      name="amount"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Please Input Your Send Amount."
                        },
                        () => ({
                          validator(_, value) {
                            if (value) {
                              if (Number(value) > Number(balance) || Number(value) <= 0) {
                                return Promise.reject(new Error(`Please input a valid send amount.`));
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
                        style={{ maxWidth: "460px" }}
                        placeholder="Please input your send amount."
                        onChange={handleAmountOnChange}
                        suffix={withdrawAmountSuffix}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              {/* <Form.Item label="Network Fee" name="networkFee">
                <span>0.0 {symbol}</span>
              </Form.Item>

              <Form.Item label="Receive Amount" name="receiveAmount">
                <span>
                  {recieveAmount} {symbol}
                </span>
              </Form.Item> */}
              {width > 768 ? (
                <Form.Item
                  wrapperCol={{
                    offset: 7,
                    span: 17
                  }}
                >
                  <Button type="primary" size="large" htmlType="submit" loading={btnLoading}>
                    Send
                  </Button>
                </Form.Item>
              ) : (
                <Row justify="center" className="mb20 fixed-btn">
                  <Button type="primary" size="large" htmlType="submit" loading={btnLoading}>
                    Send
                  </Button>
                </Row>
              )}
            </>
          )}
          {selectedTokenPlatform === "Taproot" && (
            <TaprootFormItems
              nostrAccount={npubNostrAccount}
              form={form}
              handleQueryBalance={handleQueryBalance}
              balance={tapRootBalance}
              notifiApi={notifiApi}
              messageApi={messageApi}
            />
          )}
          {selectedTokenPlatform === "Lightning" && (
            <LightningFormItems
              nostrAccount={npubNostrAccount}
              form={form}
              handleQueryBalance={handleQueryBalance}
              balance={satsBalance}
              notifiApi={notifiApi}
              messageApi={messageApi}
            />
          )}
        </Form>
      </div>
    </>
  );
}
export default memo(WithdrawForm);
