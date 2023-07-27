import { Modal, Row } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { setLanguageModalVisible } from "store/reducer/modalReducer";
import LanguageModalContent from "components/NetworkDropdown/LanguageModalContent";
import { t } from "@lingui/macro";
import "./index.scss";
export default function LanguageModal() {
  const { languageModalVisible } = useSelector(({ modal }) => modal);
  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(setLanguageModalVisible(false));
  }, [dispatch]);
  return (
    <>
      <Modal
        width={400}
        title={t`Select Language`}
        centered
        open={languageModalVisible}
        footer={null}
        closable={false}
        onCancel={onCancel}
      >
        <>
          <Row>
            <LanguageModalContent />
          </Row>
        </>
      </Modal>
    </>
  );
}
