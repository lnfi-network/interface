import { nip19, getPublicKey, generatePrivateKey } from "nostr-tools";
import { ethers } from "ethers";
import { t } from "@lingui/macro";
import dayjs from "dayjs";
import { limitDecimals, numberWithCommas } from "lib/numbers";

const { _TypedDataEncoder } = ethers.utils;
import * as Lockr from "lockr";
export function throttle(fn, wait) {
  let prev = 0;
  return function (...parmas) {
    let now = new Date().getTime();
    let remaining = wait - (now - prev);

    if (remaining <= 0) {
      prev = now;
      fn.apply(null, parmas);
    }
  };
}
export function getDecodePk(npubPk) {
  return nip19.decode(npubPk).data;
}
export function getNpubPk(decodePk) {
  return nip19.npubEncode(decodePk);
}
export function getDecodePkFromPrivateKey(privateKey) {
  return getPublicKey(nip19.decode(privateKey).data);
}
export function createNostrAddress() {
  const privateKey = generatePrivateKey();
  const decodedPubk = getPublicKey(privateKey);
  const npubPubk = nip19.npubEncode(decodedPubk);
  const accountInfo = {
    privateKey,
    decodedPubk,
    npubPubk
  };
  return accountInfo;
}

export function getLocalRobotPrivateKey() {
  if (!Lockr.get("lockRobotPrivateKey")) {
    const { privateKey } = createNostrAddress();
    Lockr.set("lockRobotPrivateKey", privateKey);
  }
  return Lockr.get("lockRobotPrivateKey");
}
export async function signTypedData({ domain = {}, types = [], value = [], account, library }) {
  if (!account) {
    throw new Error(t`You need connect your wallet first.`);
  }
  const primaryType = _TypedDataEncoder.getPrimaryType(types);

  const SignConfig = {
    domain: { ...domain },
    primaryType: primaryType,
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      ...types
    },
    message: { ...value }
  };
  const from = account;
  const params = [from, JSON.stringify(SignConfig)];
  const signature = await library.provider
    ?.request({
      method: "eth_signTypedData_v4",
      params,
      from
    })
    .catch((e) => {
      reject(new Error(e.message));
    });
  return signature;
}

// account is not optional
export function getSigner(provider, account) {
  return provider.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(provider, account) {
  const providerOrSiger = account ? getSigner(provider, account) : provider;
  return providerOrSiger;
}
export function isAddress(value) {
  try {
    return ethers.utils.getAddress(value);
  } catch {
    return false;
  }
}
// account is optional
export function getContractInstance(address, ABI, provider, account) {
  if (!isAddress(address) || address === ethers.constants.AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  const contract = new ethers.Contract(address, ABI, getProviderOrSigner(provider, account));
  return contract;
}
export function getJSON(eventContent) {
  const quotedStr = eventContent
    .replace(/!|！/, "")
    .replace(/([\w|\s\.\s+|\u4e00-\u9fa5\s?]+)/g, '"$1"')
    .replace(/=/g, ":");

  const ret = eval("(" + quotedStr + ")");

  return ret;
}
export function getStartEndTime(dateValue) {
  if (!dateValue) {
    return "";
  }
  if (dateValue == "yesterday") {
    const time = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    // const endTime = dayjs().endOf("week").add(1, "day").format("YYYY-MM-DD");
    return {
      startTime: time + " 00:00:00",
      endTime: time + " 23:59:59"
    };
  }
  if (dateValue == "week") {
    const startTime = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
    const endTime = dayjs().endOf("week").add(1, "day").format("YYYY-MM-DD");
    return {
      startTime: startTime + " 00:00:00",
      endTime: endTime + " 23:59:59"
    };
  }
  if (dateValue == "month") {
    const startTime = dayjs().startOf("month").format("YYYY-MM-DD");
    const endTime = dayjs().endOf("month").format("YYYY-MM-DD");
    return {
      startTime: startTime + " 00:00:00",
      endTime: endTime + " 23:59:59"
    };
  }
}
export function sleep(time = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
export function parseUSDT(usdtStr) {
  return usdtStr * 10 ** 6;
}
export function convertDollars(coin, price, placeholder = "--") {
  if (Number(coin) && price > 0) {
    //return `≈$${numberWithCommas(limitDecimals(coin * price, 4,"fllor"))}`
    return `≈$${numberWithCommas(limitDecimals(coin * price, 4, "floor"))}`;
  } else {
    return placeholder;
  }
}
export function statusMap(status) {
  let cls;
  let txt;
  let tip = "";
  switch (status) {
    case "INIT":
    case "PUSH_MARKET_SUCCESS":
    case "TRADE_PENDING":
      txt = "Unfilled";
      break;
    case "PART_SUCCESS":
      txt = "Partial";
      cls = "color-yellow";
      break;
    case "SUCCESS":
      cls = "color-green";
      txt = "Filled";
      break;
    case "CANCEL":
      txt = "Cancelled";
      break;
    case "INIT_FAIL":
      txt = "Order Failed";
      cls = "color-red";
      tip = "Place or take order failed, no asset deducted from your account.";
      break;
    case "CANCEL_FAIL":
      txt = "Cancel Failed";
      cls = "color-red";
      tip = "Order cancel failed.";
      break;
    case "TRADE_FAIL":
      txt = "Settlement Failed";
      cls = "color-red";
      tip = "Settlement failed, if deducted your asset, need waiting for refund.";
      break;
    case "INIT_PENDING":
      txt = "Deducting";
      tip = "If already deducted your asset, please waiting for settlement.";
      break;
    case "TAKE_LOCK":
      txt = "Pending Settlement";
      tip = "If already deducted your asset, please waiting for settlement.";
      break;
    case "CANCEL_PENDING":
      txt = "Cancel Pending";
      tip = "Refunding for order cancel, if failed to receive refund, please contact.";
      break;
    default:
      cls = "";
      txt = status || "";
      tip = "";
  }
  return {
    cls,
    txt,
    tip
  };
}
