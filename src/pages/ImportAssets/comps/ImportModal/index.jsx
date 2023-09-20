import {
  Button,
  message,
  Input,
  Form,
  Row,
  Modal,
} from "antd";

import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import "./index.scss";
import { t } from "@lingui/macro";
import { useImportAsset, useHandleQueryTokenList } from "hooks/useNostrMarket";

function ImportModalForm({ open, setOpen, importingOpen, setImportingOpen, setImportingMap }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [btnLoading, setBtnLoading] = useState(false);
  const { handleImportAsset } = useImportAsset();
  const { handleQueryTokenList } = useHandleQueryTokenList()
  const onCancel = useCallback(() => {
    form.resetFields()
    setOpen(false);
  }, [form, setOpen]);
  const onImportSubmit = useCallback(async () => {
    try {
      await form.validateFields();
      setBtnLoading(true);
      const values = form.getFieldsValue();
      let ret = await handleImportAsset({
        id: values.id,
        universe: values.universe
      });
      if (ret?.code === 0) {
        setImportingOpen(true)
        setImportingMap({
          type: "success",
          content: "Greate! You just imported a Taproot Asset to NostrAssets, you can back to Assets page to manage your asset now."
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
  }, [form, handleImportAsset, setImportingOpen, setImportingMap, onCancel, handleQueryTokenList, messageApi]);

  const memoButton = useMemo(() => {
    return (
      <Button
        type="primary"
        className={"transfer-submit-btn"}
        size={"middle"}
        loading={btnLoading}
        onClick={onImportSubmit}
      >
        {t`Import`}
      </Button>
    );
  }, [btnLoading, onImportSubmit]);

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
        >
          <Form.Item
            label="Universe_host"
            name="universe"
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: 'Please enter the universe_host!',
              }
            ]}>
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the universe_host"
            />
          </Form.Item>
          <div className="f12 color-dark" style={{ marginBottom: "20px" }}>eg. tapd.nostrassets.com:10029, this is our universe_host</div>
          <Form.Item
            label="Asset ID"
            name="id"
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
            label="Group_key (optional)"
            name="key"
          >
            <Input
              type="text"
              size={"middle"}
              placeholder="Please enter the group key of the asset"
            />
          </Form.Item>

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
