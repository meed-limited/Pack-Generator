import React, { useState } from "react";
import { Button, Input, Tabs } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import ModalNFT from "./Bundle/ModalNFT";
import cloneDeep from "lodash/cloneDeep";
import BundleClaim from "./Bundle/BundleClaim";
import { openNotification } from "./Notification";
import { sortSingleArrays, sortMultipleArrays, updateTokenIdsInArray } from "./Bundle/ArraySorting";
import Uploader from "./Bundle/Uploader";
import { approveERC20contract, approveNFTcontract, checkExistingApproval } from "./Bundle/Approval";
import AssetPerBundle from "./Bundle/AssetPerBundle";
import styles from "./Bundle/styles";
import { getEllipsisTxt } from "helpers/formatters";
const { TabPane } = Tabs;

const BatchBundle = () => {
  const queryMintedBundles = useMoralisQuery("CreatedBundle");
  const { walletAddress, assemblyAddress, assemblyABI } = useMoralisDapp();
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [bundleNumber, setBundleNumber] = useState();
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(assemblyABI);
  const assetPerBundleRef = React.useRef();
  const assetModalRef = React.useRef();
  const fetchMintedBundle = JSON.parse(
    JSON.stringify(queryMintedBundles.data, [
      "firstHolder",
      "tokenId",
      "salt",
      "addresses",
      "numbers",
      "address",
      "confirmed"
    ])
  );

  const showModalNFT = () => {
    setIsModalNFTVisible(true);
  };

  const handleNFTOk = (selectedItems) => {
    setNFTsArr(selectedItems);
    setIsModalNFTVisible(false);
  };

  const handleNFTCancel = () => {
    setIsModalNFTVisible(false);
  };

  const getAssetValues = (ethAmt, Erc20) => {
    setEthAmount(ethAmt);
    setSelectedTokens(Erc20);
  };

  const getIpfsHash = (hash) => {
    setIpfsHash(hash);
  };

  async function fetchIpfs() {
    const url = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
    try {
      const response = await fetch(url);
      const file = await response.json();
      return file;
    } catch (e) {
      let title = "No JSON submited";
      let msg = "It looks like you haven't submitted any JSON file.";
      openNotification("warning", title, msg);
      console.log(e);
    }
  }

  async function getSingleBundleArrays() {
    let data = await sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  }

  async function getMultipleBundleArrays(fileContent) {
    let data = await sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  }

  async function singleApproveAll(address, numbers) {
    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);
    try {
      for (let i = 0; i < ERC20add.length; i++) {
        let toAllow = numbers[count];
        await approveERC20contract(ERC20add[i], toAllow, assemblyAddress, contractProcessor);
        count++;
      }
      for (let i = 0; i < address.length; i++) {
        await approveNFTcontract(address[i], assemblyAddress, contractProcessor);
      }
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your bundle's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function multipleApproveAll(address, numbers) {
    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);
    try {
      for (let i = 0; i < ERC20add.length; i++) {
        let toAllow = (numbers[count] * bundleNumber).toString();
        await approveERC20contract(ERC20add[i], toAllow, assemblyAddress, contractProcessor);
        count++;
      }
      for (let i = 0; i < address.length; i++) {
        await approveNFTcontract(address[i], assemblyAddress, contractProcessor);
      }
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your bundles's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function singleBundleMint(assetContracts, assetNumbers) {
    const addressArr = cloneDeep(assetContracts);
    await singleApproveAll(assetContracts, assetNumbers).then(() => {
      const ops = {
        contractAddress: assemblyAddress,
        functionName: "mint",
        abi: contractABIJson,
        msgValue: assetNumbers[0],
        params: {
          _to: walletAddress,
          _addresses: addressArr,
          _numbers: assetNumbers
        }
      };

      contractProcessor.fetch({
        params: ops,
        onSuccess: async (e) => {
          // const nftId = await fetchMintedBundle[fetchMintedBundle.length -1].tokenId; // PB: DB delayed = not getting the last id !!!!
          // console.log(nftId)
          let title = "Bundle created!";
          let msg = "Your bundle has been succesfully created! Click to view in the explorer";
          openNotification("success", title, msg);
          console.log("Bundle created");
        },
        onError: (error) => {
          let title = "Unexpected error";
          let msg = "Oops, something went wrong while creating your bundle!";
          openNotification("error", title, msg);
          console.log(error);
        }
      });
    });
  }

  async function multipleBundleMint(assetContracts, assetNumbers, bundleNum) {
    const addressArr = cloneDeep(assetContracts);
    const ops = {
      contractAddress: assemblyAddress,
      functionName: "mint",
      abi: contractABIJson,
      msgValue: assetNumbers[0],
      params: {
        _to: walletAddress,
        _addresses: addressArr,
        _numbers: assetNumbers
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log(`bundle ${bundleNum} minted`);
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while batch bundling! Please, check your input datas";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  async function handleSingleBundle() {
    let result = await getSingleBundleArrays();
    singleBundleMint(result[0], result[1]);
  }

  async function handleMultipleBundle() {
    try {
      const fetchIpfsFile = await fetchIpfs();
      const sortedData = await getMultipleBundleArrays(fetchIpfsFile);
      const assetsArray = sortedData[0];
      const numbersArray = sortedData[1];
      const contractNumbersArray = await updateTokenIdsInArray(fetchIpfsFile, numbersArray, bundleNumber);
      console.log(assetsArray);
      console.log(contractNumbersArray);

      /*SMART-CONTRACT CALL:
       **********************/
      const clonedArray = cloneDeep(assetsArray);
      await multipleApproveAll(clonedArray, numbersArray);

      for (let i = 0; i < bundleNumber; i++) {
        let numbers = contractNumbersArray[i];
        multipleBundleMint(assetsArray, numbers, i);
      }

      // let currentApproval = await checkExistingApproval(sortedData[0], sortedData[1], walletAddress, assemblyAddress, contractProcessor);
      // console.log(currentApproval)
    } catch (err) {
      let title = "Batch Bundle error";
      let msg = "Something went wrong while doing your batch bundles. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  }

  const onClickReset = () => {
    if (assetPerBundleRef && assetPerBundleRef.current) {
      assetPerBundleRef.current.reset();
    }
    if (assetModalRef && assetModalRef.current) {
      assetModalRef.current.reset();
    }
  };

  return (
    <div style={styles.content}>
      <Tabs centered tabBarGutter='50px' onChange={onClickReset} tabBarStyle={styles.tabs} type='line'>
        <TabPane tab='SINGLE BUNDLE' key='1' onChange={onClickReset}>
          <div>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your single Bundle</label>

              <div style={{ display: "grid", gridTemplateColumns: "49% 2% 49%" }}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ position: "relative" }}>
                    <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
                      Pick Some NFTs
                    </Button>
                    <ModalNFT
                      handleNFTCancel={handleNFTCancel}
                      isModalNFTVisible={isModalNFTVisible}
                      handleNFTOk={handleNFTOk}
                      isMultiple={true}
                      ref={assetModalRef}
                    />
                    <div style={{ color: "white", fontSize: "16px" }}>
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
                            {nftItem.token_id.length > 6 ? (
                              <p>{`Id: ${getEllipsisTxt(nftItem.token_id, 4)} - Type: ${nftItem.contract_type}`}</p>
                            ) : (
                              <p>{`Id: ${nftItem.token_id} - Type - ${nftItem.contract_type}`}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "12px", margin: "auto", justifyContent: "center" }}>
                  <p>AND</p>
                  <p>/</p>
                  <p>OR</p>
                </div>
                <div style={styles.transparentContainerInside}>
                  <div>
                    <AssetPerBundle getAssetValues={getAssetValues} ref={assetPerBundleRef} />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button shape='round' style={styles.resetButton} onClick={onClickReset}>
                  RESET
                </Button>
              </div>
            </div>
            <button shape='round' style={styles.runFunctionButton} onClick={handleSingleBundle}>
              BUNDLE
            </button>
          </div>
        </TabPane>
        <TabPane tab='BATCH BUNDLE' key='2' onChange={onClickReset}>
          <div>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your Multiple Bundles</label>
              <p style={{ fontSize: "16px", marginTop: "8px", letterSpacing:"1px", fontWeight:"300" }}>Select all the assets to bundle</p>
              <div style={styles.contentGrid}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ margin: "auto", marginTop: "30px" }}>
                    <Uploader getIpfsHash={getIpfsHash} />
                    <p style={{ fontSize: "15px" }}>Number of ERC721 per bundle:</p>
                    <p>
                      <Input
                        style={styles.transparentInput}
                        type='number'
                        onChange={(e) => setERC721Number(e.target.value)}
                      />
                    </p>
                    <p style={{ fontSize: "15px", marginTop: "20px" }}>Number of ERC1155 per bundle:</p>
                    <p>
                      <Input
                        style={styles.transparentInput}
                        type='number'
                        onChange={(e) => setERC1155Number(e.target.value)}
                      />
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: "12px", margin: "auto", justifyContent: "center" }}>
                  <p>AND</p>
                  <p>/</p>
                  <p>OR</p>
                </div>
                <div style={styles.transparentContainerInside}>
                  <AssetPerBundle getAssetValues={getAssetValues} ref={assetPerBundleRef} />
                </div>
              </div>
              <div style={{ margin: "auto", marginTop: "10px", width: "50%" }}>
                <label style={{ fontSize: "17px" }}>Enter the desired amount of bundles:</label>
                <Input
                  style={styles.transparentInput}
                  type='number'
                  onChange={(e) => setBundleNumber(e.target.value)}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button style={styles.resetButton} shape='round' onClick={onClickReset}>
                  RESET
                </Button>
              </div>
            </div>
            <div style={{ marginBottom: "110px" }}>
              <Button shape='round' style={styles.runFunctionButton} onClick={handleMultipleBundle}>
                BATCH BUNDLE
              </Button>
            </div>
          </div>
        </TabPane>
        <TabPane tab='CLAIM BUNDLE' key='3'>
          <BundleClaim />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BatchBundle;
