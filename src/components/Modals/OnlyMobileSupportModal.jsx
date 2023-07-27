import { Modal, Button, Row, Col } from "antd";
import { setOnlyMobileSupportedVisible } from "store/reducer/modalReducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import "./index.scss";
export default function OnlyMobileSupportModal() {
  const { onlyMobileSupportedVisible } = useSelector(({ modal }) => modal);

  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(setOnlyMobileSupportedVisible(false));
  }, [dispatch]);
  return (
    <Modal
      className="nostr-modal"
      open={onlyMobileSupportedVisible}
      title={null}
      footer={null}
      onCancel={onCancel}
    >
      <Row justify="center">
        <p className="nostr-modal-content">
          Lightning Network and Taproot receive assets and send assets are not
          supported on mobile currently, please go to the Web to operate.
        </p>
        <Button type="primary" onClick={onCancel}>
          OK
        </Button>
      </Row>
    </Modal>
  );
}
