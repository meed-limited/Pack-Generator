import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

export const useContractEvents = () => {
  const { walletAddress, assemblyABI, factoryABI } = useMoralisDapp();
  const assemblyABIJson = JSON.parse(assemblyABI);
  const factoryABIJson = JSON.parse(factoryABI);

  var arrayOfAddress;
  var arrayOfNumber;
  var salt;

  const retrieveCreatedAssemblyEvent = async (_bundle, _contractAdd) => {
    const instance = await new web3.eth.Contract(assemblyABIJson, _contractAdd, { from: walletAddress });

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

  const retrieveClaimedAssemblyEvent = async (_bundle, _contractAdd) => {
    const instance = await new web3.eth.Contract(assemblyABIJson, _contractAdd, { from: walletAddress });

    await instance
      .getPastEvents("AssemblyAssetClaimed", {
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


  // TODO: BUNDLE args not needed, to edit
  const claimedAssemblyListener = async (_bundle, _contractAdd) => {
    const instance = await new web3.eth.Contract(assemblyABIJson, _contractAdd, { from: walletAddress });

    await instance
    .events.AssemblyAssetClaimed({
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

  // const newCollectionListener = async (_contractAdd) => {
  //   const factoryInstance = await new web3.eth.Contract(factoryABIJson, _contractAdd, { from: walletAddress });

  //   await factoryInstance
  //   .events.NewCustomCollectionCreated({
  //       filter: { owner: walletAddress},
  //       fromBlock: "latest"
  //     })
  //     .on('data', event => {
  //       console.log(event)
  //       // arrayOfAddress = event[0].returnValues.addresses;
  //       // arrayOfNumber = event[0].returnValues.numbers;
  //       // salt = event[0].returnValues.salt;
  //     })
  //     .on('error', console.error);
      
      
  //   //return [arrayOfAddress, arrayOfNumber, salt];
  // };

  return { retrieveCreatedAssemblyEvent, retrieveClaimedAssemblyEvent, claimedAssemblyListener };
};
