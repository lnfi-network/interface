export const TOKEN_LIST = [
  { symbol: "USDT", value: process.env.REACT_APP_USDT_CONTRACT_ADDR, platform: "ETH" },
  {
    symbol: "ordi",
    value: "ordi",
    platform: "BTC"
  },
  {
    symbol: "meme",
    value: "meme",
    platform: "BTC"
  },
  {
    symbol: "punk",
    value: "punk",
    platform: "BTC"
  },
  {
    symbol: "pepe",
    value: "pepe",
    platform: "BTC"
  },
  {
    symbol: "gold",
    value: "gold",
    platform: "BTC"
  },
  {
    symbol: "lvdi",
    value: "lvdi",
    platform: "BTC"
  }
];
export const BTCEXPORE_PREFIX = "https://explorer.btc.com/btc/transaction/";
export const NOSTAR_TOKEN_SEND_TO = process.env.REACT_APP_NOSTR_TOKEN_SEND_TO;
export const NOSTR_MARKET_SEND_TO = process.env.REACT_APP_NOSTR_MARKET_SEND_TO;
//0, 待付费 1. 已付费 2. 进行中 9.成功 99. 失败
export const AssetDeployStatus = {
  0: "Waiting for payment result",
  1: "Received Payment",
  2: "Minting",
  9: "Mint Success",
  99: "Mint Failed",
}
export const QUOTE_ASSET = process.env.REACT_APP_QUOTE_TOKEN