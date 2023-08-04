import dayjs from "dayjs";
import { SimplePool, nip19, nip04, getEventHash, getPublicKey, getSignature } from "nostr-tools";
import { useSelector } from "react-redux";
import { useContext, createContext, useCallback, useMemo, useEffect, useRef } from 'react'
import { isInTokenPocket } from 'lib/utils/userAgent'
import { getLocalRobotPrivateKey } from "lib/utils/index";
const NostrContext = createContext()
const ROBOT_PRIVATE_KEY = getLocalRobotPrivateKey();
export function NostrProvider2({ children }) {
  const pool = new SimplePool();
  return <NostrContext.Provider value={{ pool }}>{children}</NostrContext.Provider>
}
export function useNostr() {
  return useContext(NostrContext);
}

const useNostrPools = () => {
  const { pool } = useNostr();
  const { nostrAccount } = useSelector(({ user }) => user);
  const relayUrls = useSelector(({ basic }) => basic.relayUrls);
  const relays = useMemo(() => {
    return relayUrls.map(relayUrl => relayUrl.address);
  }, [relayUrls])

  const checkRuntime = useCallback(() => {
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
      return false
    }
    if (!window.nostr) {
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
      return false;
    }
    if (!nostrAccount) {
      window._message.warning({
        content: 'Please connect alby extension first.'
      })
      return false;
    }
    return true

  }, [nostrAccount])

  const getWillSendEvent = useCallback(async ({ message, kind = 4, targetPubkey, privateKey, tags }) => {
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
    const pubkey = privateKey ? getPublicKey(privateKey) : nostrAccount
    let event = {
      content: ciphertext,
      kind: kind,
      tags: tags,
      created_at: created_at,
      pubkey: pubkey,
    };
    event.id = getEventHash(event);
    if (!privateKey) {
      const signedEvent = await window.nostr.signEvent(event);
      event = signedEvent;
    } else {
      event.sig = getSignature(event, privateKey);
    }
    return event;
  }, [nostrAccount])

  const execQueryNostrAsync = useCallback(async ({ queryCommand, sendToNostrAddress, isUseLocalRobotToSend = true }) => {
    const checkRuntimeRet = checkRuntime()
    if (!checkRuntimeRet) {
      return;
    }
    const decodeSendTo = nip19.decode(sendToNostrAddress).data
    const robotPubkey = getPublicKey(ROBOT_PRIVATE_KEY)
    const isProxyReceiverEnable = !isUseLocalRobotToSend
    let result = null
    const kind = 4
    const tags = [
      ["p", decodeSendTo],
      ["r", "json"]
    ]
    if (isProxyReceiverEnable) {
      tags.push(["a", robotPubkey])
    }
    let receiver = robotPubkey;

    const willSendEvent = await getWillSendEvent({
      message: queryCommand,
      kind: kind,
      targetPubkey: decodeSendTo,
      privateKey: isUseLocalRobotToSend ? ROBOT_PRIVATE_KEY : '',
      tags: tags,
    });
    if (!willSendEvent) {
      return {
        event: null,
        result: { code: 500, data: 'Event create Error', message: 'Event create Error' }
      }
    }
    const filter = {
      kinds: [kind],
      since: dayjs().unix(),
      '#e': [willSendEvent.id],
      '#p': [receiver]
    }
    pool.publish(relays, willSendEvent);
    const event = await pool.get(relays, filter) || null;
    const retEvent = {
      message: queryCommand,
      ...event
    }
    if (!event) {
      return {
        event: retEvent,
        result: { code: 400, data: 'timeout', message: 'timeout' }
      }
    }
    const content = event.content;
    const decryptContent = await nip04.decrypt(ROBOT_PRIVATE_KEY, decodeSendTo, content)
    if (decryptContent) {
      result = JSON.parse(decryptContent)
      console.log("🚀 ~ file: useNostrPools.js:168 ~ execQueryNostrAsync ~ result:", result)
      return {
        event: retEvent,
        result
      }
    }
  }, [checkRuntime, getWillSendEvent, pool, relays])
  return {
    execQueryNostrAsync
  }
}
export const useGlobalNostrAssetsEvent = () => {
  const receiver = getPublicKey(ROBOT_PRIVATE_KEY)
  const { pool } = useNostr();
  const relayUrls = useSelector(({ basic }) => basic.relayUrls);
  const sub = useRef(null)
  const relays = useMemo(() => {
    return relayUrls.map(relayUrl => relayUrl.address);
  }, [relayUrls])

  useEffect(() => {
    const onSubEvent = async (event) => {
      const content = event.content;
      const sendToNostrAddress = nip19.decode(process.env.REACT_APP_NOSTR_TOKEN_SEND_TO).data
      const decryptContent = await nip04.decrypt(ROBOT_PRIVATE_KEY, sendToNostrAddress, content)
      if (decryptContent) {
        window._notification.success({
          message: 'Nostr Notice',
          description: <p>
            {decryptContent}
          </p>
        })
      }
    }
    if (relays.length > 0) {
      sub.current = pool.sub([...relays], [{
        kinds: [4],
        since: dayjs().unix(),
        '#p': [receiver],
        '#t': ['notice']
      }]);
      sub.current.on('event', onSubEvent);
    }
    return () => {
      if (sub.current) {
        sub.current.off('event', onSubEvent);
        sub.current = null;
      }
    }
  }, [pool, receiver, relays])

}
export default useNostrPools