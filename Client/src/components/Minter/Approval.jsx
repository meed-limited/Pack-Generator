import { openNotification } from "components/Notification";

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
      let title = "ERC20 Approval Set";
      let msg = `The allowance of your ERC20 token has been set.`;
      openNotification("success", title, msg);
      console.log("ERC20 Approval Received");
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
          {
            internalType: "address",
            name: "operator",
            type: "address"
          },
          {
            internalType: "bool",
            name: "_approved",
            type: "bool"
          }
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
      let title = "NFT Approval Set";
      let msg = "The allowance for your NFTs collection has been set.";
      openNotification("success", title, msg);
      console.log("NFTs Approval set");
    },
    onError: (error) => {
      let title = "NFTs Approval denied";
      let msg = "Something went wrong, the allowance hasn't been set.";
      openNotification("error", title, msg);
      console.log(error);
    }
  });
}
