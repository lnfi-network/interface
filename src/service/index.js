export const getFeeSummary = async () => {
  return await (
    await fetch("https://unisat.io/wallet-api-v4/default/fee-summary", {
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "none",
        "x-address": "bc1qzrgykyfuyredsgkw3zu4zkplkyxuv4na6mstp5",
        "x-channel": "store",
        "x-client": "UniSat Wallet",
        "x-udid": "zkkfXpanHmqw",
        "x-version": "1.1.21"
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    })
  ).json();
};
