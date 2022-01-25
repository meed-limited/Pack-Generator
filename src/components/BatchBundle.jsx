import React, { useState } from "react";
import { Button, Input, Tabs, Divider } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import AssetModal from "./Minter/AssetModal";
import cloneDeep from "lodash/cloneDeep";
import Claim from "./Minter/Claim";
import { openNotification } from "./Notification";
import { sortSingleArrays, sortMultipleArrays } from "./Minter/ArraySorting";
import Uploader from "./Minter/Uploader";
import { approveNFTcontract } from "./Minter/Approval";
import { approveERC20contract } from "./Minter/Approval";
import AssetPerBundle from "./Minter/AssetPerBundle";
import styles from "./Minter/styles";
const { TabPane } = Tabs;

const BatchBundle = () => {
  const { walletAddress, assemblyAddress, assemblyABI } = useMoralisDapp();
  const [isNFTModalVisible, setIsNFTModalVisible] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
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
  const assetPerBundleRef = React.useRef();
  const assetModalRef = React.useRef();

  const showNFTModal = () => {
    setIsNFTModalVisible(true);
  };

  const handleNFTOk = (selectedItems) => {
    setNFTsArr(selectedItems);
    setIsNFTModalVisible(false);
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

    return { contracts: data[0], singleArray: data[1] };
  }

  async function getMultipleBundleArrays(fileContentValue) {
    setContractAdressesArray([]);
    setMultipleNumbersArrays([]);
    let data = await sortMultipleArrays(ethAmount, selectedTokens, fileContentValue, ERC721Number, ERC1155Number);
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
        let title = "Bundle created!";
        let msg = "Your bundle has been succesfully created!<br/>Open in the explorer";
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
    await getSingleBundleArrays();
    await singleBundleMint(contractAdressesArray, singleNumbersArray);
  }

  async function handleMultipleBundle() {
    try {
      const fetchIpfsFile = await fetchIpfs();
      const res = await getMultipleBundleArrays(fetchIpfsFile);

      var arrOfArr = [];
      if (res && res.length > 0) {
        const numOfERC20 = multipleNumbersArrays[1];
        var firstNFTIndex = 4 + parseInt(numOfERC20);

        var k = 0;
        for (let i = 0; i < bundleNumber; i++) {
          let arr = cloneDeep(multipleNumbersArrays);

          for (let j = firstNFTIndex; j < arr.length; j++) {
            var value = res[k].token_id;
            arr[j] = value;

            if (res[k].contract_type === "ERC1155") {
              var amount = res[k].amount;
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
    } catch (err) {
      let title = "No JSON submitted";
      let msg = "No JSON file was detected. Your bundles won't contain any NFTs.";
      openNotification("error", title, msg);
      console.log(err);
    }

    console.log(contractAdressesArray);
    console.log(arrOfArr);

    await multipleApproveAll(contractAdressesArray, multipleNumbersArrays);
    // for (let i = 0; i < bundleNumber; i++) {
    //   multipleBundleMint(contractAdressesArray, arrOfArr[i], i);
    // }
  }

  const onClickReset = () => {
    if (assetPerBundleRef && assetPerBundleRef.current) {
      assetPerBundleRef.current.reset();
    }
    if (assetModalRef && assetModalRef.current) {
      assetModalRef.current.reset();
    }
  };

  const forDev = async () => {
    const result = await getSingleBundleArrays();
    console.log("contractAdressesArray", result.contracts);
    console.log("singleNumbersArray", result.singleArray);
  };

  return (
    <div style={styles.content}>
      <Tabs centered tabBarGutter='50px' onChange={onClickReset} tabBarStyle={{ height: "60px" }} type='line'>
        <TabPane tab='Single Bundle' key='1' onChange={onClickReset}>
          <Divider />
          <div>
            <h2 style={styles.h2}>Prepare Your Single Bundle</h2>
            <div style={styles.blackContainer}>
              <label>Select all the assets to bundle:</label>

              <div style={{ display: "grid", gridTemplateColumns: "50% 50%" }}>
                <div style={{ position: "relative" }}>
                  <Button type='primary' shape='round' style={{ width: "70%", margin: "30px" }} onClick={showNFTModal}>
                    Pick Some NFTs
                  </Button>
                  <AssetModal
                    handleNFTCancel={handleNFTCancel}
                    isNFTModalVisible={isNFTModalVisible}
                    handleNFTOk={handleNFTOk}
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
                          <p>{`NFT: ${nftItem.token_id} - ${nftItem.contract_type}`}</p>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <AssetPerBundle getAssetValues={getAssetValues} ref={assetPerBundleRef} />
                </div>
              </div>
              <div>
                <Button type='primary' onClick={onClickReset} danger>
                  Reset
                </Button>
                <Button style={{ left: "20px" }} type='primary' onClick={forDev} danger>
                  console.log
                </Button>
              </div>
            </div>
            <button style={styles.runFunctionButton} onClick={handleSingleBundle}>
              Bundle All
            </button>
          </div>
        </TabPane>
        <TabPane tab='Batch Bundle' key='2' onChange={onClickReset}>
          <Divider />
          <div>
            <h2 style={styles.h2}>Prepare Your Multiple Bundles</h2>
            <div style={styles.blackContainer}>
              <label>Select all the assets to bundle:</label>
              <div style={styles.contentGrid}>
                <div style={{ margin: "auto", marginTop: "30px" }}>
                  <Uploader getIpfsHash={getIpfsHash} />
                  <p>Number of ERC721 per bundle:</p>
                  <p>
                    <Input
                      style={{ width: "40%", marginBottom: "15px" }}
                      placeholder='Number of ERC721'
                      type='number'
                      onChange={(e) => setERC721Number(e.target.value)}
                    />
                  </p>
                  <p>Number of ERC1155 per bundle:</p>
                  <p>
                    <Input
                      style={{ width: "40%" }}
                      placeholder='Number of ERC1155'
                      type='number'
                      onChange={(e) => setERC1155Number(e.target.value)}
                    />
                  </p>
                </div>
                <AssetPerBundle getAssetValues={getAssetValues} ref={assetPerBundleRef} />
              </div>
              <div style={{ margin: "auto", width: "50%" }}>
                <label style={{ fontSize: "17px" }}>Enter the desired amount of bundles:</label>
                <Input
                  placeholder='Number of bundles'
                  type='number'
                  onChange={(e) => setBundleNumber(e.target.value)}
                />
              </div>
              <div style={{ marginTop: "30px" }}>
                <Button type='primary' onClick={onClickReset} danger>
                  Reset
                </Button>
              </div>
            </div>
            <button style={styles.runFunctionButton} onClick={handleMultipleBundle}>
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

export default BatchBundle;
