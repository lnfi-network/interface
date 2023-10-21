import { Button, Checkbox, Form, Input, InputNumber, Row, Col } from "antd";
import PayAndMintProgress from "../comps/PayAndMintProgress";
import SubmitModal from "../comps/SubmitModal";
import { useState, useCallback } from "react";
import "./index.scss";
export default function MintCreate() {
  const [form] = Form.useForm();
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const onPaymentAndCreateAsset = useCallback(() => {
    setSubmitModalVisible(true);
  }, []);
  const onFinish = useCallback((values) => {
    console.log(values);
  }, []);

  return (
    <>
      <SubmitModal visible={submitModalVisible} setVisible={setSubmitModalVisible} />
      <div className="nostr-assets-container">
        <h3 className="nostr-assets-titleh3">Create Asset</h3>
        <div className="nostr-assets-titleh3-description">
          Deploy Taproot
          Assets将会直接发送至您的NostrAssets账户中，deploy出的token完全由您自己管理。您可以自己自行设置mint规则
        </div>

        <Form
          name="mintCreate"
          layout="inline"
          className="nostr-assets-form"
          form={form}
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
          onFinish={onFinish}
          autoComplete="off"
        >
          <h4 className="nostr-assets-form-groupInfo">Asset info</h4>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item
                label="Asset Name"
                name="assetName"
                rules={[
                  {
                    required: true,
                    message: "Please input asset name"
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Asset Symbol"
                name="assetSymbol"
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
                name="totalSupply"
                rules={[
                  {
                    required: true,
                    message: "How many of this asset will supply"
                  }
                ]}
              >
                <InputNumber min={1} size="middle" controls={false} placeholder="How many of this asset will supply" />
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
                name="deployDecimal"
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
                name="logoURL"
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
            <Button type="primary" size="middle" htmlType="submit">
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
            <PayAndMintProgress />
          </Row>
        </Form>
        <div className="nostr-assets-mint">
          <Button type="primary" size="middle" onClick={onPaymentAndCreateAsset}>
            Cofirm Payment and Create Asset
          </Button>
        </div>
      </div>
    </>
  );
}
