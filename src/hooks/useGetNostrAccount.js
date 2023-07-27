import { useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initNostrAccount } from "store/reducer/userReducer";
import { Modal } from "antd";
import * as Lockr from "lockr";
import { useSize } from "ahooks";
import { nip19 } from "nostr-tools";
import { useQueryBalance } from "hooks/useNostrMarket";
import { setConnectNostrModalVisible, setTurnOnNostrDrawerVisible } from "store/reducer/modalReducer";
import { isInTokenPocket } from "lib/utils/userAgent";
import { t } from "@lingui/macro";
export default function useGetNostrAccount() {
  const { width } = useSize(document.querySelector("body"));

  const dispatch = useDispatch();
  const { nostrAccount } = useSelector(({ user }) => user);

  const handleGetNostrAccount = useCallback(async () => {
    if (!window.nostr) {
      if (width > 768) {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        window._notification.warning({
          message: isFirefox
            ? "Install the Alby extension on your Firefox"
            : "Install the Alby extension on your Chrome",
          description: (
            <span>
              {`Alby manages your Nostr keys, and you can use your key to sign it.`}
              {/* <a className="nostr-swap-link__notice" href="https://getalby.com/#alby-extension" target="_blank">
                {`Install now`}
              </a> */}
              {isFirefox ? (
                <a
                  className="nostr-swap-link__notice"
                  href="https://addons.mozilla.org/en-US/firefox/addon/alby/"
                  target="_blank"
                >
                  {t`Install now`}
                </a>
              ) : (
                <a
                  className="nostr-swap-link__notice"
                  href="https://chrome.google.com/webstore/detail/alby-bitcoin-lightning-wa/iokeahhehimjnekafflcihljlcjccdbe"
                  target="_blank"
                >
                  {t`Install now`}
                </a>
              )}
            </span>
          )
        });
      } else {
        if (!isInTokenPocket()) {
          dispatch(setConnectNostrModalVisible(true));
        } else {
          // check window.nostr & setting、turn on Nostr
          if (!window.ethereum) {
            // chain
            Modal.info({
              width: 326,
              footer: null,
              closable: true,
              title: "Check your network",

              content: (
                <>
                  <div>Currently only supported in ERC20, Switch network in wallet</div>
                </>
              )
            });
          } else {
            dispatch(setTurnOnNostrDrawerVisible(true));
          }
        }
      }
    } else {
      let albyNostrAccount = "";
      if (!nostrAccount) {
        albyNostrAccount = await window.nostr.getPublicKey();
        dispatch(initNostrAccount(albyNostrAccount));
        Lockr.set("nostrAccount", albyNostrAccount);
      }

      return albyNostrAccount;
    }
  }, [dispatch, nostrAccount, width]);

  return {
    handleGetNostrAccount
  };
}
