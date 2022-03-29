const Factory = artifacts.require("./PackFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(Factory, "Pack_Test", "BunT");
};
