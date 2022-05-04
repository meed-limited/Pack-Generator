import { Moralis } from "moralis";
import { openNotification } from "helpers/notifications";
import cloneDeep from "lodash/cloneDeep";

const allowanceABI = [
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

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

// Allow a specific amount of an ERC20 address
export const approveERC20contract = async (ERC20address, allowance, contractAddress) => {
  const sendOptions = {
    contractAddress: ERC20address,
    functionName: "approve",
    abi: [
      {
        constant: false,
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" }
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    params: {
      spender: contractAddress,
      amount: allowance
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction.wait();
    let value = (allowance / ("1e" + 18)).toString();
    let title = "ERC20 Approval set";
    let msg = `The allowance of your ERC20 token has been succesfully set to ${value}.`;
    openNotification("success", title, msg);
    console.log(`ERC20 Approval set`);
  } catch (error) {
    let title = "ERC20 Approval denied";
    let msg = "Something went wrong, the allowance hasn't been set.";
    openNotification("error", title, msg);
    console.log(error);
  }
};

// Approve a whole NFT collection (work for both ERC721 && ERC1155)
export const approveNFTcontract = async (NFTaddress, contractAddress) => {
  const sendOptions = {
    contractAddress: NFTaddress,
    functionName: "setApprovalForAll",
    abi: [
      {
        inputs: [
          { internalType: "address", name: "operator", type: "address" },
          { internalType: "bool", name: "_approved", type: "bool" }
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    params: {
      operator: contractAddress,
      _approved: true
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction.wait();
    let title = "NFT Approval set";
    let msg = "The allowance for your NFTs collection has been set.";
    openNotification("success", title, msg);
    console.log("NFTs Approval set");
  } catch (error) {
    let title = "NFT Approval denied";
    let msg = "Something went wrong, the allowance hasn't been set.";
    openNotification("error", title, msg);
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
