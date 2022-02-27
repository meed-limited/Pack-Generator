import { openNotification } from "components/Notification";
import cloneDeep from "lodash/cloneDeep";

// Allow a specific amount of an ERC20 address
export async function approveERC20contract(ERC20address, allowance, contractAddress, processor) {
  const ops = {
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

  await processor.fetch({
    params: ops,
    onSuccess: () => {
      let value = (allowance / ("1e" + 18)).toString();
      let title = "ERC20 Approval set";
      let msg = `The allowance of your ERC20 token has been succesfully set to ${value}.`;
      openNotification("success", title, msg);
      console.log(`ERC20 Approval set`);
    },
    onError: (error) => {
      let title = "ERC20 Approval denied";
      let msg = "Something went wrong, the allowance hasn't been set.";
      openNotification("error", title, msg);
      console.log(error);
    }
  });
}

// Approve a whole NFT collection (work for both ERC721 && ERC1155)
export async function approveNFTcontract(NFTaddress, contractAddress, processor) {
  const ops = {
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

  await processor.fetch({
    params: ops,
    onSuccess: () => {
      let title = "NFT Approval set";
      let msg = "The allowance for your NFTs collection has been set.";
      openNotification("success", title, msg);
      console.log("NFTs Approval set");
    },
    onError: (error) => {
      let title = "NFT Approval denied";
      let msg = "Something went wrong, the allowance hasn't been set.";
      openNotification("error", title, msg);
      console.log(error);
    }
  });
}

// Check existing allowance for a token ERC20
export async function checkSingleAssetApproval(assetAddress, walletAddress, contractAddress, processor) {
  const ops = {
    contractAddress: assetAddress,
    functionName: "allowance",
    abi: [
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
    ],
    params: {
      owner: walletAddress,
      spender: contractAddress
    }
  };

  await processor.fetch({
    params: ops,
    onSuccess: (response) => {
      console.log(response);
    },
    onError: (error) => {
      let title = "Error checking allowance";
      let msg = "Something went wrong while checking your allowances. Pleas try again.";
      openNotification("error", title, msg);
      console.log(error);
    }
  });
}

// Check existing approval for an array of assets (tokens & NFTs), return an array
export async function checkMultipleAssetsApproval(addresses, numbers, walletAddress, contractAddress, processor) {
  const clonedAddresses = cloneDeep(addresses);
  var existingAllowance = [];
  var ERC20add = clonedAddresses.splice(0, numbers[1]);

  for (let i = 0; i < ERC20add.length; i++) {
    const ops = {
      contractAddress: ERC20add[i].toString(),
      functionName: "allowance",
      abi: [
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
      ],
      params: {
        owner: walletAddress,
        spender: contractAddress
      }
    };

    await processor.fetch({
      params: ops,
      onSuccess: (response) => {
        existingAllowance[i] = response;
      },
      onError: (error) => {
        let title = "Error checking allowance";
        let msg = "Something went wrong while checking your allowances. Pleas try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  for (let i = 0; i < clonedAddresses.length; i++) {
    const ops = {
      contractAddress: clonedAddresses[i].toString(),
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

    await processor.fetch({
      params: ops,
      onSuccess: (response) => {
        existingAllowance[i + numbers[1]] = response;
      },
      onError: (error) => {
        let title = "Error checking allowance";
        let msg = "Something went wrong while checking your allowances. Pleas try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }
  return existingAllowance;
}