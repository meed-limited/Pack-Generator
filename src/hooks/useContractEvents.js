import { assemblyABIJson } from "../constant/abis";

export const useContractEvents = () => {
  const ethers = require("ethers");

  const getPackData = async (_pack, contractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, assemblyABIJson, provider);

    var pack;
    _pack?.length > 0 ? (pack = _pack[0]) : (pack = _pack);

    const bn = ethers.BigNumber.from(pack.token_id);

    const filter = contract.filters.AssemblyAsset(null, bn);
    const block = parseInt(pack.block_number_minted);
    const events = await contract.queryFilter(filter, block, block);

    const addrs = events[0].args.addresses.toString();
    const arrayOfAddress = addrs.split(",");
    const numbers = events[0].args.numbers.toString();
    const arrayOfNumber = numbers.split(",");
    const salt = events[0].args.salt.toString();

    const packData = {
      arrayOfAddress: arrayOfAddress,
      arrayOfNumber: arrayOfNumber,
      salt: salt
    };
    return packData;
  };

  return { getPackData };
};
