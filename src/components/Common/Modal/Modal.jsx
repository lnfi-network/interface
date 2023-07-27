import { Modal } from "antd";
import { useState, useImperativeHandle, forwardRef } from "react";
function BaseModal({ ...props }, ref) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    if (props.initForm) {
      props.initForm();
    }
    if (props.onCancel) {
      props.onCancel();
    }
  };
  const getModalStatus = () => {
    return isModalOpen;
  };
  useImperativeHandle(ref, () => {
    return {
      showModal: showModal,
      handleCancel: handleCancel,
      handleOk: handleOk,
      getModalStatus
    };
  });
  return (
    <>
      {isModalOpen ? (
        <Modal
          className="nostrswap-modal"
          open={isModalOpen}
          title={props.title}
          footer={null}
          onOk={handleOk}
          onCancel={handleCancel}
          {...props}
        >
          {props.children}
        </Modal>
      ) : null}
    </>
  );
}
export default forwardRef(BaseModal);
