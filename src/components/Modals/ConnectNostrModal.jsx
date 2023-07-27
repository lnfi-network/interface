import { Modal, Timeline, Row, Col, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setNostrModalVisible } from "store/reducer/modalReducer";
import ConnectNostr from "components/Common/ConnectNostr";

import "./index.scss";
export default function ConnectNostrModal() {
  const { nostrModalVisible } = useSelector(({ modal }) => modal);

  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(setNostrModalVisible(false));
  }, [dispatch]);

  return (
    <>
      {nostrModalVisible && (
        <Modal
          width={360}
          title={null}
          centered
          open={nostrModalVisible}
          footer={null}
          closable={true}
          onCancel={onCancel}
        >
          <div className="nostr-modal">
            <p className="nostr-modal-description">
              You are not connected yet. Please use “Connect Nostr” to sign in with your Nostr account.
            </p>
            <ConnectNostr />
          </div>
        </Modal>
      )}
    </>
  );
}
