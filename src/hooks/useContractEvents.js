import { useMoralis } from "react-moralis";
import { assemblyABI } from "Constant/constant";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

export const useContractEvents = () => {
  const { account } = useMoralis();
  const assemblyABIJson = JSON.parse(assemblyABI);

  var arrayOfAddress;
  var arrayOfNumber;
  var salt;

  const retrieveCreatedAssemblyEvent = async (_pack, _contractAdd) => {
    const instance = await new web3.eth.Contract(assemblyABIJson, _contractAdd, { from: account });
    var pack;

    _pack.length > 0 ? (pack = _pack[0]) : (pack = _pack);

    await instance
      .getPastEvents("AssemblyAsset", {
        filter: { tokenId: pack.token_id },
        fromBlock: pack.block_number,
        toBlock: pack.block_number
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
