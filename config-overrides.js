/* eslint-disable no-undef */
const { override, addBabelPlugin, useBabelRc, addWebpackPlugin, addWebpackModuleRule } = require("customize-cra");


const ProgressBarPlugin = require("progress-bar-webpack-plugin");

const rewiredMap = () => (config) => {
  config.devtool = config.mode === "development" ? "cheap-module-source-map" : false;

  if (config.mode !== "development") {
    config.devtool = false;
    /* invade(config.optimization.minimizer, "TerserPlugin", (e) => {
      e.options.extractComments = false;
      e.options.minimizer.options.compress.drop_console = true;
      e.options.minimizer.options.compress.drop_debugger = true;
    }); */
    config.optimization.runtimeChunk = "single";
    config.optimization.splitChunks = {
      chunks: "all",
      minChunks: 1,
      maxSize: 1000000,
      cacheGroups: {
        baseChunks: {
          name: "base.chunks",
          test: (module) => /react|react-dom|react-router-dom/.test(module.context),
          priority: 30
        },
        libChunks: {
          name: "lib.chunks",
          test: (module) =>
            /react-redux|redux|axios|dayjs|lodash|lockr|bignumber|classnames|buffer|lingui|EventEmitter|ahooks|immer|md5|sass|viem/.test(
              module.context
            ),
          priority: 20
        },
        web3Chunks: {
          name: "web3.chunks",
          test: (module) => /wagmi|providers|units|ethersproject|ethers|graphql|urql|nostr-tools/.test(module.context),
          priority: 15
        },
        uiChunks: {
          name: "ui.chunks",
          test: (module) => /antd|@ant-design\/icons|echarts|emoji-mart/.test(module.context),
          priority: 10
        },
        default: {
          name: "common.chunks",
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    };
  }
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve('buffer'),
  })
  config.resolve.fallback = fallback;

  return config;
};

module.exports = override(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc(),
  rewiredMap(),
  addWebpackModuleRule({
    test: /\.po$/,
    use: { loader: "@lingui/loader" }
  }),
  addWebpackPlugin(
    new ProgressBarPlugin()
  ),

);
