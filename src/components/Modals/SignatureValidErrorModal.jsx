import { Modal, Button, Row, Col } from "antd";
import { setSignatureValidErrorVisible } from "store/reducer/modalReducer";
import { initNostrAccount } from "store/reducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import "./index.scss";
export default function SignatureValidErrorModal() {
  const { signatureValidErrorVisible } = useSelector(({ modal }) => modal);
  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(setSignatureValidErrorVisible(false));
  }, [dispatch]);
  const onDisconnect = useCallback(() => {
    dispatch(initNostrAccount(""));
    onCancel();
  }, [dispatch, onCancel]);
  return (
    <Modal
      className="nostr-modal"
      zIndex={1000}
      open={signatureValidErrorVisible}
      title={null}
      footer={null}
      onCancel={onCancel}
    >
      <Row justify="center">
        <p className="nostr-modal-content">
          The currently connected Nostr account and the Nostr account logged in by Alby are inconsistent. Please
          disconnect and reconnect. If you need to switch accounts, please switch accounts in Alby first and then
          reconnect.
        </p>
        <Button type="primary" onClick={onDisconnect}>
          Disconnect
        </Button>
      </Row>
    </Modal>
  );
}
