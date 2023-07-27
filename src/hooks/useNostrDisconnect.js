import { useDisconnect } from "wagmi";
import { setAccount, setConnectPlat, setSelectedTokenPlatForm } from "store/reducer/userReducer";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import * as Lockr from "lockr";
export default function useNostrDisconnect() {
  const { disconnect } = useDisconnect();
  const dispatch = useDispatch();
  const handleDisconnect = useCallback(() => {
    Lockr.set("connectPlat", "");
    dispatch(setConnectPlat(""));
    dispatch(setAccount(""));
    disconnect();
  }, [disconnect, dispatch]);
  return {
    handleDisconnect
  };
}
