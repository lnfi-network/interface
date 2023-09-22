import dayjs from "dayjs";
import { SimplePool, nip19, nip04, getEventHash, getPublicKey, getSignature } from "nostr-tools";
import { useSelector, useDispatch } from "react-redux";
import { useContext, createContext, useCallback, useEffect, useRef } from "react";
import { isInTokenPocket, isMobile } from "lib/utils/userAgent";
import { getLocalRobotPrivateKey } from "lib/utils/index";
import { selectorRelayUrls, updateRelayStatus } from "store/reducer/relayReducer";
//import { setSignatureValidErrorVisible } from "store/reducer/modalReducer";
import useDevice from "./useDevice";
import { useAsyncEffect } from "ahooks";
window.nip19 = nip19;
const NostrContext = createContext();
const ROBOT_PRIVATE_KEY = getLocalRobotPrivateKey();
export function NostrProvider({ debug = false, children }) {
  const pool = new SimplePool();
  return <NostrContext.Provider value={{ debug, pool }}>{children}</NostrContext.Provider>;
}
export function useNostr() {
  return useContext(NostrContext);
}

export const log = (isOn, type, ...args) => {
  if (!isOn) return;
  console[type](...args);
};

const useNostrPool = () => {
  const { pool, debug } = useNostr();
  const { nostrAccount } = useSelector(({ user }) => user);
  const device = useDevice();
  // const dispatch = useDispatch();
  const relays = useSelector(selectorRelayUrls);
  const checkRuntime = useCallback(
    (isUseLocalRobotToSend) => {
      if (isInTokenPocket() && !window.ethereum) {
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
        return false;
      }
      if (!isUseLocalRobotToSend) {
        if (!nostrAccount) {
          window._message.destroy("albyWarning");
          window._message.warning({
            content: "Please connect alby extension first.",
            key: "albyWarning"
          });
          return false;
        }
        if (!window.nostr) {
          if (!device.isMobile) {
            const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
            window._notification.warning({
              message: isFirefox
                ? "Install the Alby extension on your Firefox"
                : "Install the Alby extension on your Chrome",
              description: (
                <span>
                  {`Alby manages your Nostr keys, and you can use your key to sign it.`}
                  {isFirefox ? (
                    <a
                      className="nostr-swap-link__notice"
                      href="https://addons.mozilla.org/en-US/firefox/addon/alby/"
                      target="_blank"
                    >
                      {`Install now`}
                    </a>
                  ) : (
                    <a
                      className="nostr-swap-link__notice"
                      href="https://chrome.google.com/webstore/detail/alby-bitcoin-lightning-wa/iokeahhehimjnekafflcihljlcjccdbe"
                      target="_blank"
                    >
                      {`Install now`}
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
          return false
        }
      }

      return true;
    },
    [device.isMobile, nostrAccount]
  );

  const getWillSendEvent = useCallback(
    async ({ message, kind = 4, targetPubkey, privateKey, tags }) => {
      if (!message) {
        throw new Error("No message provided.");
      }
      let ciphertext = "";
      if (kind === 4 && targetPubkey) {
        if (privateKey) {
          ciphertext = await nip04.encrypt(privateKey, targetPubkey, message);
        } else {
          ciphertext = await window.nostr.nip04.encrypt(targetPubkey, message);
        }
      } else {
        ciphertext = message;
      }
      const created_at = dayjs().unix();
      const pubkey = privateKey ? getPublicKey(privateKey) : nostrAccount;
      let event = {
        content: ciphertext,
        kind: kind,
        tags: tags,
        created_at: created_at,
        pubkey: pubkey
      };
      event.id = getEventHash(event);
      if (!privateKey) {
        const signedEvent = await window.nostr.signEvent(event);
        console.log("🚀 ~ file: useNostrPool.js:84 ~ getWillSendEvent ~ signedEvent:", signedEvent);
        event = signedEvent;
      } else {
        event.sig = getSignature(event, privateKey);
      }
      return event;
    },
    [nostrAccount]
  );

  const execQueryNostrAsync = useCallback(
    async ({ queryCommand, sendToNostrAddress, isUseLocalRobotToSend = true }) => {
      const checkRuntimeRet = checkRuntime(isUseLocalRobotToSend);
      if (!checkRuntimeRet) {
        const errRet = {
          retEvent: null,
          sendEvent: null,
          result: { code: 400, data: "Alby not detected", msg: "Alby not detected." }
        };
        return errRet
      }
      const decodeSendTo = nip19.decode(sendToNostrAddress).data;
      const robotPubkey = getPublicKey(ROBOT_PRIVATE_KEY);
      const isProxyReceiverEnable = !isUseLocalRobotToSend;
      let result = null;
      const kind = 4;
      const tags = [
        ["p", decodeSendTo],
        ["r", "json"]
      ];
      if (isProxyReceiverEnable) {
        tags.push(["a", robotPubkey]);
      }
      let receiver = robotPubkey;

      const willSendEvent = await getWillSendEvent({
        message: queryCommand,
        kind: kind,
        targetPubkey: decodeSendTo,
        privateKey: isUseLocalRobotToSend ? ROBOT_PRIVATE_KEY : "",
        tags: tags
      });

      if (!willSendEvent) {
        const createErrRet = {
          sendEvent: { message: queryCommand },
          result: { code: 500, data: "Event create Error", msg: "Event create Error" }
        };
        log(debug, "info", `❌ ${queryCommand}`, createErrRet);
        return;
      }
      const sendEvent = { ...willSendEvent, message: queryCommand };

      const filter = {
        kinds: [kind],
        since: dayjs().unix(),
        "#e": [willSendEvent.id],
        "#p": [receiver]
      };
      const publishPromises = pool.publish(relays, willSendEvent);

      await Promise.any(publishPromises).catch((e) => {
        console.log(e.message);
      });
      /*  for (let i = 0; i < publishedRets.length; i++) {
       const publishRet = publishedRets[i];
       if (publishRet.status == 'rejected') {
         const errMsg = publishRet.reason.message;
         log(debug, "info", `❌ ${queryCommand} ${relays[i]}`, errMsg);
         if (errMsg.indexOf('invalid') > -1) {
           const errRet = {
             retEvent: null,
             sendEvent: sendEvent,
             result: { code: 403, data: 'Event signature verification failed', msg: 'Event signature verification failed' }
           }
           dispatch(setSignatureValidErrorVisible(true))
           log(debug, "info", `❌ ${queryCommand}`, errRet);
           return errRet
         }
       }
     } */

      const retEvent = await pool.get(relays, filter).catch((e) => {
        return null;
      });

      if (!retEvent) {
        const errRet = {
          retEvent: null,
          sendEvent: sendEvent,
          result: { code: 400, data: "Timeout", msg: "Timeout" }
        };
        log(debug, "info", `❌ ${queryCommand}`, errRet);
        return errRet;
      }
      const content = retEvent.content;
      const decryptContent = await nip04.decrypt(ROBOT_PRIVATE_KEY, decodeSendTo, content);
      if (decryptContent) {
        result = JSON.parse(decryptContent);
        const sucRet = {
          sendEvent: sendEvent,
          retEvent: retEvent,
          result
        };
        if (result.code === 0) {
          log(debug, "info", `✅ ${queryCommand}`, sucRet);
        } else {
          log(debug, "info", `❗️${queryCommand}`, sucRet);
        }

        return sucRet;
      }
    },
    [checkRuntime, debug, getWillSendEvent, pool, relays]
  );
  return {
    execQueryNostrAsync
  };
};
export const useListenerRelayStatus = () => {
  const { pool, debug } = useNostr();
  const relays = useSelector(selectorRelayUrls);
  const dispatch = useDispatch();
  useAsyncEffect(async () => {
    for (let i = 0; i < relays.length; i++) {
      const relay = await pool.ensureRelay(relays[i]).catch((e) => { });
      if (relay) {
        log(debug, "info", `✅ nostr (${relay.url}): Connected ${Date.now()}!`);
        dispatch(updateRelayStatus({ address: relay.url, status: "connected" }));
      }
    }
  }, [pool, relays.length]);
};
export const useGlobalNostrAssetsEvent = () => {
  const receiver = getPublicKey(ROBOT_PRIVATE_KEY);
  const { pool } = useNostr();
  const relays = useSelector(selectorRelayUrls);
  const sub = useRef(null);
  useEffect(() => {
    const onSubEvent = async (event) => {
      const content = event.content;
      const sendToNostrAddress = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).data;
      const decryptContent = await nip04.decrypt(ROBOT_PRIVATE_KEY, sendToNostrAddress, content);
      if (decryptContent) {
        window._notification.success({
          message: "Nostr Notice",
          description: <p>{decryptContent}</p>
        });
      }
    };
    if (relays.length > 0) {
      sub.current = pool.sub(
        [...relays],
        [
          {
            kinds: [1, 4],
            since: dayjs().unix(),
            "#p": [receiver],
            "#t": ["notice"]
          }
        ]
      );
      sub.current.on("event", onSubEvent);
    }
    return () => {
      if (sub.current) {
        sub.current.off("event", onSubEvent);
        sub.current = null;
      }
    };
  }, [pool, receiver, relays]);
};
export default useNostrPool;
