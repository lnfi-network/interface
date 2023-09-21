import { Form, Select, Input, Col, Row, Button, Radio, Spin, message, notification, Empty, Tooltip } from "antd";
import { useMemo, useCallback, useState, useEffect } from "react";
import "./DepositForm.scss";
import { useSelector, useDispatch } from "react-redux";
import { ConnectWalletWithOnlyDeposit } from "components/Common/ConnectWallet";
import EllipsisMiddle from "components/EllipsisMiddle";
import { isInTokenPocket } from "lib/utils/userAgent";
import { setConnectPlat, setSelectedTokenPlatForm } from "store/reducer/userReducer";
import { BTCEXPORE_PREFIX } from "config/constants";
import Inscription from "./Inscription";
import { t } from "@lingui/macro";
import { utils } from "ethers";
import { useNetwork } from "wagmi";
import { TOKEN_LIST } from "config/constants";
import { useERC20Deposit, useBRC20Deposit } from "hooks/useNostrDeposit";
import { numberWithCommas } from "lib/numbers";
import { getQueryVariable } from "lib/url";
import { nip19 } from "nostr-tools";
import { produce } from "immer";
import { useSize, useThrottleFn } from "ahooks";
import BRC20Fee from "./BRC20Fee";
import { waitForTransaction } from "@wagmi/core";
import { useParams } from "react-router-dom";
import LightningFormItems from "./LightningFormItems";
import TaprootFormItems from "./TaprootFormItems";
import AlertTip from "components/AlertTip";
const layout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 17
  }
};
const MAPPLATFORM = {
  ETH: "ERC20",
  BTC: "BRC20"
};
const transferBRCTo = process.env.REACT_APP_BTC_SEND_TO_ADDR;
const queryNostrAddress = getQueryVariable("nostrAddress");
function DepositForm() {
  const [form] = Form.useForm();
  const { chain } = useNetwork();
  const { width } = useSize(document.querySelector("body"));
  const [messageApi, contextHolder] = message.useMessage();
  const [notifiApi, notifiContextHolder] = notification.useNotification();
  const [selectedToken, setSelectedToken] = useState(null);
  const dispatch = useDispatch();
  const Option = Select.Option;
  const params = useParams();

  const { account, nostrAccount, selectedTokenPlatform, connectPlat, npubNostrAccount } = useSelector(
    ({ user }) => user
  );
  const {
    handleDepositERC20,
    handleApproveAsync,
    getAllowanceValue,
    erc20Balance,
    decimals,
    symbol,
    currencyContractAddress,
    PROXY_ADDR,
    allowanceValue
  } = useERC20Deposit(account);
  const [btnLoading, setBtnLoading] = useState(false);
  const { getInscriptions, handleSendInscription } = useBRC20Deposit();
  const [loadingBRC20, setLoadingBRC20] = useState(false);
  const [inscriptions, setInscriptions] = useState([]);
  const [checkedInscriptionValue, setCheckedInscriptionValue] = useState("");
  const { tokenList } = useSelector(({ market }) => market);
  const [feeRate, setFeeRate] = useState("Fast");
  const [fee, setFee] = useState();
  const [erc20Amount, setErc20Amount] = useState(0);
  const [routeParams, setRouteParams] = useState(params);

  const memoAccount = useMemo(() => {
    if (account) {
      if (account && selectedTokenPlatform === connectPlat) {
        return account;
      }
      return "--";
    } else {
      return "--";
    }
  }, [account, connectPlat, selectedTokenPlatform]);
  const memoCurrentPlatformTokenList = useMemo(() => {
    const filterdTokenList = tokenList.filter((tokenItem) => tokenItem.chainName === selectedTokenPlatform);
    return [...filterdTokenList];
  }, [selectedTokenPlatform, tokenList]);

  const hasErc20Token = useMemo(() => {
    return tokenList.find((token) => token.assetType === "ERC20");
  }, [tokenList]);
  const options = useMemo(() => {
    return memoCurrentPlatformTokenList.map((tokenItem) => (
      <Option value={tokenItem.name} key={tokenItem.id}>
        {tokenItem.name}
      </Option>
    ));
  }, [memoCurrentPlatformTokenList]);

  const balance = useMemo(() => {
    if (selectedTokenPlatform === "ETH") {
      return Number(erc20Balance) > 0 ? (
        <span className="deposit-balance-value">
          Available {numberWithCommas(erc20Balance)}
          <span> {symbol}</span>
        </span>
      ) : account && connectPlat === selectedTokenPlatform ? (
        <span className="deposit-balance-value">
          Available 0<span> {symbol}</span>
        </span>
      ) : (
        <span className="deposit-balance-value">
          Available --<span> {symbol}</span>
        </span>
      );
    }
  }, [selectedTokenPlatform, erc20Balance, symbol, account, connectPlat]);

  const getAllInscriptions = useCallback(async () => {
    let pageSize = 100;
    let pageIndex = 0;
    let allInscriptions = [];
    const getInscriptionsByPage = async () => {
      const ret = await getInscriptions(pageIndex * pageSize, pageSize);
      if (ret && ret?.list.length > 0) {
        allInscriptions = allInscriptions.concat([...ret.list]);
      }
      const total = ret.total;
      const maxPage = Math.round(total / pageSize);
      pageIndex++;
      //
      while (pageIndex < maxPage) {
        await getInscriptionsByPage();
      }
    };
    await getInscriptionsByPage();

    return allInscriptions;
  }, [getInscriptions]);
  const handleGetInsciptions = useCallback(async () => {
    setLoadingBRC20(true);
    const allInscriptions =
      (await getAllInscriptions().catch((e) => {
        setLoadingBRC20(false);
      })) || [];
    const requstInscriptinContent = allInscriptions.map(async (inscription) => {
      const promiseRet = await fetch(inscription.content);
      const parseRet = await promiseRet.json().catch((e) => {
        return {};
      });
      return { ...inscription, ...parseRet, checked: false };
    });

    const inscriptionsContent = await Promise.all(requstInscriptinContent);
    setLoadingBRC20(false);
    const values = form.getFieldsValue(true);
    const { token } = values;

    if (allInscriptions.length > 0) {
      const currentList = inscriptionsContent.filter((item) => item.tick.toLowerCase() === token.toLowerCase());
      setInscriptions([...currentList]);
    } else {
      setInscriptions([]);
    }
  }, [form, getAllInscriptions]);
  const handlePlatformChange = useCallback(
    async ({ target: { value } }) => {
      /* if (value === "Taproot") {
        messageApi.warning("Coming soon.");
        return;
      } */
      dispatch(setSelectedTokenPlatForm(value));
      /* form.setFieldValue("token", ""); */

      if (params.platform) {
        if (params.platform === value) {
          setRouteParams(params);
        } else {
          setRouteParams(null);
        }
      }
      //const nostrAddress = form.getFieldValue("nostrAddress");
      /* if (nostrAddress) {
        handleQueryIsBindWallet(nostrAddress);
      } */
    },
    [dispatch, params]
  );
  const handleTokenChange = useCallback(
    async (value) => {
      try {
        setCheckedInscriptionValue("");
        const selectedToken = TOKEN_LIST.find((tokenItem) => tokenItem.value === value);
        if (selectedToken) {
          setSelectedToken(selectedToken);
        }
        if (selectedTokenPlatform === "BTC" && selectedTokenPlatform === connectPlat && account) {
          handleGetInsciptions();
        }
      } catch (e) {
        messageApi.error({
          content: e.message
        });
      }
    },
    [account, connectPlat, handleGetInsciptions, messageApi, selectedTokenPlatform]
  );
  //
  const { run: handleAmountOnChange } = useThrottleFn(
    ({ target: { value } }) => {
      if (!Number.isNaN(value) && value) {
        let splitValue = value.split(".");
        if (splitValue[1]?.length > 4) {
          splitValue[1] = splitValue[1].substring(0, 4);
        }
        const formatValue = splitValue.join(".");
        setErc20Amount(Number(formatValue));
        form.setFieldValue("amount", formatValue);
        getAllowanceValue();
      }
    },
    {
      wait: 500
    }
  );
  const handleTranserERC20 = useCallback(async () => {
    try {
      setBtnLoading(true);
      const values = form.getFieldsValue(true);
      await form.validateFields();
      /* if (!isBindNostrAddress) {
        await handleBindNostr();
      } */
      const { amount, nostrAddress } = values;
      if (Number(erc20Balance) < Number(amount)) {
        throw new Error("Insufficient Balance");
      }
      const ret = await handleDepositERC20({
        args: [currencyContractAddress, utils.parseUnits(amount, decimals).toString(), nostrAddress]
      });
      const hash = ret.hash;
      notifiApi.success({
        message: `Transaction Submitted`,
        description: (
          <a
            href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >{`View on ${chain?.blockExplorers?.default?.name}`}</a>
        )
      });
    } catch (e) {
      e.message &&
        messageApi.error({
          content: e.message
        });
    } finally {
      setBtnLoading(false);
    }
  }, [
    chain?.blockExplorers?.default?.name,
    chain?.blockExplorers?.default?.url,
    currencyContractAddress,
    decimals,
    erc20Balance,
    form,
    handleDepositERC20,
    messageApi,
    notifiApi
  ]);
  const handleApproveERC20 = useCallback(async () => {
    //todo approve
    const willApproveAmount = utils.parseUnits("" + erc20Amount, decimals).toString();
    setBtnLoading(true);
    try {
      const ret = await handleApproveAsync({
        args: [PROXY_ADDR, willApproveAmount]
      });

      if (ret?.hash) {
        const waitForRet = await waitForTransaction({
          hash: ret.hash,
          confirmations: 1
        });
        if (waitForRet?.status === "success") {
          notifiApi.success({
            message: `Approve Success`,
            description: (
              <a
                href={`${chain?.blockExplorers?.default?.url}/tx/${ret.hash}`}
                target="_blank"
                rel="noreferrer"
              >{`View on ${chain?.blockExplorers?.default?.name}`}</a>
            )
          });
        }
        getAllowanceValue();
      }
    } catch (e) {
    } finally {
      setBtnLoading(false);
    }
  }, [
    PROXY_ADDR,
    chain?.blockExplorers?.default?.name,
    chain?.blockExplorers?.default?.url,
    decimals,
    erc20Amount,
    getAllowanceValue,
    handleApproveAsync,
    notifiApi
  ]);
  const handleTranserBRC20 = useCallback(async () => {
    try {
      setBtnLoading(true);
      const checkedInscriptionId = checkedInscriptionValue;

      const options = fee
        ? {
            feeRate: fee
          }
        : {};

      const hash = await handleSendInscription(transferBRCTo, checkedInscriptionId, options);
      notifiApi.success({
        message: `Transaction Submitted`,
        description: <a href={`${BTCEXPORE_PREFIX}/${hash}`} target="_blank" rel="noreferrer">{`View on BTC.com`}</a>
      });
      setCheckedInscriptionValue("");
      handleGetInsciptions();
    } catch (e) {
      messageApi.error({
        content: e.message
      });
    } finally {
      setBtnLoading(false);
    }
  }, [checkedInscriptionValue, fee, handleGetInsciptions, handleSendInscription, messageApi, notifiApi]);
  const onInscriptionChange = useCallback((inscriptionId, toChecked) => {
    setInscriptions(
      produce((draft) => {
        draft.forEach((item) => {
          if (item.inscriptionId === inscriptionId) {
            item.checked = toChecked;
            if (toChecked) {
              setCheckedInscriptionValue(inscriptionId);
            } else {
              setCheckedInscriptionValue("");
            }
          } else {
            item.checked = false;
          }
        });
      })
    );
  }, []);

  const memoWalletAddressLabel = useMemo(() => {
    return (
      <Tooltip
        title={`
    
The deposit will be deducted from the balance of you connected wallet account and will be credited to your Nostr account.`}
        trigger="hover"
      >
        <span>From Wallet address</span>
      </Tooltip>
    );
  }, []);

  const memoSwitchWalletBtn = useMemo(() => {
    if (connectPlat !== selectedTokenPlatform && account) {
      return (
        <>
          <span style={{ display: "inline-block" }}>
            <ConnectWalletWithOnlyDeposit
              connectType="switch"
              btnText={isInTokenPocket() ? t`Connect wallet` : `Switch To ${MAPPLATFORM[selectedTokenPlatform]} Wallet`}
            />
          </span>
        </>
      );
    }
    return null;
  }, [account, connectPlat, selectedTokenPlatform]);
  const memoSubmitButton = useMemo(() => {
    if (selectedTokenPlatform === "Lightning") {
      return null;
      /*  return nostrAccount ? (
        <Button
          type="primary"
          size="large"
          loading={btnLoading}
          disabled={!nostrAccount}
          onClick={}
          style={{ width: "160px" }}
        >
          Create Invoice
        </Button>
      ) : (
        <ConnectNostr />
      ); */
    }
    if (account) {
      if (connectPlat !== selectedTokenPlatform && account) {
        return (
          <>
            <Col span={24} className="deposit-form-switch__tip">
              {`You selected an ${MAPPLATFORM[selectedTokenPlatform]} token to deposit, please click to switch your
              wallet connect from ${MAPPLATFORM[connectPlat]} to ${MAPPLATFORM[selectedTokenPlatform]}.`}
            </Col>
            <Col span={24}>
              <ConnectWalletWithOnlyDeposit
                connectType="switch"
                btnText={
                  isInTokenPocket() ? t`Connect wallet` : `Switch To ${MAPPLATFORM[selectedTokenPlatform]} Wallet`
                }
              />
            </Col>
          </>
        );
      }
      if (selectedTokenPlatform === "ETH") {
        if (
          allowanceValue !== undefined &&
          decimals &&
          Number(utils.formatUnits("" + allowanceValue, decimals)) < erc20Amount
        ) {
          return (
            <>
              <Button
                type="primary"
                size="large"
                disabled={!account || connectPlat !== selectedTokenPlatform}
                onClick={handleApproveERC20}
                loading={btnLoading}
                style={{ width: "160px" }}
              >
                Approve
              </Button>
            </>
          );
        }
        return (
          <>
            <Button
              type="primary"
              size="large"
              disabled={!account || connectPlat !== selectedTokenPlatform}
              onClick={handleTranserERC20}
              loading={btnLoading}
              style={{ width: "160px" }}
            >
              Deposit
            </Button>
          </>
        );
      } else if (selectedTokenPlatform === "BTC") {
        return (
          <>
            <Button
              type="primary"
              size="large"
              loading={btnLoading}
              disabled={
                isInTokenPocket() || !checkedInscriptionValue || !account || connectPlat !== selectedTokenPlatform
              }
              onClick={handleTranserBRC20}
              style={{ width: "160px" }}
            >
              Deposit
            </Button>
          </>
        );
      }
    } else {
      return <ConnectWalletWithOnlyDeposit />;
    }
  }, [
    account,
    connectPlat,
    selectedTokenPlatform,
    allowanceValue,
    decimals,
    erc20Amount,
    handleTranserERC20,
    btnLoading,
    handleApproveERC20,
    checkedInscriptionValue,
    handleTranserBRC20
  ]);
  const onChangeFeeRate = useCallback((value) => {
    setFeeRate(value);
  }, []);
  useEffect(() => {
    if (nostrAccount) {
      const npubNostrAccount = nip19.npubEncode(nostrAccount);
      form.setFieldValue("nostrAddress", npubNostrAccount);
      // handleQueryIsBindWallet(npubNostrAccount);
    }
    if (queryNostrAddress && /npub\w{59}/.test(queryNostrAddress)) {
      form.setFieldValue("nostrAddress", queryNostrAddress);
      // handleQueryIsBindWallet(queryNostrAddress);
    }
  }, [form, nostrAccount]);

  useEffect(() => {
    if (memoCurrentPlatformTokenList.length > 0) {
      const tokenFirst = memoCurrentPlatformTokenList[0];
      if (!routeParams?.symbol) {
        setSelectedToken(tokenFirst?.name);
        form.setFieldValue("token", tokenFirst?.name);
      } else {
        setSelectedToken(routeParams.symbol);
        form.setFieldValue("token", routeParams.symbol);
      }
      if (connectPlat === "BTC" && selectedTokenPlatform === "BTC") {
        handleGetInsciptions();
      }
    }
  }, [
    connectPlat,
    form,
    handleGetInsciptions,
    memoCurrentPlatformTokenList,
    routeParams?.symbol,
    selectedTokenPlatform
  ]);

  useEffect(() => {
    if (routeParams?.platform) {
      dispatch(setSelectedTokenPlatForm(routeParams.platform));
      dispatch(setConnectPlat(routeParams.platform));
      form.setFieldValue("platform", routeParams.platform);
    } else {
      form.setFieldValue("platform", selectedTokenPlatform);
    }
  }, [connectPlat, dispatch, form, routeParams?.platform, selectedTokenPlatform]);
  return (
    <>
      {contextHolder}
      {notifiContextHolder}
      <AlertTip
        id="depositAlertTip"
        description="Deposit assets from your Lightning wallet, Taproot wallet or other Nostr account to your currently connected Nostr account. The Lightning Network is currently using real assets, while Taproot is temporarily using test assets."
      />
      <div className="deposit-form">
        <Form
          {...layout}
          form={form}
          requiredMark={false}
          name="depositForm"
          autoComplete="off"
          initialValues={{
            platform: selectedTokenPlatform || "ETH",
            amount: "0.00"
          }}
          style={{
            maxWidth: "670px",
            width: "100%"
          }}
        >
          <Form.Item
            name="platform"
            label="Select Network"
            tooltip="We currently support receiving assets from Lightning、ERC20 and Taproot network, please select the network of the token you want to receive."
            rules={[
              {
                required: true
              }
            ]}
          >
            <Radio.Group value={selectedTokenPlatform || "BTC"} onChange={handlePlatformChange}>
              <Radio.Button className="network-selector-btn" value="Lightning">
                Lightning
              </Radio.Button>

              {/* <Radio.Button className="network-selector-btn" value="BTC">
                BRC20
              </Radio.Button> */}
              <Radio.Button className="network-selector-btn" value="Taproot">
                Taproot
              </Radio.Button>
              {hasErc20Token && (
                <Radio.Button className="network-selector-btn" value="ETH">
                  ERC20
                </Radio.Button>
              )}
            </Radio.Group>
          </Form.Item>
          {(selectedTokenPlatform === "ETH" || selectedTokenPlatform === "BTC") && (
            <>
              <Form.Item name="walletAddress" label={memoWalletAddressLabel}>
                {width > 768 ? (
                  <Row align="middle">
                    {memoAccount} {memoSwitchWalletBtn}
                  </Row>
                ) : (
                  <>
                    {memoAccount && memoAccount != "--" ? (
                      <EllipsisMiddle suffixCount={10}>{memoAccount}</EllipsisMiddle>
                    ) : (
                      "--"
                    )}
                    {memoSwitchWalletBtn}
                  </>
                )}
              </Form.Item>
              <Form.Item
                name="nostrAddress"
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
              <Form.Item
                label="Token"
                name="token"
                rules={[
                  {
                    required: true,
                    message: "Please select receive token"
                  }
                ]}
              >
                <Select
                  onChange={handleTokenChange}
                  placeholder="Please select the token which you want to receive."
                  allowClear={false}
                  size="large"
                  style={{ maxWidth: "460px" }}
                >
                  {options}
                </Select>
              </Form.Item>
            </>
          )}

          {selectedTokenPlatform === "ETH" && (
            <Form.Item
              name="amount"
              label="Amount"
              extra={balance}
              rules={[
                {
                  required: true,
                  message: "Please input receive amount"
                },
                () => ({
                  validator(_, value) {
                    if (value) {
                      if (Number.isNaN(Number(value)) || Number(value) <= 0) {
                        return Promise.reject(new Error(t`Please input receive amount.`));
                      }
                      if (Number(value) > Number(erc20Balance)) {
                        return Promise.reject(new Error(t`Available Balance is not enough.`));
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input
                placeholder="Please input your amount"
                size="large"
                onChange={handleAmountOnChange}
                style={{ maxWidth: "460px" }}
              />
            </Form.Item>
          )}

          {selectedTokenPlatform === "BTC" && (
            <div className="deposit-inscriptions">
              <div className="deposit-inscriptions-label">Select inscription you want to deposit</div>
              <Spin spinning={loadingBRC20}>
                <div className="deposit-inscriptions-list">
                  {inscriptions.length > 0 ? (
                    inscriptions.map((inscription) => (
                      <Inscription
                        key={inscription.inscriptionId}
                        inscription={inscription}
                        onInscriptionChange={onInscriptionChange}
                      />
                    ))
                  ) : (
                    <Empty className="deposit-inscriptions-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>
              </Spin>
            </div>
          )}

          {connectPlat === "BTC" && selectedTokenPlatform === "BTC" && account && (
            <>
              <Form.Item label="Fee" wrapperCol={18}>
                <BRC20Fee feeRate={feeRate} setFee={setFee} setFeeRate={onChangeFeeRate} ready={true} />
              </Form.Item>
            </>
          )}
          {connectPlat === "BTC" && selectedTokenPlatform === "BTC" && feeRate === "Custom" && (
            <Form.Item
              name="fee"
              label=" "
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (Number.isNaN(Number(value)) || Number(value) < 0) {
                        return Promise.reject(new Error(t`Please enter the correct field.`));
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input
                suffix="sat/vb"
                size="large"
                style={{ maxWidth: "100px" }}
                onChange={({ target: { value } }) => {
                  setFee(value);
                }}
              />
            </Form.Item>
          )}
          {(selectedTokenPlatform === "ETH" || selectedTokenPlatform === "BTC") && (
            <Row justify="center" className="mb20 fixed-btn">
              {memoSubmitButton}
            </Row>
          )}

          {selectedTokenPlatform === "Lightning" && (
            <LightningFormItems
              form={form}
              nostrAccount={npubNostrAccount}
              messageApi={messageApi}
              notifiApi={notifiApi}
            />
          )}
          {selectedTokenPlatform === "Taproot" && (
            <TaprootFormItems
              form={form}
              nostrAccount={npubNostrAccount}
              messageApi={messageApi}
              notifiApi={notifiApi}
            />
          )}
        </Form>
      </div>
    </>
  );
}
export default DepositForm;
