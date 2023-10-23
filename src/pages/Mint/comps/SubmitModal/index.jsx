import { Modal, Button } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";

import "./index.scss";
import EllipsisMiddle from "components/EllipsisMiddle";
import { useSelector } from "react-redux";

export default function SubmitModal({ visible, setVisible }) {
  const { npubNostrAccount } = useSelector(({ user }) => user);
  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  return (
    <>
      <Modal
        className="mint-succeed-modal"
        open={visible}
        width="400px"
        title={"Submitted Successfully"}
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
        // closeIcon={null}
      >
        <div className="submit-modal">
          <p className="submit-modal-content">
            Success! We are currently verifying your payment. Upon successful verification, the Taproot asset creation
            process will commence automatically and the asset will be sent to your connected NostrAssets address.
          </p>
          <div className="nostr-address">
            <EllipsisMiddle suffixCount={18}>{npubNostrAccount}</EllipsisMiddle>
          </div>
        </div>
      </Modal>
    </>
  );
}
