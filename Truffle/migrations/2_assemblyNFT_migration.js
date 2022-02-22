const Assembly = artifacts.require("./AssemblyNFT.sol");

module.exports = function(deployer) {
  deployer.deploy(Assembly, "LepriBundle", "L3P", 0);
};
