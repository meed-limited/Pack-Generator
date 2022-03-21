import { useMoralis } from "react-moralis";
import { assemblyABI, getAssemblyAddress } from "Constant/constant";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

export const useContractEvents = () => {
  const { account, chainId } = useMoralis();
  const assemblyABIJson = JSON.parse(assemblyABI);

  /*TEST with ethers.js: */
  const contractAddress = getAssemblyAddress(chainId);
  const ethers = require("ethers");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, assemblyABIJson, provider);
  /*END TEST with ethers.js: */

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

  /*TEST with ethers.js: */
  const getPackData = async (_pack) => {
    var pack;
    
    _pack?.length > 0 ? (pack = _pack[0]) : (pack = _pack);

    let packID = pack.token_id;
    let hexPackID = ethers.utils.hexlify(packID);

    const filter = {
      address: contractAddress,
      topics: [
        ethers.utils.id("AssemblyAsset(address,uint256,uint256,address[],uint256[])"),
        null,
        hexPackID
      ]};

    //const filterPack = contract.filters.AssemblyAsset([null, packID]);
    const result = await contract.queryFilter(filter, pack.block_number, pack.block_number);
    console.log(result);
  };
  /*END TEST with ethers.js: */

  return { retrieveCreatedAssemblyEvent, getPackData };
};
