import dayjs from "dayjs";
import { SimplePool, nip19, nip04, getEventHash, getPublicKey, getSignature } from "nostr-tools";
import { useSelector } from "react-redux";
import { useRef, useContext, createContext } from 'react'
const NostrContext = createContext()
export function NostrProvider2({ children }) {
  const pool = new SimplePool();
  return <NostrContext.Provider value={{ pool }}>{children}</NostrContext.Provider>
}
export function useNostr() {
  return useContext(NostrContext);
}
const useNostrPools = () => {
  const { pool } = useNostr();
  const getWillSendEvent = async ({ message, kind = 4, targetPubkey, privateKey, tags }) => {
    if (!message) {
      throw new Error("No message provided.");
    }
    let ciphertext = "";
    if (kind === 4 && targetPubkey) {
      ciphertext = await nip04.encrypt(privateKey, targetPubkey, message);
    } else {
      ciphertext = message;
    }
    const created_at = dayjs().unix();
    let event = {
      content: ciphertext,
      kind: kind,
      tags: tags,
      created_at: created_at,
      pubkey: getPublicKey(privateKey)
    };
    event.id = getEventHash(event);
    event.sig = getSignature(event, privateKey);
    console.log('event', event)
    return event;
  }

  const execQueryNostrByCommand = async ({ queryCommand, sendToNostrAddress, robotPrivatekey, nonce = null }) => {
    const decodeSendTo = nip19.decode(sendToNostrAddress).data
    const reciver = getPublicKey(robotPrivatekey);
    let result = null
    const kind = 4
    const tags = [
      ["p", decodeSendTo],
      ["r", "json"]
    ]
    if (nonce) {
      tags.push(["n", `${nonce}`]);
    }
    const willSendEvent = await getWillSendEvent({
      message: queryCommand,
      kind: kind,
      targetPubkey: decodeSendTo,
      privateKey: robotPrivatekey,
      tags: tags,
    });


    const filter = {
      kinds: [kind],
      since: dayjs().unix(),
      '#e': [willSendEvent.id],
      '#p': [reciver]
    }
    pool.publish(relays, willSendEvent);

    const event = await pool.get(relays, filter);
    if (!event) {
      console.log('time out')
      return { code: 400, data: 'timeout', message: 'timeout' }
    }
    const content = event.content;
    const decryptContent = await nip04.decrypt(robotPrivatekey, decodeSendTo, content)

    if (decryptContent) {
      result = JSON.parse(decryptContent)
      return result;
    }
  }
}
export default useNostrPools