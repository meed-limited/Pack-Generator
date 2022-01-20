import React, { useState } from "react";
/* eslint-disable no-unused-vars */
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Card, Button, Input, Tabs, Divider } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import { getNativeByChain } from "helpers/networks";
import AssetModal from "./Minter/AssetModal";
import ERC20Modal from "./Minter/ERC20Modal";
import cloneDeep from "lodash/cloneDeep";
import { getExplorer } from "helpers/networks";
import Claim from "./Minter/Claim";
import { openNotification } from "./Notification";

const { TabPane } = Tabs;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px"
  },
  bundleMinter: {
    maxWidth: "80%",
    margin: "0 auto",
    textAlign: "center"
  },
  label: {
    textAlign: "left",
    display: "block"
  },
  h2: {
    fontSize: "30px",
    color: "#f1356d",
    marginBottom: "50px"
  },
  input: {
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  textarea: {
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  select: {
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  mintButton: {
    marginTop: "30px",
    background: "#f1356d",
    color: "#fff",
    border: "0",
    padding: "20px",
    fontSize: "20px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  container: {
    opacity: "0.8",
    borderRadius: "8px",
    backgroundColor: "black",
    textAlign: "center",
    paddingTop: "50px",
    paddingBottom: "50px",
    fontSize: "25px",
    color: "white"
  },
  modalTitle: {
    padding: "10px",
    textAlign: "center",
    fontSize: "25px"
  }
};

const PackMinter = () => {
  const { walletAddress, chainId, assemblyAddress, assemblyABI } = useMoralisDapp();
  const nativeName = getNativeByChain(chainId);
  const [isNFTModalVisible, setIsNFTModalVisible] = useState(false);
  const [isAssetModalVisible, setIsAssetModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [NFTsArr, setNFTsArr] = useState([]);
  const [ethAmount, setETHAmount] = useState();
  const [selectedTokens, setSelectedTokens] = useState([]);
  const contractProcessor = useWeb3ExecuteFunction();
  const mintFuntion = "mint";
  const contractABIJson = JSON.parse(assemblyABI);
  const queryMintedBundles = useMoralisQuery("CreatedBundle");
  const fetchMintedBundle = JSON.parse(
    JSON.stringify(queryMintedBundles.data, ["firstHolder", "tokenId", "salt", "addresses", "numbers", "confirmed"])
  );

  /*Sorting arrays before feeding contract*/
  const [addArr, setAddArr] = useState([]);
  const [numArr, setNumArr] = useState([]);

  const sortedAddArr = () => {
    setAddArr([]);
    setNumArr([]);
    var addr = [];
    var num = [];
    var ERC20Addr = [];
    var ERC721Addr = [];
    var ERC1155Addr = [];

    let eth = (ethAmount * ("1e" + 18)).toString();
    num.push(eth);
    //setNumArr(num.push(eth));

    // ERC20 addresses
    for (let i = 0; i < selectedTokens.length; i++) {
      let tmp = selectedTokens[i].data;
      ERC20Addr.push(tmp.token_address);
    }
    num.push(ERC20Addr.length);

    // ERC721 addresses
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC721") {
        ERC721Addr.push(NFTsArr[i].token_address);
      }
    }
    num.push(ERC721Addr.length);

    // ERC1155 addresses
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC1155") {
        ERC1155Addr.push(NFTsArr[i].token_address);
      }
    }
    num.push(ERC1155Addr.length);
    setAddArr(addr.concat(ERC20Addr, ERC721Addr, ERC1155Addr));

    for (let i = 0; i < selectedTokens.length; i++) {
      let tmp = (selectedTokens[i].value * ("1e" + 18)).toString();
      num.push(tmp);
    }
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC721") {
        let tmp = NFTsArr[i].token_id;
        num.push(tmp);
      }
    }
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC1155") {
        let tmpID = NFTsArr[i].token_id;
        let tmpAmount = NFTsArr[i].amount;
        num.push(tmpID, tmpAmount);
      }
    }
    setNumArr(num);
  };

  const handleMint = () => {
    sortedAddArr();
    mintBundle(addArr, numArr);
  };

  function approveAllAssets(address, numbers) {
    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);

    for (let i = 0; i < ERC20add.length; i++) {
      let allowance = numbers[count];
      // let currentAllowance = await checkERC20Approval(ERC20add[i]); //Added to check approval
      // if (currentAllowance < neededAllowance) {
      const ops = {
        contractAddress: ERC20add[i],
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
          spender: assemblyAddress,
          amount: allowance
        }
      };

      contractProcessor.fetch({
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
      count++;

      // }
    }

    for (let i = 0; i < address.length; i++) {
      // let isNFTApproved = checkNFTApproval(address[i]);
      // if (!isNFTApproved) {
      const ops = {
        contractAddress: address[i],
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
          operator: assemblyAddress,
          _approved: true
        }
      };

      contractProcessor.fetch({
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
      // }
    }
  }

  // async function checkERC20Approval(ERC20) {
  //   const ops = {
  //     contractAddress: ERC20,
  //     functionName: "allowance",
  //     abi: [
  //       {
  //         inputs: [
  //           {
  //             internalType: "address",
  //             name: "owner",
  //             type: "address"
  //           },
  //           {
  //             internalType: "address",
  //             name: "spender",
  //             type: "address"
  //           }
  //         ],
  //         name: "allowance",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256"
  //           }
  //         ],
  //         stateMutability: "view",
  //         type: "function"
  //       }
  //     ],
  //     params: {
  //       owner: walletAddress,
  //       spender: assemblyAddress
  //     }
  //   };

  //   await contractProcessor.fetch({
  //     params: ops,
  //     onSuccess: () => {},
  //     onError: (error) => {
  //       console.log(error);
  //     }
  //   });
  // }

  // async function checkNFTApproval(NFTaddress) {
  //   const ops = {
  //     contractAddress: NFTaddress,
  //     functionName: "isApprovedForAll",
  //     abi: [
  //       {
  //         inputs: [
  //           {
  //             internalType: "address",
  //             name: "owner",
  //             type: "address"
  //           },
  //           {
  //             internalType: "address",
  //             name: "operator",
  //             type: "address"
  //           }
  //         ],
  //         name: "isApprovedForAll",
  //         outputs: [
  //           {
  //             internalType: "bool",
  //             name: "",
  //             type: "bool"
  //           }
  //         ],
  //         stateMutability: "view",
  //         type: "function"
  //       }
  //     ],
  //     params: {
  //       owner: walletAddress,
  //       operator: assemblyAddress
  //     }
  //   };

  //   await contractProcessor.fetch({
  //     params: ops,
  //     onSuccess: () => {
  //       return true;
  //     },
  //     onError: (error) => {
  //       console.log(error);
  //       return false;
  //     }
  //   });
  // }

  async function mintBundle(assetContracts, assetNumbers) {
    const addressArr = cloneDeep(assetContracts);
    await approveAllAssets(assetContracts, assetNumbers);

    const ops = {
      contractAddress: assemblyAddress,
      functionName: mintFuntion,
      abi: contractABIJson,
      params: {
        _to: walletAddress,
        _addresses: addressArr,
        _numbers: assetNumbers
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        let title = "Bundle created!";
        let msg = "Your bundle has been succesfully created!<br/>Open in the explorer";
        openNotification("success", title, msg);
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while creating your bundle!";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  const showNFTModal = () => {
    setIsNFTModalVisible(true);
  };
  const showAssetModal = () => {
    setIsAssetModalVisible(true);
  };

  const handleNFTOk = (selectedItems) => {
    console.log(selectedItems);
    setNFTsArr(selectedItems);
    setConfirmLoading(true);
    setIsNFTModalVisible(false);
    setConfirmLoading(false);
  };
  const handleAssetOk = (eth, selectedItems) => {
    setETHAmount(eth);
    setSelectedTokens(selectedItems);
    setConfirmLoading(true);
    setIsAssetModalVisible(false);
    setConfirmLoading(false);
  };

  const handleNFTCancel = () => {
    setIsNFTModalVisible(false);
  };
  const handleAssetCancel = () => {
    setIsAssetModalVisible(false);
  };

  const onClickReset = () => {
    setNFTsArr([]);
    setETHAmount();
    setSelectedTokens([]);
    setAddArr([]);
    setNumArr([]);
  };

  const forDev = () => {
    sortedAddArr();
    console.log(addArr);
    console.log(numArr);
  };

  return (
    <div
      style={{
        margin: "auto",
        textAlign: "center",
        width: "80%"
      }}
    >
      <Tabs centered type='card'>
        <TabPane tab='Bundle Minter' key='1'>
          <Divider />
          <div style={styles.bundleMinter}>
            <h2 style={styles.h2}>Prepare Your Bundle</h2>
            <div>
              <div style={styles.container}>
                <label>Select all the assets to bundle:</label>
                <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
                  <Button type='primary' style={{ margin: "30px" }} onClick={showNFTModal}>
                    Pick Some NFTs
                  </Button>
                  <AssetModal
                    handleNFTCancel={handleNFTCancel}
                    isNFTModalVisible={isNFTModalVisible}
                    handleNFTOk={handleNFTOk}
                    confirmLoading={confirmLoading}
                  />
                  <Button type='primary' style={{ margin: "30px" }} onClick={showAssetModal}>
                    Pick Some Assets
                  </Button>
                  <ERC20Modal
                    isAssetModalVisible={isAssetModalVisible}
                    handleAssetOk={handleAssetOk}
                    confirmLoading={confirmLoading}
                    handleAssetCancel={handleAssetCancel}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto",
                    color: "white",
                    fontSize: "16px"
                  }}
                >
                  <div>
                    <p>NFTs to Bundle:</p>
                    {NFTsArr &&
                      NFTsArr.length > 0 &&
                      NFTsArr.map((nftItem, key) => (
                        <div
                          style={{
                            margin: "15px",
                            borderRadius: "8px",
                            backgroundColor: "white",
                            color: "black",
                            opacity: "0.8"
                          }}
                          key={`${nftItem.token_id} - ${nftItem.contract_type}`}
                        >
                          <p>{`NFT: ${nftItem.token_id} - ${nftItem.contract_type}`}</p>
                        </div>
                      ))}
                  </div>
                  <div>
                    <p>ETH to Bundle: </p>
                    {ethAmount && ethAmount > 0 && (
                      <p
                        key={`${ethAmount}`}
                        style={{
                          margin: "15px",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          color: "black",
                          opacity: "0.8"
                        }}
                      >
                        {ethAmount} {nativeName}
                      </p>
                    )}

                    <div>
                      <p style={{ marginTop: "30px" }}>Tokens to bundle:</p>
                      {selectedTokens &&
                        selectedTokens.length > 0 &&
                        selectedTokens.map((selectedToken, key) => (
                          <div
                            style={{
                              margin: "15px",
                              borderRadius: "8px",
                              backgroundColor: "white",
                              color: "black",
                              opacity: "0.8"
                            }}
                            key={`${selectedToken.data.symbol} - ${selectedToken.value}`}
                          >
                            <p>{`${selectedToken.data.symbol}: ${selectedToken.value}`}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: "100",
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                >
                  <Button type='primary' style={{ margin: "50px 30px 0px" }} onClick={onClickReset} danger>
                    Reset
                  </Button>
                  <Button type='primary' style={{ margin: "50px 30px 0px" }} onClick={forDev} danger>
                    console.log
                  </Button>
                </div>
              </div>
            </div>

            <button style={styles.mintButton} onClick={handleMint}>
              Bundle All
            </button>
          </div>
        </TabPane>
        <TabPane tab='Claim Bundle' key='2'>
          <Claim />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PackMinter;
