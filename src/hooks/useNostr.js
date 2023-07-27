import { useNostrEvents, useNostr, dateToUnix } from "lib/nostr-react";
import dayjs from "dayjs";
import { nip19, nip04, getEventHash, getPublicKey, getSignature } from "nostr-tools";
import { useCallback, useMemo, useState, useRef } from "react";
import { Modal } from "antd";
import { useDeepCompareEffect } from "ahooks";
import { useDispatch, useSelector } from "react-redux";
import { initNostrAccount } from "store/reducer/userReducer";
import EventEmitter from "EventEmitter";
import { isInTokenPocket } from "lib/utils/userAgent";
import { t } from "@lingui/macro";
import { getLocalRobotPrivateKey } from "lib/utils/index";
window.nip19 = nip19;
window.nip04 = nip04;

const ROBOT_PRIVATE_KEY = getLocalRobotPrivateKey();
const ROBOT_ERC20_SEND_TO = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).data;
const LOCAL_ROBOT_ADDR = getPublicKey(ROBOT_PRIVATE_KEY);
export const usePostNostr = () => {
  const { publish, log, debug } = useNostr();
  const { nostrAccount } = useSelector(({ user }) => user);
  const [pubAndRelayEvent, setPubAndRelayEvent] = useState(null);
  const dispatch = useDispatch();

  const onSend = useCallback(
    async ({
      kind = 1,
      message,
      tags = [],
      privKey = "",
      targetPubkey = "",
      isPublish = false,
      isUseLocalRobotToSend = false
    }) => {
      let albyNostrAccount = nostrAccount;
      let ciphertext = "";
      if (!message) {
        throw new Error("No message provided.");
      }
      if (kind === 4 && targetPubkey) {
        if (isUseLocalRobotToSend) {
          ciphertext = await nip04.encrypt(privKey, targetPubkey, message);
        } else {
          if (window.nostr) {
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
              return Promise.reject("Network Error");
            }
            if (!albyNostrAccount) {
              albyNostrAccount = await window.nostr.getPublicKey();
              dispatch(initNostrAccount(albyNostrAccount));
            }
            ciphertext = await window.nostr.nip04.encrypt(targetPubkey, message);
          } else {
            const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
            window._notification.warning({
              message: isFirefox
                ? "Install the Alby extension on your Firefox"
                : "Install the Alby extension on your Chrome",
              description: (
                <span>
                  {t`Alby manages your Nostr keys, and you can use your key to sign it.`}
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
            return;
          }
        }
      } else {
        ciphertext = message;
      }
      const created_at = dayjs().unix();
      let event = {
        content: ciphertext,
        kind: kind,
        tags: tags,
        created_at: created_at,
        pubkey: isUseLocalRobotToSend ? getPublicKey(privKey) : albyNostrAccount
      };
      event.id = getEventHash(event);
      if (window.nostr && !isUseLocalRobotToSend) {
        const signedEvent = await window.nostr.signEvent(event);
        event = signedEvent;
      } else {
        event.sig = getSignature(event, privKey);
      }
      if (isPublish) {
        event.message = message;
        const pubAndRelays = publish(event);
        setPubAndRelayEvent({ pubAndRelays, event: event });
      }
      return event;
    },
    [dispatch, nostrAccount, publish]
  );
  useDeepCompareEffect(() => {
    const publishedEvent = pubAndRelayEvent?.event;
    const pubAndRelays = pubAndRelayEvent?.pubAndRelays;
    const onOk = (relay) => {
      log(
        debug,
        "info",
        `⬆️ ${publishedEvent?.message} has publish to relay ${relay.url}!!! event:${publishedEvent?.id} createdOk:${publishedEvent?.created_at
        } format: ${dayjs(publishedEvent?.created_at * 1000).format("YYYY-MM-DD HH:mm:ss")}  `
      );
    };
    const onError = (reason) => {
      log(
        debug,
        "info",
        `❌ ${publishedEvent?.message} publish error on relay ${relay.url}!!! ${reason} event:${publishedEvent?.id} createAt:${publishedEvent?.created_at}`
      );
    };

    if (pubAndRelays?.length > 0) {
      for (let i = 0; i < pubAndRelays.length; i++) {
        const relay = pubAndRelays[i].relay;
        const pub = pubAndRelays[i].pub;
        pub?.on("ok", onOk.bind(null, relay));
        pub?.on("failed", onError.bind(null, relay));
      }
    }
    return () => {
      if (pubAndRelays?.length > 0) {
        for (let i = 0; i < pubAndRelays.length; i++) {
          const pub = pubAndRelays[i].pub;
          pub?.off("ok", onOk);
          pub?.off("failed", onError);
        }
      }
    };
  }, [debug, log, pubAndRelayEvent]);
  return {
    onSend
  };
};
export const useListenNostrEvent = ({
  isUseLocalRobotToSend = false,
  isProxyReceiverEnable = false,
  sendToNostrAddress = ROBOT_ERC20_SEND_TO
}) => {
  const now = useRef(new Date());
  const TIME_OUT = 6_000;
  const timer = useRef(null);
  const { onSend } = usePostNostr();
  const [eventId, setSendEventId] = useState(null);

  const [eventEnable, setEventEnable] = useState(false);

  const { nostrAccount } = useSelector(({ user }) => user);

  const autoNostrEvent = useRef(null);
  const proxyReceiverAddress = LOCAL_ROBOT_ADDR;
  const filterReceiver = useMemo(() => {
    if (isProxyReceiverEnable) {
      return proxyReceiverAddress;
    }
    return isUseLocalRobotToSend ? LOCAL_ROBOT_ADDR : nostrAccount;
  }, [isProxyReceiverEnable, isUseLocalRobotToSend, nostrAccount, proxyReceiverAddress]);
  const { events, log, debug } = useNostrEvents({
    enabled: eventEnable && eventId,
    filter: {
      kinds: [4],
      since: dateToUnix(now.current),
      '#e': [eventId],
      '#p': [filterReceiver]
    }
  });

  const execQueryNostrAsync = useCallback(
    async ({ queryCommand, robotPrivatekey = ROBOT_PRIVATE_KEY, nonce = null }) => {
      if (!autoNostrEvent.current) {
        autoNostrEvent.current = new EventEmitter();
      }
      const tags = isProxyReceiverEnable
        ? [
          ["p", sendToNostrAddress],
          ["r", "json"],
          ["a", proxyReceiverAddress]
        ]
        : [
          ["p", sendToNostrAddress],
          ["r", "json"]
        ];
      if (nonce) {
        tags.push(["n", `${nonce}`]);
      }
      const sendEvent = await onSend({
        message: queryCommand,
        kind: 4,
        targetPubkey: sendToNostrAddress,
        privKey: robotPrivatekey,
        tags: tags,
        isPublish: true,
        isUseLocalRobotToSend
      });

      if (sendEvent) {
        setSendEventId(sendEvent.id);
      }
      return await new Promise((resolve, reject) => {
        autoNostrEvent.current.once(`${sendEvent.id}nostrResult`, (result) => {
          const ret = {
            event: sendEvent,
            result: result,
            during: dateToUnix() - sendEvent.created_at
          };
          if (result.code === 0) {
            log(debug, "info", `✅${queryCommand}:`, ret);
          } else {
            log(debug, "info", `❌ ${queryCommand}:`, ret);
          }

          resolve(ret);
        });
      });
    },
    [debug, isProxyReceiverEnable, isUseLocalRobotToSend, log, onSend, proxyReceiverAddress, sendToNostrAddress]
  );

  const parseEventContent = useCallback(
    async (content, eventId) => {
      const decryptContent =
        isUseLocalRobotToSend || isProxyReceiverEnable
          ? await nip04.decrypt(ROBOT_PRIVATE_KEY, sendToNostrAddress, content)
          : await window.nostr.nip04.decrypt(sendToNostrAddress, content)
      if (decryptContent) {
        try {
          const jsonParseContent = JSON.parse(decryptContent);

          autoNostrEvent.current.emit(`${eventId}nostrResult`, jsonParseContent);
          setSendEventId(null)
        } catch (err) {
          autoNostrEvent.current.emit(`${eventId}nostrResult`, {
            code: 500,
            data: err.message,
            msg: err.message
          });
          setSendEventId(null)
        }

      }
    },
    [isProxyReceiverEnable, isUseLocalRobotToSend, sendToNostrAddress]
  );
  useDeepCompareEffect(() => {
    let fileterEvent = null
    if (eventId) {
      setEventEnable(true);
      fileterEvent = events.find(event => JSON.stringify(event.tags).includes(eventId))

      if (fileterEvent) {
        setEventEnable(false);
        parseEventContent(fileterEvent.content, eventId);
      }
      timer.current = setTimeout(() => {
        if (!fileterEvent) {
          autoNostrEvent.current?.emit(`${eventId}nostrResult`, {
            code: 400,
            data: "Request timeout.",
            msg: "Request timeout."
          });
          setEventEnable(false);
        }
      }, TIME_OUT);

    } else {
      setEventEnable(false);
    }
    return () => {
      clearTimeout(timer.current);
      fileterEvent = null;
      timer.current = null;
    };
  }, [eventId, events, parseEventContent]);

  return {
    execQueryNostrAsync
  };
};
export const useGlobalNostrAssetsEvent = () => {
  const receiver = LOCAL_ROBOT_ADDR
  const sendToNostrAddress = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).data
  const { events } = useNostrEvents({
    enabled: true,
    filter: {
      kinds: [4],
      since: dateToUnix(),
      '#p': [receiver],
      '#t': ['notice']
    }
  });
  const [eventRet, setEventRet] = useState(null);

  useDeepCompareEffect(() => {
    const fn = async () => {
      if (events.length > 0) {
        const content = events[0].content;
        const decryptContent = await nip04.decrypt(ROBOT_PRIVATE_KEY, sendToNostrAddress, content)
        console.log("🚀 ~ file: useNostr.js:330 ~ fn ~ decryptContent:", decryptContent)
        if (decryptContent) {
          window._notification.success({
            message: 'Nostr Notice',
            description: <p>
              {decryptContent}
            </p>
          })
        }

      }
    }
    fn();
  }, [events, sendToNostrAddress])
  /* 
    useDeepCompareEffect(() => {
      console.log("🚀 ~ file: useNostr.js:320 ~ useGlobalNostrAssetsEvent ~ eventRet:", eventRet)
    }, [eventRet]) */

  return eventRet
}
