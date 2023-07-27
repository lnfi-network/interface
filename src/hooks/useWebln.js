import { useCallback } from "react";
import { to } from 'await-to-js';
export default function useWebln() {
  const checkWebln = useCallback(async (webln) => {
    if (!webln) {
      throw new Error("Webln is not available.")
    } else {
      if (!webln.enabled) {
        const [err] = await to(webln.enable())
        if (err) {
          throw new Error(err.message);
        }
      }
      return webln.enabled;
    }
  }, [])
  const detecWebLNProvider = useCallback(async (timeoutParam) => {
    const timeout = timeoutParam ?? 3000;
    const interval = 100;
    let handled = false;

    return new Promise((resolve) => {
      if (window.webln) {
        handleWebLN();
      } else {
        document.addEventListener("webln:ready", handleWebLN, { once: true });

        let i = 0;
        const checkInterval = setInterval(function () {
          if (window.webln || i >= timeout / interval) {
            handleWebLN();
            clearInterval(checkInterval);
          }
          i++;
        }, interval);
      }

      function handleWebLN() {
        if (handled) {
          return;
        }
        handled = true;

        document.removeEventListener("webln:ready", handleWebLN);

        if (window.webln) {
          resolve(window.webln);
        } else {
          resolve(null);
        }
      }
    });
  }, [])

  const makeInvoice = useCallback(async (amount = 0, defaultMemo = "") => {
    const webln = await detecWebLNProvider();
    const enabled = await checkWebln(webln);
    if (enabled) {
      const invoice = await webln.makeInvoice({
        amount: amount,
        defaultMemo
      });
      return invoice;
    }
    return null;
  }, [checkWebln, detecWebLNProvider])

  const sendPayment = useCallback(async (paymentRequest) => {
    const webln = await detecWebLNProvider();
    const enabled = await checkWebln(webln);
    if (enabled) {
      const sendRet = await webln.sendPayment(paymentRequest);
      return sendRet;
    }
    return null;
  }, [checkWebln, detecWebLNProvider])

  return {
    makeInvoice,
    sendPayment
  }
}