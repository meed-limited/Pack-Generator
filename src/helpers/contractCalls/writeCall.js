import { Moralis } from "moralis";
import cloneDeep from "lodash/cloneDeep";
import { assemblyABIJson, customAssemblyABIJson, marketABIJson } from "../../constant/abis";
import { checkMultipleAssetsApproval } from "./readCall";
import { getExplorer } from "../networks";
import { openNotification } from "../notifications";
import { FileSearchOutlined } from "@ant-design/icons";

const ethers = require("ethers");

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

// Mint Single Pack
export const singlePackMint = async (chainId, account, msgValue, assetContracts, assetNumbers, contractAddr) => {
  var receipt = [];
  const sendOptions = {
    contractAddress: contractAddr,
    functionName: "safeMint",
    abi: assemblyABIJson,
    msgValue: msgValue,
    params: {
      _to: account,
      _addresses: assetContracts,
      _numbers: assetNumbers
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction.wait().then((result) => {
      receipt = {
        isSuccess: true,
        txHash: result.transactionHash,
        link: `${getExplorer(chainId)}tx/${result.transactionHash}`
      };
      const encodedTopic = result.events.filter((item) => item.event === "AssemblyAsset"); // Get AssemblyAsset event log
      const iface = new ethers.utils.Interface(assemblyABIJson); // Initiate interface(ABI)
      const data = encodedTopic[0].data; // Get log.data
      const topics = encodedTopic[0].topics; // Get log.topics
      const decodedTopic = iface.parseLog({ data, topics }); // Decode data + topics
      const packId = decodedTopic.args[1].toString();
      const salt = decodedTopic.args[2].toString();
      //const temp = decodedTopic.args[1]._hex; // Get tokenId in hex BN format
      //const packId = ethers.BigNumber.from(temp).toString(); // Convert to readable tokenId hash

      const CreatedSinglePacks = Moralis.Object.extend("CreatedSinglePacks");
      const createdSinglePacks = new CreatedSinglePacks();
      createdSinglePacks.set("address", contractAddr);
      createdSinglePacks.set("firstHolder", account);
      createdSinglePacks.set("chainId", chainId);
      createdSinglePacks.set("block_number", result.blockNumber);
      createdSinglePacks.set("salt", salt);
      createdSinglePacks.set("addresses", assetContracts);
      createdSinglePacks.set("numbers", assetNumbers);
      createdSinglePacks.set("transaction_hash", result.transactionHash);
      createdSinglePacks.set("tokenId", packId);
      createdSinglePacks.save();
    });
  } catch (error) {
    receipt = { isSuccess: false };
    let title = "Unexpected error";
    let msg = "Oops, something went wrong while creating your pack!";
    openNotification("error", title, msg);
    console.log(error);
  }
  return receipt;
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
};

// Mint Batch Pack
export const multiplePackMint = async (
  assetContracts,
  assetNumbers,
  packNum,
  nativeFee,
  contractAddr,
  account,
  packNumber,
  chainId,
  customCollectionData
) => {
  var packReceipt;
  const addressArr = cloneDeep(assetContracts);
  const fee = parseInt(nativeFee) * parseInt(packNum);
  const eth = parseInt(assetNumbers[0]) * parseInt(packNum);
  const msgValue = (parseInt(fee) + parseInt(eth)).toString();
  var txHash;

  const sendOptions = {
    contractAddress: contractAddr,
    functionName: "batchMint",
    abi: customAssemblyABIJson,
    msgValue: msgValue === 0 ? "" : msgValue,
    params: {
      _to: account,
      _addresses: addressArr,
      _arrayOfNumbers: assetNumbers,
      _amountOfPacks: packNum,
      _totalOfPacks: packNumber
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    const receipt = await transaction.wait();
    txHash = receipt.transactionHash;
    let link = `${getExplorer(chainId)}tx/${txHash}`;
    packReceipt = { isSuccess: true, txHash: txHash, link: link, PackAmount: packNum };
    let title = `Packs minted!`;
    let msg = (
      <>
        Congrats!!! {packNum} packs have just been minted and sent to your wallet!
        <br></br>
        <a href={link} target='_blank' rel='noreferrer noopener'>
          View in explorer: &nbsp;
          <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
        </a>
      </>
    );
    openNotification("success", title, msg);
    console.log(`${packNum} packs have been minted`);

    const CreatedBatchPack = Moralis.Object.extend("CreatedBatchPack");
    const createdBatchPack = new CreatedBatchPack();
    createdBatchPack.set("address", contractAddr);
    createdBatchPack.set("owner", account);
    createdBatchPack.set("chainId", chainId);
    createdBatchPack.set("amountOfPack", packNum.toString());
    createdBatchPack.set("totalOfPack", packNumber.toString());
    createdBatchPack.set("transaction_hash", txHash);
    createdBatchPack.set(
      "collectionName",
      customCollectionData.name ? customCollectionData.name : "Pack-Generator-NFT"
    );
    createdBatchPack.set("collectionSymbol", customCollectionData.symbol ? customCollectionData.symbol : "PGNFT");
    createdBatchPack.save();
  } catch (error) {
    let title = "Unexpected error";
    let msg = "Oops, something went wrong while batch-packing! Please, check your datas";
    openNotification("error", title, msg);
    console.log(error);
    packReceipt = { isSuccess: false };
  }
  return packReceipt;
};

// Claim selected Pack (Burn the NFT and send its content back to user)
export const claimPack = async (nftToClaim, contractAddress, nftData, account, chainId) => {
  var packReceipt;
  const arrOfNum = nftData.arrayOfNumber.map((e) => parseInt(e));
  const arrOfAdd = nftData.arrayOfAddress[0] === "" ? [] : nftData.arrayOfAddress;

  const sendOptions = {
    contractAddress: contractAddress.toString(),
    functionName: "burn",
    abi: assemblyABIJson,
    params: {
      _to: account.toString(),
      _tokenId: nftToClaim.token_id,
      _salt: parseInt(nftData.salt),
      _addresses: arrOfAdd,
      _numbers: arrOfNum
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    const receipt = await transaction.wait();
    let link = `${getExplorer(chainId)}tx/${receipt.transactionHash}`;
    let title = "Pack claimed!";
    let msg = (
      <>
        Your pack has been succesfully unpacked!
        <br></br>
        <a href={link} target='_blank' rel='noreferrer noopener'>
          View in explorer: &nbsp;
          <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
        </a>
      </>
    );
    openNotification("success", title, msg);
    console.log("pack claimed");

    const ClaimedPacks = Moralis.Object.extend("ClaimedPacks");
    const claimedPacks = new ClaimedPacks();
    claimedPacks.set("address", contractAddress);
    claimedPacks.set("owner", account);
    claimedPacks.set("chainId", chainId);
    claimedPacks.set("tokenId", nftToClaim.token_id);
    claimedPacks.set("transaction_hash", receipt.transactionHash);
    claimedPacks.set("addresses", nftData.arrayOfAddress);
    claimedPacks.set("numbers", nftData.arrayOfNumber);
    claimedPacks.set("salt", nftData.salt);
    claimedPacks.save();
    packReceipt = {
      isSuccess: true,
      txHash: receipt.transactionHash,
      link: `${getExplorer(chainId)}tx/${receipt.transactionHash}`
    };
  } catch (error) {
    let title = "Unexpected error";
    let msg = "Oops, something went wrong while unpacking your pack!";
    openNotification("error", title, msg);
    console.log(error);
    packReceipt = { isSuccess: false };
  }
  return packReceipt;
};

// List pack for sale on the MarketPlace
export const listOnMarketPlace = async (nft, listPrice, contractAddress) => {
  var isSuccess;
  const p = listPrice * ("1e" + 18);
  const sendOptions = {
    contractAddress: contractAddress,
    functionName: "createMarketItem",
    abi: marketABIJson,
    params: {
      nftContract: nft.token_address,
      tokenId: nft.token_id,
      price: String(p)
    }
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction.wait();

    let title = "NFTs listed succesfully";
    let msg = "Your NFT has been succesfully listed to the marketplace.";
    openNotification("success", title, msg);
    console.log("NFTs listed succesfully");
    isSuccess = true;
  } catch (error) {
    let title = "Error during listing!";
    let msg = "Something went wrong while listing your NFT to the marketplace. Please try again.";
    openNotification("error", title, msg);
    console.log(error);
    isSuccess = false;
  }
  return isSuccess;
};

// Buy NFT from the MarketPlace
export const buyNFT = async (tokenAdd, marketAddress, tokenDetails) => {
  var isSuccess;
  const itemID = tokenDetails.itemId;
  const tokenPrice = tokenDetails.price;

  const sendOptions = {
    contractAddress: marketAddress,
    functionName: "createMarketSale",
    abi: marketABIJson,
    params: {
      nftContract: tokenAdd,
      itemId: itemID
    },
    msgValue: tokenPrice
  };

  try {
    const transaction = await Moralis.executeFunction(sendOptions);
    await transaction.wait();
    let title = "NFT bought succesfully";
    let msg = "Your NFT has been succesfully purchased from the marketplace.";
    openNotification("success", title, msg);
    isSuccess = true;
  } catch (error) {
    let title = "Error during purchase!";
    let msg = "Something went wrong while purchasing your NFT From the marketplace. Please try again.";
    openNotification("error", title, msg);
    isSuccess = false;
  }
  return isSuccess;
};
