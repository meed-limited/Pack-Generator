const Factory = artifacts.require("./BundleFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(Factory, "Bundle_Test", "BunT");
};
