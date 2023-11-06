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
/* NEW(0) ： 新创建，未付费
PaidReceive(1),：收到付费信息（流程会很短时间跳过）
PaidConfirming(2) ：等待付费链上确认
PendingBroadCast(3), 确认mint付费收到，等待广播资产创建广播
BroadCast(4), 资产创建已经广播，等待链上确认
BroadCastConfirm(5),链上已经确认资产创建成功，等待系统自动导入资产
ImportFinished(6), 导入资产成功，等待用户claim资产
SUCCESS(9),成功结束
FAILED(99);失败结束 */
export const ISSUE_ASSET_STATUS = {
  NEW: { value: 0, description: '' },
  PAIED_RECEIVED: { value: 1, description: 'Pending Payment' },
  PAIED_CONFIRMING: { value: 2, description: 'Verifying Payment' },
  PENDING_BROADCAST: { value: 3, description: 'Received Payment' },
  BROADCASTING: { value: 4, description: 'Issuing Asset' },
  BROADCASTING_CONFIRM: { value: 5, description: 'Importing Asset' },
  IMPORT_FINISHED: { value: 6, description: 'Pending Claim' },
  SUCCESS: { value: 9, description: 'Success' },
  FAILED: { value: 99, description: 'Failed' }
}
export const QUOTE_ASSET = process.env.REACT_APP_QUOTE_TOKEN
export const FEE = 0.004
export const MINT_SERVICE_FEE = 1000