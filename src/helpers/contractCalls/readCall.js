import Moralis from "moralis";
import { allowanceABI, assemblyABIJson, getNameABI } from "constant/abis";
import cloneDeep from "lodash/cloneDeep";
import { openNotification } from "helpers/notifications";

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

// Get the admin address
export const getAdminAddress = async (contractAddress) => {
  const readOptions = {
    contractAddress: contractAddress,
    functionName: "owner",
    abi: assemblyABIJson
  };

  try {
    const owner = await Moralis.executeFunction(readOptions);
    return owner;
  } catch (error) {
    console.log(error);
  }
};

// Check existing allowance for a single ERC20 token
export const checkERC20allowance = async (_owner, ERC20address, contractAddress) => {
  const readOptions = {
    contractAddress: ERC20address,
    functionName: "allowance",
    abi: allowanceABI,
    params: {
      owner: _owner,
      spender: contractAddress
    }
  };

  try {
    const res = await Moralis.executeFunction(readOptions);
    return res.toString();
  } catch (error) {
    console.log(error);
  }
};

// Check existing approval for an array of assets (tokens & NFTs), return an array
export const checkMultipleAssetsApproval = async (addresses, numbers, walletAddress, contractAddress) => {
  const clonedAddresses = cloneDeep(addresses);
  var existingAllowance = [];
  var ERC20add = clonedAddresses.splice(0, numbers[1]);

  if (ERC20add.length > 0) {
    for (let i = 0; i < ERC20add.length; i++) {
      const readOptions = {
        contractAddress: ERC20add[i].toString(),
        functionName: "allowance",
        abi: allowanceABI,
        params: {
          owner: walletAddress,
          spender: contractAddress
        }
      };

      try {
        const res = await Moralis.executeFunction(readOptions);
        existingAllowance[i] = res.toString();
      } catch (error) {
        let title = "Error checking allowance";
        let msg = "Something went wrong while checking your allowances. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
    }
  }

  const uniqueAddrs = [...new Set(clonedAddresses)];
  if (uniqueAddrs.length > 0) {
    for (let i = 0; i < uniqueAddrs.length; i++) {
      const readOptions = {
        contractAddress: uniqueAddrs[i].toString(),
        functionName: "isApprovedForAll",
        abi: [
          {
            inputs: [
              { internalType: "address", name: "owner", type: "address" },
              { internalType: "address", name: "operator", type: "address" }
            ],
            name: "isApprovedForAll",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function"
          }
        ],
        params: {
          owner: walletAddress,
          operator: contractAddress
        }
      };

      try {
        const res = await Moralis.executeFunction(readOptions);
        existingAllowance[i + numbers[1]] = res;
      } catch (error) {
        let title = "Error checking allowance";
        let msg = "Something went wrong while checking your allowances. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
    }
  }
  return existingAllowance;
};
