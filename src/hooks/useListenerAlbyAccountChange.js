import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useRef } from "react";
import { initNostrAccount } from "store/reducer/userReducer";
const useListenerAlbyAccountChange = () => {
  const dispatch = useDispatch()
  const intervarRef = useRef(null)
  const albyAccountChange = useCallback(async () => {
    dispatch(initNostrAccount(''));
    const albyNostrAccount = await window.nostr.getPublicKey().catch(e => {
      console.log(e.message)
    });
    dispatch(initNostrAccount(albyNostrAccount));
  }, [dispatch])

  const onListenerNostr = useCallback(async () => {
    intervarRef.current = setTimeout(async () => {
      if (window.nostr) {
        if (window.nostr.on) {
          await window.nostr?.on('accountChanged', albyAccountChange).catch(e => {
            console.log('accountChangeError:', e.message)
          })
        } else {
          /* window.nostr?.getRelays().catch(e => {
            console.log(e.message)
          }); */
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
        window.nostr.off('accountChanged', albyAccountChange).catch(e => {
          console.log('off error', e.message)
        })
      }
    };

  }, [albyAccountChange, onListenerNostr])
}
export default useListenerAlbyAccountChange