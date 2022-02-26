import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

export const useContractEvents = () => {
  const { walletAddress, assemblyABI } = useMoralisDapp();
  const assemblyABIJson = JSON.parse(assemblyABI);

  var arrayOfAddress;
  var arrayOfNumber;
  var salt;

  const retrieveCreatedAssemblyEvent = async (_pack, _contractAdd) => {
    const instance = await new web3.eth.Contract(assemblyABIJson, _contractAdd, { from: walletAddress });

    await instance
      .getPastEvents("AssemblyAsset", {
        filter: { tokenId: _pack[0].token_id },
        fromBlock: _pack[0].block_number,
        toBlock: _pack[0].block_number
      })
      .then((event) => {
        arrayOfAddress = event[0].returnValues.addresses;
        arrayOfNumber = event[0].returnValues.numbers;
        salt = event[0].returnValues.salt;
      });
      
    return [arrayOfAddress, arrayOfNumber, salt];
  };

  return { retrieveCreatedAssemblyEvent };
};
