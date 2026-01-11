const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 在开发模式下，更改 source-map 配置以避免 CSP 的 eval() 问题
  if (config.mode === 'development') {
    config.devtool = 'cheap-module-source-map';
  }

  return config;
};
