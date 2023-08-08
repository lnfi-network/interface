import useNostrPool from "hooks/useNostrPool";
import { useCallback, useEffect } from "react";
import { useDebounceEffect } from "ahooks";
import { Button } from "antd";
export default function Test() {
  const { execQueryNostrAsync } = useNostrPool();
  const onHandleClick = useCallback(async () => {
    const ret = await execQueryNostrAsync({
      queryCommand: "token list",
      sendToNostrAddress: process.env.REACT_APP_NOSTR_TOKEN_SEND_TO
    });
  }, [execQueryNostrAsync]);
  useDebounceEffect(
    () => {
      onHandleClick();
    },
    [onHandleClick],
    {
      wait: 200
    }
  );

  return (
    <>
      <div>test</div>
      <Button onClick={onHandleClick}>点我测试</Button>
    </>
  );
}
