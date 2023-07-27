// import BaseModal from "components/Common/Modal/Modal";
import {
  Button,
  Select,
  message,
  Input,
  Form,
  Row,
  Popover,
  AutoComplete,
  Modal,
  Spin,
} from "antd";
import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import "./index.scss";
import { t } from "@lingui/macro";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { useSize } from "ahooks";
import {
  useQueryBalance,
  useTransfer,
  useAddressBook,
} from "hooks/useNostrMarket";
import { limitDecimals } from "lib/numbers";
// import { nul } from "lib/utils/math";
const layout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

function TransferModalForm({ detail, isTransferShow, setIsTransferShow }) {
  const Option = Select.Option;
  const { width } = useSize(document.querySelector("body"));
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedToken, setSelectedToken] = useState(null);
  const [addressBook, setAddressBook] = useState([]);
  const { handleTransferAsync } = useTransfer();
  const { handleQueryBalance } = useQueryBalance();
  const { handleQueryAddressBook } = useAddressBook();
  // const { handleQueryAddAddress } = useQueryAddAddress();
  const [btnLoading, setBtnLoading] = useState(false);
  const { tokenList } = useSelector(({ market }) => market);
  const { balanceList, nostrAccount } = useSelector(({ user }) => user);

  useEffect(() => {
    if (nostrAccount && isTransferShow) {
      // getLocal()
      const fetchData = async () => {
        const ret = await handleQueryAddressBook();
        //
        if (ret?.code == 0) {
          const retData = ret?.data || [];
          // const newData = retData?.map(item => ({ ...item }))
          setAddressBook(retData);
        }
      };
      fetchData().catch(console.error);
    }
    return () => null;
  }, [handleQueryAddressBook, isTransferShow, nostrAccount]);
  useEffect(() => {
    if (isTransferShow) {
      form.resetFields();
      if (detail) {
        //
        form.setFieldValue("token", detail.id);
        const tempSelectedToken = tokenList.find(
          (item) => item.id === detail.id
        );
        setSelectedToken(tempSelectedToken);
      } else {
        if (tokenList?.length) {
          form.setFieldValue("token", tokenList[0]?.id);
          setSelectedToken(tokenList[0]);
        }
      }
    }
  }, [detail, form, isTransferShow, tokenList]);
  const getTokenBalance = useCallback(
    (tokenName) => {
      return balanceList[tokenName]?.balanceShow;
    },
    [balanceList]
  );
  const memoTokenList = useMemo(() => {
    return [...tokenList];
  }, [tokenList]);
  const onCancel = useCallback(() => {
    setIsTransferShow(false);
  }, [setIsTransferShow]);

  const handleMax = useCallback(() => {
    const maxAmount = getTokenBalance(selectedToken?.name);
    form.setFieldValue("amount", maxAmount);
    form.validateFields(["amount"]);
  }, [form, getTokenBalance, selectedToken?.name]);
  const sellSuffix = useMemo(() => {
    return (
      <Button type="link" className="suffix-btn" onClick={handleMax}>
        Max
      </Button>
    );
  }, [handleMax]);
  const options = useMemo(() => {
    return memoTokenList?.length ? (
      memoTokenList?.map((tokenItem) => {
        const tokenBalance = Number(getTokenBalance(tokenItem.name)) || 0;
        return (
          <Select.Option value={tokenItem.id} key={tokenItem.id}>
            <span className="select-token-name">{tokenItem.name}</span>
            <span className="select-token-balance">
              Balance: (
              {parseFloat(limitDecimals(tokenBalance, tokenItem.reserve))})
            </span>
          </Select.Option>
        );
      })
    ) : (
      <Select.Option value={""} key={""} style={{ textAlign: "center" }}>
        <Spin></Spin>
      </Select.Option>
    );
  }, [getTokenBalance, memoTokenList]);
  const addressBookOptions = useMemo(() => {
    return addressBook?.map((item) => {
      const _address = nip19.npubEncode(item.contacts);
      return (
        <Option value={_address} key={2}>
          <div>
            <span className="b">Name:</span> {item.description}
          </div>
          <div title={_address}>
            <span className="b">Nostr:</span> {_address}
          </div>
        </Option>
      );
    });
  }, [addressBook]);
  const handleTokenChange = useCallback(
    (id) => {
      const tempSelectedToken = tokenList.find((item) => item.id === id);
      setSelectedToken(tempSelectedToken);
      form.setFieldValue("amount", "");
      form.setFieldValue("price", "");
    },
    [form, tokenList]
  );
  const onTransferSubmit = useCallback(async () => {
    await form.validateFields();
    try {
      setBtnLoading(true);
      const values = form.getFieldsValue();
      // side, amount, buyTokenName, price, payTokenName
      const amount = values.amount;
      const token = selectedToken?.name;
      const address = values.nostrAddress;
      let ret = await handleTransferAsync({
        amount,
        token,
        address,
      });
      if (ret?.code === 0) {
        message.success(t`Submit successfully`);

        await handleQueryBalance(nip19.npubEncode(nostrAccount));
        setTimeout(() => {
          onCancel();
        }, 500);
      } else {
        messageApi.open({
          type: "error",
          content: ret.data,
        });
      }
    } catch (e) {
      messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  }, [
    form,
    selectedToken?.name,
    handleTransferAsync,
    handleQueryBalance,
    nostrAccount,
    onCancel,
    messageApi,
  ]);

  const onAmountChange = useCallback(
    ({ target: { value } }) => {
      if (Number(value)) {
        const maxAmount = getTokenBalance(selectedToken?.name);
        if (Number(value) > maxAmount) {
          form.setFieldValue("amount", maxAmount);
        } else {
          const match = value.match(/\d+\.?\d{0,4}/);
          //
          form.setFieldValue("amount", match[0]);
        }
      }
    },
    [form, getTokenBalance, selectedToken?.name]
  );
  const memoButton = useMemo(() => {
    return (
      <Button
        type="primary"
        className={"transfer-submit-btn"}
        size={width > 768 ? "large" : "middle"}
        loading={btnLoading}
        onClick={onTransferSubmit}
        // disabled={!Number(balance) || Number(balance) === 0}
      >
        {t`Transfer`}
      </Button>
    );
  }, [btnLoading, onTransferSubmit, width]);
  useEffect(() => {
    if (memoTokenList.length > 0) {
      const tokenItem = selectedToken || memoTokenList[0];
      if (!selectedToken) {
        setSelectedToken(tokenItem);
      }
      //form?.setFieldValue("token", tokenItem.id);
    }
  }, [memoTokenList, memoTokenList.length, selectedToken]);

  return (
    <>
      {contextHolder}

      <Modal
        className="transfer-modal"
        open={isTransferShow}
        width="850px"
        title={t`Transfer`}
        footer={null}
        /* onOk={handleOk} */
        onCancel={onCancel}
      >
        <Form
          className="transfer-form"
          {...layout}
          form={form}
          name="transferForm"
          autoComplete="off"
          initialValues={{
            token: selectedToken?.id,
          }}
        >
          <Form.Item label="Token">
            <Form.Item
              noStyle
              name="token"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                size={width > 768 ? "large" : "middle"}
                onChange={handleTokenChange}
              >
                {options}
              </Select>
            </Form.Item>
          </Form.Item>

          <Form.Item label={t`Nostr Address`}>
            <Form.Item
              name="nostrAddress"
              noStyle
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (value.indexOf("npub") == -1) {
                        return Promise.reject(
                          new Error(t`Invalid input format.`)
                        );
                      }
                      if (value == nip19.npubEncode(nostrAccount)) {
                        return Promise.reject(
                          new Error(t`You can't transfer to yourself.`)
                        );
                      }
                      // if (!/^(?!0\d)\d{1,}(?:\.\d{1,4})?$/.test(value)) {
                      //   return Promise.reject(
                      //     new Error(t`Invalid input format.`)
                      //   );
                      // }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              {/* <Input className="transfer-input" /> */}
              <AutoComplete size={width > 768 ? "large" : "middle"}>
                {addressBookOptions}
              </AutoComplete>
            </Form.Item>
            {/* <Popover content={content} title="Title" trigger="click">
              <FileTextOutlined style={{ marginLeft: "10px" }} />
            </Popover> */}
          </Form.Item>
          <Form.Item label={t`Transfer Amount`} className="amount-form-item">
            <Form.Item
              name="amount"
              noStyle
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (!Number(value)) {
                        return Promise.reject(
                          new Error(t`Invalid input format.`)
                        );
                      }
                      // if (!/^(?!0\d)\d{1,}(?:\.\d{1,4})?$/.test(value)) {
                      //   return Promise.reject(
                      //     new Error(t`Invalid input format.`)
                      //   );
                      // }
                      if (Number(value) < selectedToken?.volume) {
                        return Promise.reject(
                          new Error(
                            `Minimum Qty is ${selectedToken?.volume} ${selectedToken?.name}`
                          )
                        );
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                className="transfer-input"
                type="text"
                size={width > 768 ? "large" : "middle"}
                suffix={sellSuffix}
                placeholder=""
                onChange={onAmountChange}
              />
            </Form.Item>
            <span className="transfer-form-usdt">{selectedToken?.name}</span>
          </Form.Item>

          <Form.Item wrapperCol={24} align="middle" className="">
            <Row justify="center" style={{ marginTop: "10px" }}>
              {memoButton}
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/*  <BaseModal
        width="420px"
        initForm={initForm}
        title={buyOrSellSelect}
        ref={modalRef}
      >
      
      </BaseModal> */}
    </>
  );
}
export default memo(TransferModalForm);
