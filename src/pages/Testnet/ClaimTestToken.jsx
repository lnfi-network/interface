import "./ClaimTestToken.scss";
// import Container from "components/Container";
import { RightOutlined } from "@ant-design/icons";
import { Space, Button, Form, Input, Modal, message } from "antd";
import { nip19 } from "nostr-tools";
import { useCallback, useState, useEffect, useMemo } from "react";
import ClaimDescription from "./comps/ClaimDescription";
import { useSelector, useDispatch } from "react-redux";
import { useSize } from "ahooks";
import { useBRC20Deposit } from "hooks/useNostrDeposit";
import {
  useQueryClaimTestnetTokens,
  useQueryBalance,
  useQueryClaimPoints,
} from "hooks/useNostrMarket";
import { isMobile } from "lib/utils/userAgent";

import {
  setNostrModalVisible,
  setWalletConnectModalVisible,
  setOnlyMobileSupportedVisible,
} from "store/reducer/modalReducer";
import { setSelectedTokenPlatForm } from "store/reducer/userReducer";
import { useHistory } from "react-router-dom";
// import {selectorGetSimpleTokens} from 'hooks/useSelectors'
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};
function ClaimModal({
  isClaimOpen,
  setIsClaimOpen,
  userTokens,
  setUserTokens,
}) {
  const [claimLoading, setClaimLoading] = useState(false);
  const { handleClaimPoints } = useQueryClaimPoints();
  const { account } = useSelector(({ user }) => user);
  const onCancel = useCallback(() => {
    setIsClaimOpen(false);
    setUserTokens([]);
  }, [setIsClaimOpen, setUserTokens]);
  const onClaimBonusPoints = useCallback(async () => {
    if (userTokens.length) {
      setClaimLoading(true);
      try {
        const points =
          userTokens.length * 10 > 100 ? 100 : userTokens.length * 10;
        const ret = await handleClaimPoints({ points, account });
        //
        if (ret.code == 0) {
          message.success("Claim successful");
          onCancel();
        } else {
          if (ret?.data?.indexOf("in this activity") > -1) {
            onCancel();
            Modal.error({
              okText: "OK",
              title: "Claim failed",
              wrapClassName: "ClaimTokenSuccessfullyModal",
              closable: true,
              mask: false,
              content: (
                <>
                  This BRC20 address has already claimed the bonus pioneer
                  points and is not eligible to claim again.
                </>
              ),
            });
            // message.error("This BRC20 address has already claimed the bonus pioneer points and is not eligible to claim again. ")
          } else {
            message.error(ret?.data || "Claim Fail");
          }
        }
        setClaimLoading(false);
      } catch (error) {
        setClaimLoading(false);
      }
    }
  }, [account, handleClaimPoints, onCancel, userTokens.length]);
  return (
    <>
      {isClaimOpen && (
        <Modal
          width={460}
          className="claim-bonus-modal"
          title={null}
          centered
          open={isClaimOpen}
          footer={
            <>
              <Button
                className="claim-bonus-modal__btn"
                loading={claimLoading}
                disabled={!userTokens.length}
                type="primary"
                onClick={onClaimBonusPoints}
              >
                Claim
              </Button>
            </>
          }
          closable={true}
          onCancel={onCancel}
        >
          <div className="claim-bonus-modal-content">
            <div className="claim-bonus-modal-account">
              Wallet Address：{account}
            </div>
            <div className="claim-bonus-modal-desc">
              You currently hold{" "}
              <span className="color-yellow">{userTokens.length}</span> token
              types. You are eligible to claim{" "}
              <span className="color-yellow">{userTokens.length * 10}</span>{" "}
              bonus pioneer points.
            </div>
            {userTokens.map((item) => {
              return <div>{item?.tick?.toUpperCase()}</div>;
            })}
            {/* <ConnectNostr /> */}
          </div>
        </Modal>
      )}
    </>
  );
}
export default function ClaimTestToken() {
  //
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [userTokens, setUserTokens] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const { handleQueryBalance } = useQueryBalance();
  const { npubNostrAccount, account } = useSelector(({ user }) => user);
  const { nostrModalVisible } = useSelector(({ modal }) => modal);
  const { width } = useSize(document.querySelector("body"));
  const { handleClaimTestnetTokens } = useQueryClaimTestnetTokens();

  const { getInscriptions } = useBRC20Deposit();
  /*   const {tokens}= useSelector(selectorGetSimpleTokens); */
  const receiveTokens = useMemo(() => {
    return [
      "ORDI",
      "OXBT",
      "VMPX",
      "BTOC",
      "MXRC",
      "ZBIT",
      "PEPE",
      "MEME",
      "SATS",
      "BANK",
      "$ORE",
      // "LVDI"
    ];
  }, []);
  const history = useHistory();
  const checkIsSupported = useCallback(() => {
    dispatch(setOnlyMobileSupportedVisible(true));
    return;
  }, [dispatch]);
  useEffect(() => {
    if (npubNostrAccount) {
      form.setFieldValue("nostrAddress", npubNostrAccount);
    } else {
      form.setFieldValue("nostrAddress", "");
    }
  }, [form, npubNostrAccount]);
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
    const allInscriptions =
      (await getAllInscriptions().catch((e) => {
        // setLoadingBRC20(false);
      })) || [];

    const requstInscriptinContent = allInscriptions.map(async (inscription) => {
      const promiseRet = await fetch(inscription.content);
      const parseRet = await promiseRet.json().catch((e) => {
        return {};
      });
      return { ...inscription, ...parseRet, checked: false };
    });

    const inscriptionsContent = await Promise.all(requstInscriptinContent);
    if (allInscriptions.length > 0) {
      const currentList = inscriptionsContent.reduce((accumulator, current) => {
        if (
          !accumulator.some(
            (item) => item?.tick?.toUpperCase() === current?.tick?.toUpperCase()
          ) &&
          receiveTokens.some(
            (k) => k?.toUpperCase() == current?.tick?.toUpperCase()
          )
        ) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

      return [...currentList];
    } else {
      return [];
      // setInscriptions([]);
    }
  }, [getAllInscriptions, receiveTokens]);
  const onClaimTestTokens = useCallback(async () => {
    if (!npubNostrAccount) {
      dispatch(setNostrModalVisible(true));
      return;
    }
    await form.validateFields();
    setTokenLoading(true);
    try {
      const ret = await handleClaimTestnetTokens();
      //
      if (ret.code == 0) {
        // message.success("Claim successful")
        Modal.success({
          okText: "OK",
          title: "Claim Successfully",
          wrapClassName: "ClaimTokenSuccessfullyModal",
          closable: true,
          mask: false,
          content: (
            <>
              <div>Please go to account to check balance.</div>
              {/* <div className="mt10">10000 USDT 、10000 ORDI</div>
              <div>10000 OXBT、10000 PEPE</div>
              <div>10000 BTOC、10000 VMPX</div>
              <div>10000 TAP</div> */}
            </>
          ),
          onOk: async () => {
            await handleQueryBalance(npubNostrAccount);
            history.push("/account");
          },
        });
      } else {
        message.error(ret?.data || "Claim Fail");
      }
      setTokenLoading(false);
    } catch (error) {
      setTokenLoading(false);
    }
  }, [
    dispatch,
    form,
    handleClaimTestnetTokens,
    handleQueryBalance,
    history,
    npubNostrAccount,
  ]);

  const onClaimBonusPoints = useCallback(async () => {
    if (isMobile()) {
      checkIsSupported();
      return;
    }

    if (!npubNostrAccount) {
      dispatch(setNostrModalVisible(true));
      return;
    }

    if (!account) {
      dispatch(setSelectedTokenPlatForm("BTC"));
      dispatch(setWalletConnectModalVisible(true));
      return;
    }

    await form.validateFields();
    setBonusLoading(true);
    try {
      const user_tokens = await handleGetInsciptions();

      setIsClaimOpen(true);
      setUserTokens(user_tokens);
      setBonusLoading(false);
    } catch (error) {
      setBonusLoading(false);
    }
  }, [
    account,
    checkIsSupported,
    dispatch,
    form,
    handleGetInsciptions,
    npubNostrAccount,
  ]);
  useEffect(() => {
    if (npubNostrAccount && nostrModalVisible) {
      dispatch(setNostrModalVisible(false));
    }
  }, [dispatch, nostrModalVisible, npubNostrAccount]);

  return (
    <>
      <div className="claim-test-token">
        <div className="claim-content-box">
          <div className="claim-content-title">Claim Testnet Tokens</div>
          <Form
            className="claim-test-token__form"
            {...layout}
            form={form}
            requiredMark={false}
            name="claimTestnetTokensForm"
            autoComplete="off"
            style={{
              maxWidth: "1000px",
              width: "100%",
            }}
            initialValues={{ nostrAddress: npubNostrAccount || "" }}
          >
            <Form.Item
              name="nostrAddress"
              label="Your Nostr Address"
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (!/npub\w{59}/.test(value)) {
                        return Promise.reject(
                          new Error(t`Please input a valid Nostr address.`)
                        );
                      }
                      nip19.decode(value).data;
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                size="large"
                disabled
                // style={{ maxWidth: "660px" }}
                placeholder="Please connect your Norstr account and click claim"
              />
            </Form.Item>

            <Form.Item
              wrapperCol={
                width > 800
                  ? {
                      xs: { span: 19, offset: 5 },
                      md: { span: 19, offset: 5 },
                    }
                  : {}
              }
              style={{ textAlign: "center" }}
            >
              {/* <Space> */}
              <Button
                className="claim-test-token__btns"
                loading={tokenLoading}
                type="primary"
                size={width > 800 ? "large" : "middle"}
                onClick={onClaimTestTokens}
              >
                Claim Testnet Tokens
              </Button>
            </Form.Item>
            <Form.Item
              wrapperCol={
                width > 800
                  ? {
                      xs: { span: 18, offset: 6 },
                      md: { span: 18, offset: 6 },
                    }
                  : {}
              }
            >
              <ClaimDescription />
            </Form.Item>
          </Form>
        </div>
        <ClaimModal
          isClaimOpen={isClaimOpen}
          setIsClaimOpen={setIsClaimOpen}
          userTokens={userTokens}
          setUserTokens={setUserTokens}
        ></ClaimModal>
      </div>
    </>
  );
}
