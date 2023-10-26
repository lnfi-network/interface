import "./ClaimToken.scss";
import { RightOutlined } from "@ant-design/icons";
import { Space, Button, Form, Input, Spin, message } from "antd";
import { nip19 } from "nostr-tools";
import { useCallback, useState, useEffect, useMemo } from "react";
import ClaimDescription from "./comps/ClaimDescription";
import { useSelector } from "react-redux";
import { useSize } from "ahooks";
import CheckNostrButton from "components/CheckNostrButton";
import { useAirdrop, useAirdropStats } from "hooks/graphQuery/useAirdrop";
import { useAirdropClaim } from "hooks/useNostrMarket";
import classNames from "classnames";

// import { useHistory } from "react-router-dom";
// import {selectorGetSimpleTokens} from 'hooks/useSelectors'
const layout = {
  labelCol: {
    span: 5
  },
  wrapperCol: {
    span: 19
  }
};

export default function ClaimToken() {
  //
  const [form] = Form.useForm();

  const { npubNostrAccount } = useSelector(({ user }) => user);

  const { width } = useSize(document.querySelector("body"));
  const { data: airdopAccountRet, reexcuteQuery, fetching } = useAirdrop({ nostrAddr: npubNostrAccount });
  const [submitTrickLoading, setSubmitTrickLoading] = useState(false);
  const [submitTreatLoading, setSubmitTreatLoading] = useState(false);
  const { handleTrickOrTreat } = useAirdropClaim();
  const { data: trickNum } = useAirdropStats("TRICK");
  const { data: treatNum } = useAirdropStats("TREAT");
  //const history = useHistory();

  const onTrickOrTreat = useCallback(
    async (trickOrTreat) => {
      try {
        if (airdopAccountRet?.status !== 0) {
          return;
        }
        if (trickOrTreat === "TRICK") {
          setSubmitTrickLoading(true);
        } else {
          setSubmitTreatLoading(true);
          //treat
        }
        const ret = await handleTrickOrTreat(trickOrTreat);
        if (ret?.code !== 0) {
          throw new Error(ret?.msg);
        }
        window._message.success(ret.data);
      } catch (e) {
        window._message.error(e.message);
      } finally {
        setSubmitTrickLoading(false);
        setSubmitTreatLoading(false);
        reexcuteQuery();
      }
    },
    [airdopAccountRet?.status, handleTrickOrTreat, reexcuteQuery]
  );

  useEffect(() => {
    if (npubNostrAccount) {
      form.setFieldValue("nostrAddress", npubNostrAccount);
    } else {
      form.setFieldValue("nostrAddress", "");
    }
  }, [form, npubNostrAccount]);

  return (
    <>
      <div className="claim-airdrop-token">
        <div className="claim-content-box">
          <div className="claim-content-bg">
            <div className="claim-content">
              <div className="claim-content-title">First Taproot Asset Airdrop</div>
              {!npubNostrAccount ? (
                <div className="claim-content-title__des">
                  This airdrop is only open to those whose Nostr addresses have been whitelisted. Please connect your
                  Nostr account to check whether you are qualified to claim the airdrop.
                </div>
              ) : (
                <>
                  <Spin spinning={fetching}>
                    {!airdopAccountRet ? (
                      <div className="claim-content-title__des">
                        Unfortunately, your linked account does not qualify for the airdrop. Please stay tuned for
                        future updates and activities on the platform.
                      </div>
                    ) : (
                      <div>
                        {airdopAccountRet?.status === 0 && (
                          <>
                            <div className="claim-content-title__sub">
                              <div>
                                Congratulations! You've qualified for the airdrop. Get a sneak peek of Taproot Asset.
                              </div>

                              <div>
                                Claim <span className="trick-text">{airdopAccountRet?.amount || 0} Tricks</span> or{" "}
                                <span className="treat-text">{airdopAccountRet?.amount || 0} Treats</span>?
                              </div>
                            </div>
                            <div className="claim-content-title__tip">
                              Only can pick one, the choice is yours, my fellow Taproot adventurers. Trick or treat your
                              way to your digital destiny, and may your Halloween night be filled with Taproot magic!
                            </div>
                          </>
                        )}
                        {airdopAccountRet?.status === 2 && (
                          <div className="claim-content-title__sub">
                            <div>
                              Congratulations! You have successfully claimed {airdopAccountRet?.amount}{" "}
                              <span
                                className={classNames({
                                  "treat-text": airdopAccountRet?.choice === "TREAT",
                                  "trick-text": airdopAccountRet?.choice === "TRICK"
                                })}
                              >
                                {airdopAccountRet?.choice}!
                              </span>
                            </div>
                          </div>
                        )}
                        {airdopAccountRet?.status === 3 && (
                          <div className="claim-content-title__sub">
                            <div>
                              Claim{" "}
                              <span
                                className={classNames({
                                  "treat-text": airdopAccountRet?.choice === "TREAT",
                                  "trick-text": airdopAccountRet?.choice === "TRICK"
                                })}
                              >
                                {airdopAccountRet?.choice}!
                              </span>{" "}
                              failed.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Spin>
                </>
              )}
              <Form
                className="claim-airdrop-token__form"
                {...layout}
                form={form}
                requiredMark={false}
                name="claimTestnetTokensForm"
                autoComplete="off"
                style={{
                  maxWidth: "800px",
                  width: "100%"
                }}
                initialValues={{ nostrAddress: npubNostrAccount || "" }}
              >
                <Form.Item
                  name="nostrAddress"
                  label="Your Nostr Address"
                  className="claim-airdrop-token__item"
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
                  <Input
                    size="large"
                    disabled
                    // style={{ maxWidth: "660px" }}
                    placeholder="Please connect your Norstr account"
                  />
                </Form.Item>

                <Form.Item
                  wrapperCol={
                    width > 800
                      ? {
                          xs: { span: 24, offset: 0 },
                          md: { span: 24, offset: 0 }
                        }
                      : {}
                  }
                  style={{ textAlign: "center" }}
                >
                  <Space>
                    <CheckNostrButton>
                      <Button
                        className="claim-test-token__btns trick"
                        loading={submitTrickLoading}
                        type="primary"
                        disabled={!airdopAccountRet || airdopAccountRet?.status !== 0}
                        size={width > 800 ? "large" : "middle"}
                        onClick={() => {
                          onTrickOrTreat("TRICK");
                        }}
                      >
                        Trick<span className="pick-count pick-count__trick">{trickNum} Pick</span>
                      </Button>
                    </CheckNostrButton>
                    <span style={{ paddingLeft: "10px", paddingRight: "10px" }}>or</span>
                    <CheckNostrButton>
                      <Button
                        className="claim-test-token__btns treat"
                        loading={submitTreatLoading}
                        disabled={!airdopAccountRet || airdopAccountRet?.status !== 0}
                        type="primary"
                        size={width > 800 ? "large" : "middle"}
                        onClick={() => {
                          onTrickOrTreat("TREAT");
                        }}
                      >
                        Treat<span className="pick-count pick-count__treat">{treatNum} Pick</span>
                      </Button>
                    </CheckNostrButton>
                  </Space>
                </Form.Item>
                <Form.Item
                  wrapperCol={
                    width > 800
                      ? {
                          xs: { span: 24, offset: 0 },
                          md: { span: 24, offset: 0 }
                        }
                      : {}
                  }
                >
                  <ClaimDescription />
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
