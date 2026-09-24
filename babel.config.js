module.exports = api => {
  const isTest = api.env('test');
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ...(isTest
        ? []
        : [
            [
              'module:react-native-dotenv',
              {
                moduleName: '@env',
                path: '.env',
              },
            ],
          ]),
      'react-native-reanimated/plugin',
    ],
  };
};
