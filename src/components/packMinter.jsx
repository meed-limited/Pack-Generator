import React, { useState } from "react";
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
  const [bundleName, setBundleName] = useState("");
  const [bundleDescription, setBundleDescription] = useState("");
  const [properties, setProperties] = useState({ attribut: "", value: "" });
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
  const [addArr, setaddArr] = useState([]);
  const [numArr, setnumArr] = useState([]);
  const [ERC20AddLength, setERC20AddLength] = useState();
  const [ERC721AddLength, setERC721AddLength] = useState();
  const [ERC1155AddLength, setERC1155AddLength] = useState();

  const sortedAddArr = () => {
    setaddArr([]);
    setnumArr([]);
    var addr = [];
    var ERC20Addr = [];
    var ERC721Addr = [];
    var ERC1155Addr = [];

    let eth = (ethAmount * ("1e" + 18)).toString();
    numArr.push(eth);

    // ERC20 addresses
    for (let i = 0; i < selectedTokens.length; i++) {
      let tmp = selectedTokens[i].currentToken;
      ERC20Addr.push(tmp.token_address);
    }
    setERC20AddLength(ERC20Addr.length);
    numArr.push(ERC20AddLength);

    // ERC721 addresses
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC721") {
        ERC721Addr.push(NFTsArr[i].token_address);
      }
    }
    setERC721AddLength(ERC721Addr.length);
    numArr.push(ERC721AddLength);

    // ERC1155 addresses
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC1155") {
        ERC1155Addr.push(NFTsArr[i].token_address);
      }
    }
    setERC1155AddLength(ERC1155Addr.length);
    numArr.push(ERC1155AddLength);
    setaddArr(addr.concat(ERC20Addr, ERC721Addr, ERC1155Addr));

    for (let i = 0; i < selectedTokens.length; i++) {
      let tmp = (selectedTokens[i].value * ("1e" + 18)).toString();
      numArr.push(tmp);
    }
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC721") {
        let tmp = NFTsArr[i].token_id;
        numArr.push(tmp);
      }
    }
    for (let i = 0; i < NFTsArr.length; i++) {
      if (NFTsArr[i].contract_type === "ERC1155") {
        let tmpID = NFTsArr[i].token_id;
        let tmpAmount = NFTsArr[i].amount;
        numArr.push(tmpID, tmpAmount);
      }
    }
  };

  const handleMint = () => {
    sortedAddArr();
    mintBundle(addArr, numArr);
  };

  async function approveAllAssets(address, numbers) {
    var ERC20add = [];
    ERC20add = address.splice(0, numbers[1]);

    for (let i = 0; i < ERC20add.length; i++) {
      let count = 5;
      let allowance = numbers[count];
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
      count++;

      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("ERC20 Approval Received");
          //setVisibility(false);
          //succApprove();
        },
        onError: (error) => {
          console.log(error);
          //failApprove();
        }
      });
    }

    for (let i = 0; i < address.length; i++) {
      const ops = {
        contractAddress: address[i],
        functionName: "setApprovalForAll",
        abi: [
          {
            inputs: [
              { internalType: "address", name: "operator", type: "address" },
              { internalType: "bool", name: "approved", type: "bool" }
            ],
            name: "setApprovalForAll",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
          }
        ],
        params: {
          operator: assemblyAddress,
          approved: true
        }
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("NFT Approval Received");
          //setVisibility(false);
          //succApprove();
        },
        onError: (error) => {
          console.log(error);
          //failApprove();
        }
      });
    }
  }

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
        alert("Bundle minted!");
      },
      onError: (error) => {
        alert("Oops, something went wrong!");
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

  const handleChange = (field) => {
    return (e) =>
      setProperties((properties) => ({
        ...properties,
        [field]: e.target.value
      }));
  };

  const onClickReset = () => {
    setNFTsArr([]);
    setETHAmount();
    setSelectedTokens([]);
    setaddArr([]);
    setnumArr([]);
    setERC20AddLength();
    setERC721AddLength();
    setERC1155AddLength();
  };

  const forDev = () => {
    sortedAddArr();
    console.log(addArr);
    console.log(numArr);
  };

  return (
    <div className='card-container' style={{ width: "-webkit-fill-available" }}>
      <Tabs centered type='card'>
        <TabPane tab='Bundle Minter' key='1'>
          <Divider />
          <div style={styles.bundleMinter}>
            <h2 style={styles.h2}>Prepare Your Bundle</h2>
            <div>
              <div style={styles.container}>
                <label>Select all the assets to bundle:</label>
                <div>
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
                        >
                          <p
                            key={`${nftItem.token_id} - ${nftItem.contract_type}`}
                          >{`NFT: ${nftItem.token_id} - ${nftItem.contract_type}`}</p>
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
                          >
                            <p
                              key={`${selectedToken.currentToken.symbol} - ${selectedToken.value}`}
                            >{`${selectedToken.currentToken.symbol}: ${selectedToken.value}`}</p>
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

              <label style={styles.label}>Name</label>
              <Input
                style={styles.input}
                type='text'
                required
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
              />
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                required
                value={bundleDescription}
                onChange={(e) => setBundleDescription(e.target.value)}
              ></textarea>
              <label style={styles.label}>Properties</label>
              <Input style={styles.input} type='text' value={properties.attribut} onChange={handleChange("attribut")} />
              <Input style={styles.input} type='text' value={properties.value} onChange={handleChange("value")} />
              <button style={styles.mintButton} onClick={handleMint}>
                Bundle All
              </button>
              <div>
                {" "}
                {bundleName} {bundleDescription} {properties.attribut} {properties.value}{" "}
              </div>
            </div>
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
