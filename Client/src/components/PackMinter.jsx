import React, { useState } from "react";
/* eslint-disable no-unused-vars */
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Button, Input, Tabs, Divider } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import { getNativeByChain } from "helpers/networks";
import AssetModal from "./Minter/AssetModal";
import ERC20Modal from "./Minter/ERC20Modal";
import cloneDeep from "lodash/cloneDeep";
import Claim from "./Minter/Claim";
import { openNotification } from "./Notification";
import Uploader from "./Uploader";
import { approveNFTcontract } from "./Minter/Approval";
import { approveERC20contract } from "./Minter/Approval";

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
  const [ipfsHash, setIpfsHash] = useState("");
  const [NFTsArr, setNFTsArr] = useState([]);
  const [ethAmount, setETHAmount] = useState();
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [batchAddress, setBatchaddress] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [bundleNumber, setBundleNumber] = useState();
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

  async function singleApproveAll(address, numbers) {
    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);

    for (let i = 0; i < ERC20add.length; i++) {
      let toAllow = numbers[count];
      await approveERC20contract(ERC20add[i], toAllow, assemblyAddress, contractProcessor);
      count++;
    }

    for (let i = 0; i < address.length; i++) {
      await approveNFTcontract(address[i], assemblyAddress, contractProcessor);
    }
  }

  async function mintBundle(assetContracts, assetNumbers) {
    const addressArr = cloneDeep(assetContracts);
    await singleApproveAll(assetContracts, assetNumbers);

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

  const handleMint = () => {
    sortedAddArr();
    mintBundle(addArr, numArr);
  };

  async function multipleBundleMint(assetContracts, assetNumbers, bundleNum) {
    const addressArr = cloneDeep(assetContracts);
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
        console.log(`bundle minted ${bundleNum}`);
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while batch bundling! Please, check your input datas";
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
    setBatchaddress([]);
    setBatchNumbers([]);
  };

  const getIpfsHash = (hash) => {
    setIpfsHash(hash);
  };

  async function fetchIpfs() {
    const url = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
    const response = await fetch(url);
    const file = await response.json();
    return file;
  }

  async function sortBatchArr() {
    const content = await fetchIpfs();
    console.log(content);
    var assetsAddresses = [];
    var assetsNumbers = [];

    // Add ETH amount
    let eth = (ethAmount * ("1e" + 18)).toString();
    assetsNumbers.push(eth);

    // Add ERC20 addresses
    if (selectedTokens && selectedTokens.length > 0) {
      for (let i = 0; i < selectedTokens.length; i++) {
        let tmp = selectedTokens[i].data;
        assetsAddresses.push(tmp.token_address);
      }
    }
    assetsNumbers.push(assetsAddresses.length);

    // Add NFT addresses (per bundle)
    const numOfNft = parseInt(ERC721Number) + parseInt(ERC1155Number);

    if (content.length > 0) {
      if (ERC721Number > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (content[i].contract_type === "ERC721") {
            assetsAddresses.push(content[i].token_address);
          }
        }
      }

      if (ERC1155Number > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (content[i].contract_type === "ERC1155") {
            assetsAddresses.push(content[i].token_address);
          }
        }
      }
    }

    assetsNumbers.push(ERC721Number, ERC1155Number);

    //Add ERC20 Amounts
    if (selectedTokens && selectedTokens.length > 0) {
      for (let i = 0; i < selectedTokens.length; i++) {
        let tmp = (selectedTokens[i].value * ("1e" + 18)).toString();
        assetsNumbers.push(tmp);
      }
    }

    //ERC721 ids
    if (content.length > 0) {
      if (ERC721Number > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (content[i].contract_type === "ERC721") {
            let tmp = content[i].token_id;
            assetsNumbers.push(tmp);
          }
        }
      }
      if (ERC1155Number > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (content[i].contract_type === "ERC1155") {
            let tmpId = content[i].token_id;
            let tmpAmt = content[i].amount;
            assetsNumbers.push(tmpId, tmpAmt);
          }
        }
      }
    }
    setBatchaddress(assetsAddresses);
    setBatchNumbers(assetsNumbers);
    console.log(assetsAddresses);
    console.log(assetsNumbers);
  }

  async function multipleApproveAll(address, numbers) {
    var ERC20add = [];
    var count = 4;
    console.log(address);
    ERC20add = address.splice(0, numbers[1]);

    for (let i = 0; i < ERC20add.length; i++) {
      let toAllow = (numbers[count] * bundleNumber).toString();
      await approveERC20contract(ERC20add[i], toAllow, assemblyAddress, contractProcessor);
      count++;
    }
    for (let i = 0; i < address.length; i++) {
      await approveNFTcontract(address[i], assemblyAddress, contractProcessor);
    }
  }

  async function batchBundle() {
    sortBatchArr();
    //await multipleApproveAll(batchAddress, batchNumbers);

    var arrOfArr = new Array();
    for (let i = 0; i < bundleNumber; i++) {
      arrOfArr.push(batchNumbers);
    }
    console.log(arrOfArr);

    // handle ERC721 && ERC1155 id increment
    var numOfERC20 = batchNumbers[1];
    var id = batchNumbers[4 + numOfERC20];
    var firstIdIndex = id + batchNumbers[2] + batchNumbers[3];

    for (let i = 0; i < bundleNumber; i++) {
      console.log(id);
      console.log(firstIdIndex);
    }

    // for (let i = 0; i < arrOfArr; i++) {
    // //   const numList = batchNumbers[i];

    // //   multipleBundleMint(batchAddress, numList, i);
    // }
  }

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
        <TabPane tab='Single Bundle' key='1'>
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
        <TabPane tab='Batch Bundle' key='2'>
          <div style={styles.bundleMinter}>
            <h2 style={styles.h2}>Prepare Your Bundle</h2>
            <div>
              <div style={styles.container}>
                <label>Select all the assets to bundle:</label>

                <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
                  <div style={{ marginTop: "30px", margin: "auto", width: "60%", display: "grid" }}>
                    <Uploader style={{ marginTop: "30px" }} getIpfsHash={getIpfsHash} />
                    <p>
                      <label style={{ fontSize: "15px" }}>Number of ERC721 per bundle:</label>
                      <Input
                        style={{ width: "40%", margin: "auto" }}
                        placeholder='Number of ERC721'
                        type='number'
                        onChange={(e) => setERC721Number(e.target.value)}
                      />
                    </p>
                    <p>
                      <label style={{ fontSize: "15px" }}>Number of ERC721 per bundle:</label>
                      <Input
                        style={{ width: "40%", margin: "auto" }}
                        placeholder='Number of ERC1155'
                        type='number'
                        onChange={(e) => setERC1155Number(e.target.value)}
                      />
                    </p>
                  </div>

                  <div>
                    <Button type='primary' style={{ margin: "30px" }} onClick={showAssetModal}>
                      Assets per bundle
                    </Button>
                    <ERC20Modal
                      isAssetModalVisible={isAssetModalVisible}
                      handleAssetOk={handleAssetOk}
                      confirmLoading={confirmLoading}
                      handleAssetCancel={handleAssetCancel}
                    />

                    <div style={{ color: "white", fontSize: "16px" }}>
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
            <div style={{ marginTop: "30px", margin: "auto", width: "50%" }}>
              <label style={{ fontSize: "20px" }}>Enter the desired amount of bundles:</label>
              <Input placeholder='Number of bundles' type='number' onChange={(e) => setBundleNumber(e.target.value)} />
            </div>

            <button style={styles.mintButton} onClick={batchBundle}>
              Batch Bundle
            </button>
          </div>
        </TabPane>
        <TabPane tab='Claim Bundle' key='3'>
          <Claim />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PackMinter;
