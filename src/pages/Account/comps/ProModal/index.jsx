import { Switch, Modal, Button, Row } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useMode } from "hooks/useNostrMarket";

import { useSelector, useDispatch } from "react-redux";
import "./index.scss";
export default function ProModal() {
  const proMode = useSelector(({ user }) => user.proMode);
  const npubNostrAccount = useSelector(({ user }) => user.npubNostrAccount);
  const [btnLoading, setBtnLoading] = useState(false);
  const [willChangeModalValue, setWillChangeModalValue] = useState(false);
  const [confirmModalVisible, setConfirmModal] = useState(false);
  const { handleQueryMode, handleChangeMode } = useMode();

  const handleChange = useCallback((value) => {
    setConfirmModal(true);
    setWillChangeModalValue(value);
  }, []);
  const onConfirmChangeMode = useCallback(async () => {
    setBtnLoading(true);
    try {
      const ret = await handleChangeMode(
        willChangeModalValue ? "open" : "close"
      );
      if (ret.code === 0) {
        await handleQueryMode(npubNostrAccount);
      }
      setConfirmModal(false);
      window._message.success("Change mode success.");
    } catch (e) {
      window._message.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  }, [
    handleChangeMode,
    handleQueryMode,
    npubNostrAccount,
    willChangeModalValue,
  ]);

  return (
    <>
      <Modal
        width={360}
        title={null}
        centered
        open={confirmModalVisible}
        footer={null}
        closable={true}
        onCancel={() => {
          setConfirmModal(false);
        }}
      >
        <div className="nostr-modal">
          <p className="nostr-modal-description nostr-modal-description-light">
            Currently in {proMode.value ? "Pro" : "Basic"} mode, please confirm
            whether to switch to {willChangeModalValue ? "Pro" : "Basic"} mode
          </p>
          <p className="nostr-modal-description">
            <span className="nostr-modal-description-light">Basic Mode:</span>{" "}
            Supports all general operations (transactions bundling) and
            Chat-to-Trade to execute trades at a speed of 1 Transaction per
            Second (TPS).
          </p>
          <p className="nostr-modal-description">
            <span className="nostr-modal-description-light">
              Professional Mode:
            </span>{" "}
            Support all functions of Basic Mode and in addition, systematic
            trading through REST APIs and Websocket streaming, at a speed of 100
            TPS.
          </p>
        </div>
        <Row justify="center">
          <Button
            size="middle"
            loading={btnLoading}
            type="primary"
            onClick={onConfirmChangeMode}
          >
            Confirm
          </Button>
        </Row>
      </Modal>
      <Switch
        checkedChildren="Pro Mode"
        unCheckedChildren="Basic Mode"
        checked={proMode.value}
        onChange={handleChange}
      />
    </>
  );
}
