import {
  ARBITRUM,
  ARBITRUM_TESTNET,
  AVALANCHE,
  AVALANCHE_FUJI,
  GOERLI,
  ETH_MAINNET,
  MAINNET,
  STACKS
} from "config/chains";
import arbitrum from "img/ic_arbitrum_24.svg";
import avalanche from "img/ic_avalanche_24.svg";
import avalancheTestnet from "img/ic_avalanche_testnet_24.svg";
import goerli from "img/ic_goerli_light.svg";
import unknown from "img/unknown-logo.png";
import ethereum from "img/rsz_ethereum.jpg";
import binance from "img/rsz_binance.jpg";

// import eth from "img/ic_goerli_light.svg";
const ICONS = {
  [ARBITRUM]: {
    network: arbitrum
  },
  [AVALANCHE]: {
    network: avalanche
  },
  [GOERLI]: {
    network: goerli
  },
  [ETH_MAINNET]: {
    network: ethereum
  },
  [MAINNET]: {
    network: binance
  },
  [STACKS]: {
    network: unknown
  },
  [ARBITRUM_TESTNET]: {
    network: arbitrum
  },
  [AVALANCHE_FUJI]: {
    network: avalancheTestnet
  }
};

export function getIcon(chainId, label) {
  if (chainId in ICONS) {
    if (label in ICONS[chainId]) {
      return ICONS[chainId][label] || unknown;
    }
  }
}
export function getIcons(chainId) {
  if (!chainId) return;
  if (chainId in ICONS) {
    return ICONS[chainId] || unknown;
  }
}
