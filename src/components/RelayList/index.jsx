import "./index.scss";
import {
  Tooltip,
  Typography,
  Popover,
  Checkbox,
  Button,
  Input,
  message,
  Form,
} from "antd";
const { Paragraph } = Typography;
import { Trans, t } from "@lingui/macro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addRelayUrls,
  removeRelayUrls,
  initRelayUrls,
} from "store/reducer/basicReducer";
import { DownOutlined } from "@ant-design/icons";

import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
const AddRelay = ({ show, setShow, handleFormSubmit }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (show) {
      form.resetFields();
    }
  }, [form, show]);
  const formSubmit = useCallback(() => {
    form.submit();
  }, [form]);
  return (
    <>
      <Form
        form={form}
        style={{ display: show ? "block" : "none" }}
        layout="inline"
        labelCol={{
          span: 0,
        }}
        wrapperCol={{
          span: 24,
        }}
        autoComplete="off"
        onFinish={handleFormSubmit}
      >
        <Form.Item
          label={""}
          name="address"
          style={{
            display: "inline-block",
            marginBottom: "10px",
          }}
          rules={[
            {
              required: true,
              message: t`Please input your url!`,
            },
            {
              pattern: /^wss:\/\//,
              message: t`The url is incorrectly entered!`,
            },
          ]}
        >
          <Input placeholder={t`Relay url`} size="small" />
        </Form.Item>
        <Button
          className="CheckOutlined-btn"
          type="link"
          size="small"
          onClick={formSubmit}
        >
          <CheckOutlined />
        </Button>
        <Button
          className="CloseOutlined-btn"
          type="link"
          size="small"
          onClick={() => setShow(false)}
        >
          <CloseOutlined></CloseOutlined>
        </Button>
      </Form>
    </>
  );
};
export default function RelayList() {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();

  const [check, setCheck] = useState([]);
  const relayUrls = useSelector(({ basic }) => basic.relayUrls);

  const responseTime = useSelector(({ market }) => market.responseTime);

  // modify
  const onUrlsChange = useCallback(
    (values) => {
      setCheck(values);

      const _localCheck = [...relayUrls];
      const urls = _localCheck.map((item) => {
        return { ...item, link: values.includes(item.address) };
      });

      dispatch(initRelayUrls(urls));
    },
    [relayUrls, dispatch]
  );
  // delete
  const deleteRelay = useCallback(
    (row) => {
      dispatch(removeRelayUrls(row.address));
    },
    [dispatch]
  );
  const urls = useMemo(() => {
    const _localCheck = [...relayUrls];
    const _result = [];
    const _check = [];
    _localCheck.forEach((item) => {
      if (item.delete) {
        return false;
      }
      _result.push(
        <div key={item.address} className="Checkbox-box">
          <Checkbox
            className={
              item.status === "connected"
                ? "nostr-checkbox-connected"
                : "nostr-checkbox-disconnected"
            }
            disabled={item.offical}
            value={item.address}
          >
            {item.offical ? "Official Relay: " : ""}
            {item.offical ? (
              <Paragraph
                copyable={{
                  tooltips: false,
                }}
              >
                {item.address}
              </Paragraph>
            ) : (
              item.address
            )}
          </Checkbox>
          {!item.offical && (
            <Button
              className="DeleteOutlined-btn"
              type="link"
              size="small"
              onClick={() => deleteRelay(item)}
            >
              <DeleteOutlined></DeleteOutlined>
            </Button>
          )}
        </div>
      );

      if (item.offical || item.link) {
        _check.push(item.address);
      }
    });
    setCheck(_check);
    return _result;
  }, [deleteRelay, relayUrls]);
  const handleFormSubmit = useCallback(
    async (values) => {
      const _localCheck = [...relayUrls];
      const relaySome = _localCheck.some(
        (item) => item.address == values.address && !item.delete
      );
      if (relaySome) {
        return message.error(t`Url already exists`);
      }
      const willAddRelay = {
        address: values.address,
        offical: false,
        link: true,
        delete: false,
        status: "disconnected",
      };
      dispatch(addRelayUrls(willAddRelay));

      setShow(false);
    },
    [dispatch, relayUrls]
  );
  return (
    <div className="relay-url-list-box">
      <Popover
        placement="bottom"
        overlayClassName="relay-popover"
        width={500}
        color="#1B1F24"
        content={
          <>
            <div className="relay-url-list">
              <div className="relay-url-title-box">
                <div className="relay-url-title">
                  <Trans>Relays</Trans>
                </div>
                <div className="relay-url-title-action">
                  <Button
                    className="relay-add"
                    size="small"
                    type="primary"
                    onClick={() => setShow(true)}
                  >
                    <Trans>Add</Trans>
                  </Button>
                </div>
              </div>
              {/* <div className="relay-url-title-desc">
                We suggest that you copy our official relay and add it to your
                commonly used Nostr clients (Damus, Amethyst, Iris, etc.).
              </div> */}
              <AddRelay
                show={show}
                setShow={setShow}
                handleFormSubmit={handleFormSubmit}
              ></AddRelay>
              <Checkbox.Group
                style={{
                  width: "100%",
                }}
                value={check}
                // defaultValue={relayUrls}
                onChange={onUrlsChange}
              >
                {urls}
              </Checkbox.Group>
              <div className="relay-response-time">
                <span className="relay-response-time__label">Ping:</span>
                <span className="relay-response-time__value">
                  {responseTime} ms
                </span>
              </div>
            </div>
          </>
        }
        title=""
        trigger={"click"}
      >
        {/* <span className="relays-text">
          <Trans>Relays</Trans>
        </span> */}
        <Button
          className={classNames("relays-btn", {
            "relays-btn__disconnected":
              relayUrls.find((item) => item.address.includes("nostr"))
                ?.status === "disconnected",
          })}
        >
          Relays <DownOutlined />
        </Button>
      </Popover>
    </div>
  );
}
