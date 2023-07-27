import BaseModal from "components/Common/Modal/Modal";
import { useCallback, useEffect, useRef } from "react";
import DepositDescription from "./DepositDescription";
import { Button } from "antd";
import * as Lockr from "lockr";
import "./DepositHelpModal.scss";
export default function DepositHelpModal() {
  const modalRef = useRef(null);
  const onCancel = useCallback(() => {
    Lockr.set("hasShowDepositHelpModal", true);
    modalRef.current.handleOk();
  }, []);
  useEffect(() => {
    if (!Lockr.get("hasShowDepositHelpModal")) {
      modalRef.current.showModal();
    }
  }, []);
  return (
    <BaseModal width="420px" title="" ref={modalRef} onCancel={onCancel}>
      <div className="deposit-help-modal-description">
        <p className="deposit-help-modal-description__title">
          Before trading on NostrAssets, need deposit your tokens from ERC20 or
          BRC20 wallet to your Nostr account.
        </p>
        <DepositDescription />
      </div>

      <div className="deposit-help-modal-btn">
        <Button
          type="primary"
          onClick={() => {
            modalRef.current.handleCancel();
          }}
          style={{ width: "100px" }}
        >
          Ok
        </Button>
      </div>
    </BaseModal>
  );
}
