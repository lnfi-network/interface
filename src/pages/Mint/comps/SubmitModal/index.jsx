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
            Create asset申请提交成功，我们正在确认您的付款，付款成功将自动进入Taproot asset
            mint流程，mint成功后，asset将会发送至您当前链接的NostrAssets地址:
          </p>
          <div className="nostr-address">
            <EllipsisMiddle suffixCount={18}>{npubNostrAccount}</EllipsisMiddle>
          </div>
          <div className="submit-modal-tip">您可关闭弹窗在当前页面关注状态变化。</div>
        </div>
      </Modal>
    </>
  );
}
