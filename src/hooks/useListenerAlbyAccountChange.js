import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect } from "react";
import { initNostrAccount } from "store/reducer/userReducer";
const useListenerAlbyAccountChange = () => {
  const { nostrAccount } = useSelector(({ user }) => user);
  const dispatch = useDispatch()
  const albyAccountChange = useCallback(async () => {
    dispatch(initNostrAccount(''));
    const albyNostrAccount = await window.nostr.getPublicKey();
    dispatch(initNostrAccount(albyNostrAccount));
  }, [dispatch])
  useEffect(() => {
    if (window.nostr) {
      window.nostr.on('accountChanged', albyAccountChange)
      return () => {
        window.nostr.off('accountChanged', albyAccountChange)
      }
    }
  }, [albyAccountChange])
}
export default useListenerAlbyAccountChange