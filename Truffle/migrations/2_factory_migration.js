const Factory = artifacts.require("PackFactory");

module.exports = function (deployer) {
  deployer.deploy(Factory);
};
