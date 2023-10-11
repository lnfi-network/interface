import {
  Button,
  message,
  Input,
  Form,
  Row,
  Modal,
  AutoComplete,
  Select
} from "antd";

import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import "./index.scss";
import { t } from "@lingui/macro";
import { useImportAsset, useHandleQueryTokenList } from "hooks/useNostrMarket";
const universeList = [
  "testnet.universe.lightning.finance",
  "universe.tiramisuwallet.com:10029"
]
function ImportModalForm({ open, setOpen, importingOpen, setImportingOpen, setImportingMap }) {
  const Option = Select.Option;
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const [btnLoading, setBtnLoading] = useState(false);
  const { handleImportAsset } = useImportAsset();
  const { handleQueryTokenList } = useHandleQueryTokenList()
  const onCancel = useCallback(() => {
    form.resetFields()
    setOpen(false);
  }, [form, setOpen]);
  useEffect(() => {
    if(open) {
      setStep(1)
    }
  },[open])
  const onImportSubmit = useCallback(async () => {
    try {
      await form.validateFields(["universe", "id"])
      if(step == 1) {
        setStep(2)
        return
      }
    } catch (error) {
      return
    }
    
    try {
      await form.validateFields();
      setBtnLoading(true);
      const values = form.getFieldsValue();
      let ret = await handleImportAsset({
        id: values.id,
        universe: values.universe,
        symbol: values.symbol,
        decimals: values.decimals,
        display: values.display
      });
      if (ret?.code === 0) {
        setImportingOpen(true)
        setImportingMap({
          type: "success",
          content: "Great! You just imported a Taproot Asset to NostrAssets. You can return to Asset List to manage your asset now."
        })
        onCancel()
        handleQueryTokenList()
      } else {
        setImportingOpen(true)
        setImportingMap({
          type: "fail",
          content: ret?.data || "Import asset failed!"
        })
      }
    } catch (e) {
      // console.log("e", e);
      if (e?.errorFields || e?.errorFields?.length) {
        return
      }
      messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  }, [step, form, handleImportAsset, setImportingOpen, setImportingMap, onCancel, handleQueryTokenList, messageApi]);

  const memoButton = useMemo(() => {
    return (
      <Button
        type="primary"
        className={"transfer-submit-btn"}
        size={"middle"}
        loading={btnLoading}
        onClick={onImportSubmit}
      >
        {step == 1 ? "Next" : t`Import`}
      </Button>
    );
  }, [btnLoading, onImportSubmit, step]);
  const universeItem = useMemo(() => {
    return universeList?.map((item) => {
      // const _address = nip19.npubEncode(item.contacts);
      return (
        <Option value={item} key={item}>
          {/* <div>
            <span className="b">Name:</span> {item.description}
          </div>
          <div title={_address}>
            <span className="b">Nostr:</span> {_address}
          </div> */}
          {item}
        </Option>
      );
    });
  }, []);
  return (
    <>
      {contextHolder}

      <Modal
        className="import-asset-modal"
        open={open}
        width="500px"
        title={t`Import`}
        footer={null}
        zIndex={1000}
        onCancel={onCancel}
      >
        <Form
          className="import-asset-form"
          layout="vertical"
          form={form}
          name="transferForm"
          autoComplete="off"
          initialValues={{
            decimals: "1",
            display: "1"
          }}
        >
          <Form.Item
            label="Universe_host"
            name="universe"
            style={{ marginBottom: 0, display: step == 1 ? "block" : "none" }}
            rules={[
              {
                required: true,
                message: 'Please enter the universe_host!',
              }
            ]}>
              <AutoComplete>
                {universeItem}
              </AutoComplete>
            {/* <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the universe_host"
            /> */}
          </Form.Item>
          <div className="f12 color-dark" style={{ marginBottom: "20px", display: step == 1 ? "block" : "none" }}>eg. tapd.nostrassets.com:10029, this is our universe_host</div>
          <Form.Item
            label="Asset ID"
            name="id"
            style={{ display: step == 1 ? "block" : "none" }}
            rules={[
              {
                required: true,
                message: 'Please enter the asset’s id!',
              }
            ]}>
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the asset’s id"
            />
          </Form.Item>
          <Form.Item
            label="Asset Symbol"
            name="symbol"
            style={{ display: step == 2 ? "block" : "none" }}
            rules={[
              {
                required: true,
                message: 'Please enter the asset symbol for display.',
              }
            ]}
            >
              <Input
                type="text"
                size={"middle"}
                maxLength={50}
                placeholder="Please enter the asset symbol for display."
              />
            {/* <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the universe_host"
            /> */}
          </Form.Item>
          {/* <div className="f12 color-dark" style={{ marginBottom: "20px" }}>eg. tapd.nostrassets.com:10029, this is our universe_host</div> */}
          <Form.Item
            label="Asset Deploy Decimal"
            name="decimals"
            style={{ display: step == 2 ? "block" : "none" }}
            rules={[
              {
                required: true,
                message: 'Please enter the asset deploy decimal.',
              }
            ]}>
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the asset deploy decimal."
            />
          </Form.Item>
          <Form.Item
            label="Asset Display Decimal"
            name="display"
            style={{ display: step == 2 ? "block" : "none" }}
            rules={[
              {
                required: true,
                message: 'Please enter the asset display decimal.',
              }
            ]}
          >
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the asset display decimal."
            />
          </Form.Item>
          {/* <Form.Item
            label="Group_key (optional)"
            name="key"
          >
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the group key of the asset"
            />
          </Form.Item> */}

          <Form.Item wrapperCol={24} align="middle" className="">
            <Row justify="center" style={{ marginTop: "10px" }}>
              {memoButton}
            </Row>
          </Form.Item>
        </Form >
      </Modal >
    </>
  );
}
export default memo(ImportModalForm);
