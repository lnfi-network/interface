import { Button, Drawer, Radio, Space } from "antd";
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTurnOnNostrDrawerVisible } from "store/reducer/modalReducer";
import { CloseOutlined } from "@ant-design/icons";
import turnon1 from "img/turnon1.png";
import turnon2 from "img/turnon2.png";
const TurnOnNostrDrawer = () => {
  const { turnOnNostrDrawerVisible } = useSelector(({ modal }) => modal);
  const dispatch = useDispatch();
  const onClose = useCallback(() => {
    dispatch(setTurnOnNostrDrawerVisible(false));
  }, [dispatch]);
  return (
    <>
      {/* <Space>
        <Radio.Group value={placement} onChange={onChange}>
          <Radio value="top">top</Radio>
          <Radio value="right">right</Radio>
          <Radio value="bottom">bottom</Radio>
          <Radio value="left">left</Radio>
        </Radio.Group>
        <Button type="primary" onClick={showDrawer}>
          Open
        </Button>
      </Space> */}
      <Drawer
        title="Turn on Nostr"
        placement={"bottom"}
        width={500}
        onClose={onClose}
        closable={false}
        open={turnOnNostrDrawerVisible}
        extra={
          <Space>
            <Button type="link" onClick={onClose}>
              <CloseOutlined />
            </Button>
            {/* <Button type="primary" onClick={onClose}>
              OK
            </Button> */}
          </Space>
        }
      >
        <p>Click on "Mine" and open the switch for “Turn on Nostr" to activate Nostr.</p>
        <div className="turnon-img-flex">
          <div className="img-box-item">
            <img src={turnon1}></img>
          </div>
          <div className="img-box-item">
            <img src={turnon2}></img>
          </div>
        </div>
      </Drawer>
    </>
  );
};
export default TurnOnNostrDrawer;
