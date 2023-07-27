import { useRef, useEffect, useCallback } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import BaseModal from "components/Common/Modal/Modal";
import { isInTokenPocket } from "lib/utils/userAgent";
import "./index.scss";
import { Button } from "antd";
export default function SetupNetWorkModal() {
  const { chain, chains } = useNetwork();
  const {
    error,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const modalRef = useRef(null);
  const handleSwitch = useCallback(() => {
    switchNetwork(chains[0].id);
    if (isInTokenPocket()) {
      modalRef.current.handleCancel();
    }
  }, [chains, switchNetwork]);
  useEffect(() => {
    if (
      chain?.unsupported &&
      window?.ethereum?.networkVersion != chains[0].id
    ) {
      modalRef.current.showModal();
    } else {
      modalRef.current.handleCancel();
    }
  }, [chain, chain?.unsupported, chains]);
  return (
    <>
      <BaseModal
        className="nostr-setup-modal"
        width="350px"
        // closable={false}
        ref={modalRef}
        // maskClosable={false}
      >
        <div className="nostr-setup-modal__content">
          <p className="setupModal">
            {`Deposit only supported on ${chains[0]?.name} Network at the moment.`}
          </p>
          <Button
            type="primary"
            size="middle"
            loading={isLoading}
            onClick={handleSwitch}
          >
            Switch Network
          </Button>
        </div>
      </BaseModal>
    </>
  );
}
