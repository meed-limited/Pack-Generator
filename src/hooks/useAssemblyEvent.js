import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

export const useAssemblyEvent = () => {
  const { walletAddress, assemblyABI } = useMoralisDapp();
  const contractABIJson = JSON.parse(assemblyABI);

  var arrayOfAddress;
  var arrayOfNumber;
  var salt;

  const retrieveAssemblyEvent = async (_bundle, _contractAdd) => {
    const instance = await new web3.eth.Contract(contractABIJson, _contractAdd, { from: walletAddress });

    await instance
      .getPastEvents("AssemblyAsset", {
        filter: { tokenId: _bundle[0].token_id },
        fromBlock: _bundle[0].block_number,
        toBlock: _bundle[0].block_number
      })
      .then((event) => {
        arrayOfAddress = event[0].returnValues.addresses;
        arrayOfNumber = event[0].returnValues.numbers;
        salt = event[0].returnValues.salt;
      });

    return [arrayOfAddress, arrayOfNumber, salt];
  };

  return { retrieveAssemblyEvent };
};
