module.exports = {
  multipass: true, // boolean. false by default

  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // // customize default plugin options
          // inlineStyles: {
          //   onlyMatchedOnce: false,
          // },
          // or disable plugins
          // collapseGroups: false,
          // cleanupIDs: false,
        },
      },
    },
    "removeRasterImages",
  ],
};
