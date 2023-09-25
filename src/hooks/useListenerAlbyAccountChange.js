import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useRef } from "react";
import { initNostrAccount } from "store/reducer/userReducer";
const useListenerAlbyAccountChange = () => {
  const dispatch = useDispatch()
  const intervarRef = useRef(null)
  const albyAccountChange = useCallback(async () => {
    console.log('11')
    dispatch(initNostrAccount(''));
    const albyNostrAccount = await window.nostr.getPublicKey();
    dispatch(initNostrAccount(albyNostrAccount));
  }, [dispatch])

  const onListenerNostr = useCallback(async () => {
    intervarRef.current = setTimeout(() => {
      if (window.nostr) {
        if (window.nostr.on) {
          window.nostr?.on('accountChanged', albyAccountChange)
        } else {
          window.nostr?.getRelays();
        }
      } else {
        console.log('trigger onListenerNostr again');
        onListenerNostr();
      }
    }, 1000);

  }, [albyAccountChange])
  useEffect(() => {
    onListenerNostr();
    return () => {
      clearTimeout(intervarRef.current);
      if (window.nostr?.off) {
        window.nostr.off('accountChanged', albyAccountChange)
      }
    };

  }, [albyAccountChange, onListenerNostr])
}
export default useListenerAlbyAccountChange