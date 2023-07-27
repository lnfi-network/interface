import { createConfig, configureChains } from "wagmi";
import { mainnet, goerli, arbitrum, bsc, optimism } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { alchemyProvider } from "wagmi/providers/alchemy";
const arrJsonRpcUri = {
  [mainnet.id]: "https://eth.llamarpc.com"
};
// [mainnet, goerli, arbitrum, bsc, optimism]
const supportChains = (process.env.REACT_APP_CURRENT_ENV === "dev" || process.env.REACT_APP_CURRENT_ENV === 'test') ? [goerli] : [mainnet];
const { chains, publicClient, webSocketPublicClient } = configureChains(supportChains, [
  alchemyProvider({ apiKey: "0QZmS8gya0KlkUP09WcwEPj98SjPxMtw" }),
  publicProvider(),
  jsonRpcProvider({
    rpc: (chain) => {
      return {
        http: arrJsonRpcUri[chain.id]
      };
    }
  })
]);

const connectorItems = [
  new MetaMaskConnector({ chains }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: "nostr"
    }
  }),
  new InjectedConnector({
    chains,
    options: {
      name: "Injected",
      shimDisconnect: true
    }
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: "2dbfdce8f774975e4c47ca92870dba88"
    }
  })
];

const config = createConfig({
  autoConnect: true,
  connectors: connectorItems,
  publicClient,
  webSocketPublicClient
});
export default config;
