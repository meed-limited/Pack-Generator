import { Moralis } from "moralis";
import cloneDeep from "lodash/cloneDeep";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "./approval";
import { openNotification } from "./notifications";
import { getExplorer } from "./networks";

const getNameABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "_name", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
];

// Get the name of a specific NFT collection
export const getContractName = async (address) => {
  const readOptions = {
    contractAddress: address,
    functionName: "name",
    abi: getNameABI,
    params: {}
  };

  try {
    const data = await Moralis.executeFunction(readOptions);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Approve all assets for Single Pack
export const singleApproveAll = async (account, address, numbers, contractAddr) => {
  const addressArr = cloneDeep(address);
  const currentApproval = await checkMultipleAssetsApproval(addressArr, numbers, account, contractAddr);

  var ERC20add = [];
  var count = 4;
  ERC20add = address.splice(0, numbers[1]);
  try {
    for (let i = 0; i < ERC20add.length; i++) {
      let toAllow = numbers[count].toString();
      if (parseInt(currentApproval[i]) < parseInt(toAllow)) {
        await approveERC20contract(ERC20add[i], toAllow, contractAddr);
        count++;
      }
    }

    var pointerNFT = numbers[1];
    let uniqueAddrs = [...new Set(address)];
    for (let i = 0; i < uniqueAddrs.length; i++) {
      if (currentApproval[pointerNFT] === false) {
        await approveNFTcontract(uniqueAddrs[i], contractAddr);
      }
      pointerNFT++;
    }
  } catch (error) {
    let title = "Approval error";
    let msg = "Oops, something went wrong while approving some of your pack's assets!";
    openNotification("error", title, msg);
    console.log(error);
  }
};

// Mint Single Pack
export const singlePackMint = async (ABI, chainId, account, msgValue, assetContracts, assetNumbers, contractAddr) => {
  var receipt = [];
  const sendOptions = {
    contractAddress: contractAddr,
    functionName: "mint",
    abi: ABI,
    msgValue: msgValue,
    params: {
      _to: account,
      _addresses: assetContracts,
      _numbers: assetNumbers
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction
      .wait(2)
      .then((result) => {
        receipt = { txHash: result.transactionHash, link: `${getExplorer(chainId)}tx/${result.transactionHash}` };
      })
      .catch((err) => {
        console.log(err);
      });
    return receipt;
  } catch (error) {
    let title = "Unexpected error";
    let msg = "Oops, something went wrong while creating your pack!";
    openNotification("error", title, msg);
    console.log(error);
  }
};


// Approve all assets for Batch Pack
export const multipleApproveAll = async (account, address, numbers, packNumber, contractAddr) => {
  const currentMultipleApproval = await checkMultipleAssetsApproval(address, numbers, account, contractAddr);
  var ERC20add = [];
  var count = 4;
  ERC20add = address.splice(0, numbers[1]);
  try {
    for (let i = 0; i < ERC20add.length; i++) {
      let toAllow = (numbers[count] * packNumber).toString();
      if (parseInt(currentMultipleApproval[i]) < parseInt(toAllow)) {
        await approveERC20contract(ERC20add[i], toAllow, contractAddr);
        count++;
      }
    }

    var pointerNFT = numbers[1];
    let uniqueAddrs = [...new Set(address)];

    for (let i = 0; i < uniqueAddrs.length; i++) {
      if (currentMultipleApproval[pointerNFT] === false) {
        await approveNFTcontract(uniqueAddrs[i], contractAddr);
      }
      pointerNFT++;
    }
  } catch (error) {
    let title = "Approval error";
    let msg = "Oops, something went wrong while approving some of your packs's assets!";
    openNotification("error", title, msg);
    console.log(error);
  }
}