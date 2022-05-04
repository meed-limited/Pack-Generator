const Assembly = artifacts.require("./AssemblyNFT.sol");

module.exports = function(deployer) {
  deployer.deploy(Assembly, "Pack-Generator Collection", "PGNFT", 0, "https://ipfs.moralis.io:2053/ipfs/QmZ7wHkJeVsgTXz8iWZkEZAPrKpWsn5YQUAczzyb22ADjJ");
};
