import { useCallback } from "react";
import { useSignMessage } from "wagmi";
import * as Lockr from "lockr";
import { message as Message } from "antd";
export default function useNostrSignMessage(isNeedPrefix = true) {
  const { signMessageAsync } = useSignMessage();
  const signMessage = useCallback(
    async (message) => {
      const connectPlat = Lockr.get("connectPlat");
      const willSignMessage = isNeedPrefix ? `Nostr\n\n${message}` : `${message}`;
      if (connectPlat === "ETH" || !connectPlat) {
        return await signMessageAsync({ message: willSignMessage });
      } else {
        return await window.unisat.signMessage(willSignMessage);
      }
    },
    [isNeedPrefix, signMessageAsync]
  );
  return signMessage;
}
