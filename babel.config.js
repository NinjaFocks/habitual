module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Note: react-native-reanimated/plugin is no longer needed here.
    // babel-preset-expo handles it automatically in SDK 54.
  };
};
