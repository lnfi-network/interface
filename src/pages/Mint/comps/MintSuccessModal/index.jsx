import { Modal, Button } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import "./index.scss";

export default function MintSuccessModal({ visible, setVisible, tokenName, mintTokenNumber = 0 }) {
  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const memoTitle = useMemo(() => {
    return (
      <div className="mint-succeed-modal-title">
        <CheckCircleFilled style={{ color: "#0fcb81", paddingRight: "10px" }} />
        Mint Successfully
      </div>
    );
  }, []);

  return (
    <>
      <Modal
        className="mint-succeed-modal"
        open={visible}
        width="400px"
        title={memoTitle}
        zIndex={1002}
        footer={
          <>
            <Button
              type="primary"
              size={"middle"}
              onClick={() => {
                handleCancel();
              }}
            >
              Ok
            </Button>
          </>
        }
        onCancel={() => {
          handleCancel();
        }}
      >
        <div className="submit-modal">
          <p className="submit-modal-content">
            Great! You've just minted {mintTokenNumber} {tokenName}. You can check your Asset Balance on the NostrAsset
            Asset page.
          </p>
        </div>
      </Modal>
    </>
  );
}
