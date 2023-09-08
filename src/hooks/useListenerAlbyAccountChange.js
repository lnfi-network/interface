import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useState } from "react";
import { initNostrAccount } from "store/reducer/userReducer";
const useListenerAlbyAccountChange = () => {
  const dispatch = useDispatch()

  const albyAccountChange = useCallback(async () => {
    dispatch(initNostrAccount(''));
    const albyNostrAccount = await window.nostr.getPublicKey();
    dispatch(initNostrAccount(albyNostrAccount));
  }, [dispatch])


  useEffect(() => {
    setTimeout(() => {
      if (window.nostr) {
        window.nostr.on('accountChanged', albyAccountChange)
      }
    }, 1000)

    return () => {
      if (window.nostr) {
        window.nostr.off('accountChanged', albyAccountChange)
      }
    }
  }, [albyAccountChange])
}
export default useListenerAlbyAccountChange