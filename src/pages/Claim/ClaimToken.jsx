import "./ClaimToken.scss";
import { RightOutlined } from "@ant-design/icons";
import { Space, Button, Form, Input, Modal, message } from "antd";
import { nip19 } from "nostr-tools";
import { useCallback, useState, useEffect, useMemo } from "react";
import ClaimDescription from "./comps/ClaimDescription";
import { useSelector, useDispatch } from "react-redux";
import { useSize } from "ahooks";
import CheckNostrButton from "components/CheckNostrButton";
import { useQueryClaimTestnetTokens, useQueryBalance, useQueryClaimPoints } from "hooks/useNostrMarket";

import { useHistory } from "react-router-dom";
// import {selectorGetSimpleTokens} from 'hooks/useSelectors'
const layout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 18
  }
};

export default function ClaimToken() {
  //
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [tokenLoading, setTokenLoading] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const { handleQueryBalance } = useQueryBalance();
  const { npubNostrAccount, account } = useSelector(({ user }) => user);
  const { nostrModalVisible } = useSelector(({ modal }) => modal);
  const { width } = useSize(document.querySelector("body"));

  const history = useHistory();

  const onTrickOrTreat = useCallback(async (trickOrTreat) => {
    if (trickOrTreat === "trick") {
    } else {
      //treat
    }
  }, []);

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
                  <div className="claim-content-title__sub">
                    <div>Congratulations! You've qualified for the airdrop. Get a sneak peek of Taproot Asset.</div>

                    <div>Claim 10,000 Tricks or 10,000 Treats?</div>
                  </div>
                  <div className="claim-content-title__tip">
                    Only can pick one, the choice is yours, my fellow Taproot adventurers. Trick or treat your way to
                    your digital destiny, and may your Halloween night be filled with Taproot magic!
                  </div>
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
                        loading={tokenLoading}
                        type="primary"
                        size={width > 800 ? "large" : "middle"}
                        onClick={() => {
                          onTrickOrTreat("trick");
                        }}
                      >
                        Trick
                      </Button>
                    </CheckNostrButton>
                    <span>or</span>
                    <CheckNostrButton>
                      <Button
                        className="claim-test-token__btns treat"
                        loading={tokenLoading}
                        type="primary"
                        size={width > 800 ? "large" : "middle"}
                        onClick={() => {
                          onTrickOrTreat("treat");
                        }}
                      >
                        Treat
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
