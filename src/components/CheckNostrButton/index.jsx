import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNostrModalVisible, setConnectNostrModalVisible } from "store/reducer/modalReducer";
import useDevice from "hooks/useDevice";
export default function CheckNostrButton({ children }) {
  const { nostrAccount } = useSelector(({ user }) => user);
  const device = useDevice();
  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    if (device.isMobile) {
      dispatch(setConnectNostrModalVisible(true));
    } else {
      dispatch(setNostrModalVisible(true));
    }
  }, [device.isMobile, dispatch]);
  const childWithNewOnClick = React.cloneElement(children, { onClick: handleClick });

  return <>{!nostrAccount ? childWithNewOnClick : children}</>;
}
