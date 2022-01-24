import React, { useState } from "react";
import { Button, Input, Tabs, Divider } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import AssetModal from "./Minter/AssetModal";
import cloneDeep from "lodash/cloneDeep";
import Claim from "./Minter/Claim";
import { openNotification } from "./Notification";
import { sortSingleArrays, sortMultipleArrays } from "./Minter/ArraySorting";
import Uploader from "./Uploader";
import { approveNFTcontract } from "./Minter/Approval";
import { approveERC20contract } from "./Minter/Approval";
import AssetPerBundle from "./Minter/AssetPerBundle";
const { TabPane } = Tabs;

const styles = {
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
  }
};

const PackMinter = () => {
  const { walletAddress, assemblyAddress, assemblyABI } = useMoralisDapp();
  const [isNFTModalVisible, setIsNFTModalVisible] = useState(false);

  const [isAssetSelected, setIsAssetSelected] = useState("");

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [fileContent, setFileContent] = useState();
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [contractAdressesArray, setContractAdressesArray] = useState([]);
  const [singleNumbersArray, setSingleNumbersArray] = useState([]);
  const [multipleNumbersArrays, setMultipleNumbersArrays] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [bundleNumber, setBundleNumber] = useState();
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(assemblyABI);

  const showNFTModal = () => {
    setIsNFTModalVisible(true);
  };

  const handleNFTOk = (selectedItems) => {
    setNFTsArr(selectedItems);
    setConfirmLoading(true);
    setIsNFTModalVisible(false);
    setConfirmLoading(false);
  };

  const handleNFTCancel = () => {
    setIsNFTModalVisible(false);
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
      let title = "Something went wrong";
      let msg = "Oops, something went wrong while fecthing the JSON file! Did you forget to submit the file?";
      openNotification("error", title, msg);
      console.log(e);
    }
  }

  async function getSingleBundleArrays() {
    setContractAdressesArray([]);
    setSingleNumbersArray([]);
    let data = await sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    setContractAdressesArray(data[0]);
    setSingleNumbersArray(data[1]);
  }

  async function getMultipleBundleArrays() {
    setContractAdressesArray([]);
    setMultipleNumbersArrays([]);
    let data = await sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    setContractAdressesArray(data[0]);
    setMultipleNumbersArrays(data[1]);
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
    console.log(address);
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
    await singleApproveAll(assetContracts, assetNumbers);

    const ops = {
      contractAddress: assemblyAddress,
      functionName: "mint",
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

  async function multipleBundleMint(assetContracts, assetNumbers, bundleNum) {
    const addressArr = cloneDeep(assetContracts);
    const ops = {
      contractAddress: assemblyAddress,
      functionName: "mint",
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

  async function handleSingleBundle() {
    await getSingleBundleArrays();
    await singleBundleMint(contractAdressesArray, singleNumbersArray);
  }

  async function handleMultipleBundle() {
    //if (!fileContent || fileContent.length === 0) {
    try {
      const fetchIpfsFile = await fetchIpfs();
      setFileContent(fetchIpfsFile);
    } catch (err) {
      let title = "No JSON submitted";
      let msg = "No JSON file was detected. Your bundles won't contain any NFTs.";
      openNotification("error", title, msg);
      console.log(err);
    }
    //} else {

    await getMultipleBundleArrays();
    console.log(fileContent);
    await multipleApproveAll(contractAdressesArray, multipleNumbersArrays);
    var arrOfArr = [];
    if (fileContent && fileContent.length > 0) {
      const numOfERC20 = multipleNumbersArrays[1];
      var firstNFTIndex = 4 + parseInt(numOfERC20);

      var k = 0;
      for (let i = 0; i < bundleNumber; i++) {
        let arr = cloneDeep(multipleNumbersArrays);

        for (let j = firstNFTIndex; j < arr.length; j++) {
          var value = fileContent[k].token_id;
          arr[j] = value;

          if (fileContent[k].contract_type === "ERC1155") {
            var amount = fileContent[k].amount;
            arr[j + 1] = amount;
            j++;
          }
          k++;
        }
        arrOfArr.push(arr);
      }
    } else {
      for (let i = 0; i < bundleNumber; i++) {
        arrOfArr[i] = multipleNumbersArrays;
      }
    }
    console.log(contractAdressesArray);
    console.log(arrOfArr);
    for (let i = 0; i < bundleNumber; i++) {
      multipleBundleMint(contractAdressesArray, arrOfArr[i], i);
    }
  }

  const onClickReset = () => {
    setNFTsArr([]);
    setEthAmount(0);
    setSelectedTokens([]);
    setContractAdressesArray([]);
    setSingleNumbersArray([]);
    setMultipleNumbersArrays([]);
  };

  async function forDev() {
    await getSingleBundleArrays();
    console.log(contractAdressesArray);
    console.log(singleNumbersArray);
  }

  return (
    <div
      style={{
        margin: "auto",
        textAlign: "center",
        width: "80%"
      }}
    >
      <Tabs centered tabBarGutter='50px' onChange={onClickReset} tabBarStyle={{ height: "60px" }} type='line'>
        <TabPane tab='Single Bundle' key='1'>
          <Divider />
          <div style={styles.bundleMinter}>
            <h2 style={styles.h2}>Prepare Your Single Bundle</h2>
            <div style={styles.container}>
              <label>Select all the assets to bundle:</label>

              <div style={{ display: "grid", gridTemplateColumns: "50% 50%" }}>
                <div style={{ position: "relative" }}>
                  <Button type='primary' style={{ width: "70%", margin: "30px" }} onClick={showNFTModal}>
                    Pick Some NFTs
                  </Button>
                  <AssetModal
                    handleNFTCancel={handleNFTCancel}
                    isNFTModalVisible={isNFTModalVisible}
                    handleNFTOk={handleNFTOk}
                    confirmLoading={confirmLoading}
                  />
                  <div
                    style={{
                      color: "white",
                      fontSize: "16px"
                    }}
                  >
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
                  <div style={{ position: "absolute", bottom: "0", left: "45%" }}>
                    <Button type='primary' onClick={onClickReset} danger>
                      Reset
                    </Button>
                  </div>
                </div>
                <div>
                  <AssetPerBundle onClickReset={isAssetSelected} getAssetValues={getAssetValues} />
                  <div>
                    <Button type='primary' onClick={forDev} danger>
                      console.log
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <button style={styles.mintButton} onClick={handleSingleBundle}>
              Bundle All
            </button>
          </div>
        </TabPane>
        <TabPane tab='Batch Bundle' key='2' onChange={onClickReset}>
          <Divider />
          <div style={styles.bundleMinter}>
            <h2 style={styles.h2}>Prepare Your Multiple Bundles</h2>
            <div style={styles.container}>
              <label>Select all the assets to bundle:</label>

              <div style={{ display: "grid", gridTemplateColumns: "50% 50%", margin: "auto" }}>
                <div style={{ margin: "30px 10px 0 30px" }}>
                  <Uploader getIpfsHash={getIpfsHash} />
                  <p style={{ fontSize: "15px" }}>Number of ERC721 per bundle:</p>
                  <p>
                    <Input
                      style={{ width: "40%", marginBottom: "15px" }}
                      placeholder='Number of ERC721'
                      type='number'
                      onChange={(e) => setERC721Number(e.target.value)}
                    />
                  </p>
                  <p style={{ fontSize: "15px" }}>Number of ERC721 per bundle:</p>
                  <p>
                    <Input
                      style={{ width: "40%" }}
                      placeholder='Number of ERC1155'
                      type='number'
                      onChange={(e) => setERC1155Number(e.target.value)}
                    />
                  </p>
                </div>
                <AssetPerBundle onClickReset={isAssetSelected} getAssetValues={getAssetValues} />
              </div>
            </div>
            <div style={{ marginTop: "30px", margin: "auto", width: "50%" }}>
              <label style={{ fontSize: "20px" }}>Enter the desired amount of bundles:</label>
              <Input placeholder='Number of bundles' type='number' onChange={(e) => setBundleNumber(e.target.value)} />
            </div>

            <button style={styles.mintButton} onClick={handleMultipleBundle}>
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
