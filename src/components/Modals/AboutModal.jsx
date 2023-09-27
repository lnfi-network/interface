import { Switch, Modal, Button, Row } from "antd";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useMode } from "hooks/useNostrMarket";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import assetsAbout1 from "img/assets-about-1.jpg";
import assetsAbout2 from "img/assets-about-2.jpg";
import * as Lockr from "lockr";
import { setAboutModalVisible } from "store/reducer/modalReducer";
import "./index.scss";
export default function AboutModal() {
  const { aboutModalVisible } = useSelector(({ modal }) => modal);

  const dispatch = useDispatch();
  const handleCancel = useCallback(() => {
    Lockr.set("aboutModal", true)
    dispatch(setAboutModalVisible(false));
  }, [dispatch]);
  const history = useHistory();
  const onHandleRedirect = useCallback(
    (redirectTo) => {
      if(!(history?.location?.pathname?.indexOf("importAssets") > -1)) {
        history.push(`/${redirectTo}`);
      }
    },
    [history]
  );
  return (
    <>
      <Modal
        className="import-asset-about-modal"
        open={aboutModalVisible}
        width="800px"
        title={"About Import Assets"}
        zIndex={1002}
        footer={
          <>
            <Button
              type="primary"
              size={"middle"}
              onClick={
                () => {
                  handleCancel()
                  onHandleRedirect("importAssets")
                }
              }
            >
              Continue
            </Button>
          </>
        }
        onCancel={() => {
          handleCancel()
        }}
        // closeIcon={null}
      >
        <div className="about-modal-content">
          <div className="about-modal-content-info">
            Import Assets refers to the process of importing assets from the Universe of NostrAssets or other daemon
            Universes to NostrAssets Asset List. You can manage these assets once they are imported.
          </div>
          <div className="mt30 about-modal-content-title"><span className="about-num">1</span>Importing Assets from the Universe of NostrAssets</div>
          <img style={{ width: "100%" }} src={assetsAbout1} alt="" />
          <div className="mt20 about-modal-content-title"><span className="about-num">2</span>Importing Assets from other daemon Universes</div>
          <img className="mt10" style={{ width: "100%" }} src={assetsAbout2} alt="" />
        </div>
      </Modal>
    </>
  );
}
