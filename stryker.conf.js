module.exports = function(config) {
  config.set({
    mutator: "javascript",
    packageManager: "yarn",
    reporters: ["clear-text", "progress", "dashboard"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off"
  });
};
