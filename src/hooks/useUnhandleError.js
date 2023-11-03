import { useCallback, useEffect } from "react";

export default function useUnhandledError() {
  const onUnHandleedRejection = useCallback((e) => {
    console.log('error--->', e.message)
    e.preventDefault();
    return true;
  }, [])
  const onError = useCallback((e) => {
    console.log(e.message)
  }, [])
  useEffect(() => {
    window.addEventListener("unhandledRejection", onUnHandleedRejection);
    window.addEventListener("error", onError);
    window.onerror = onError
    return () => {
      window.removeEventListener("unhandledRejection", onUnHandleedRejection);
      window.removeEventListener('error', onError);
    }
  }, [onError, onUnHandleedRejection])

}