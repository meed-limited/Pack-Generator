import React, { useState } from "react";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import cloneDeep from "lodash/cloneDeep";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "./Bundle/Approval";
import { sortSingleArrays, sortMultipleArrays, updateTokenIdsInArray } from "./Bundle/ArraySorting";
import AssetPerBundle from "./Bundle/AssetPerBundle";
import ContractAddrsSelector from "./Bundle/ContractAddrsSelector";
import ModalNFT from "./Bundle/ModalNFT";
import Uploader from "./Bundle/Uploader";
import BundleClaim from "./Bundle/BundleClaim";
import { openNotification } from "./Notification";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { Button, Input, Tabs, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./Bundle/styles";
const { TabPane } = Tabs;

const BatchBundle = () => {
  const contractProcessor = useWeb3ExecuteFunction();
  const {
    walletAddress,
    chainId,
    assemblyAddressEthereum,
    assemblyAddressPolygon,
    assemblyAddressMumbai,
    assemblyABI
  } = useMoralisDapp();
  const contractABIJson = JSON.parse(assemblyABI);
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [isJSON, setIsJSON] = useState(false);
  const [jsonFile, setJsonFile] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [bundleNumber, setBundleNumber] = useState();
  const assetPerBundleRef = React.useRef();
  const assetModalRef = React.useRef();
  const customContractAddrsRef = React.useRef();
  const uploaderRef = React.useRef();
  const [customAddrs, setCustomAddrs] = useState();

  const customContractAddrs = (addrs) => {
    setCustomAddrs(addrs);
  };

  const getContractAddress = () => {
    if (customAddrs && customAddrs.length > 0) {
      return customAddrs;
    } else {
      if (chainId === "0x1") {
        return assemblyAddressEthereum;
      } else if (chainId === "0x89") {
        return assemblyAddressPolygon;
      } else if (chainId === "0x13881") {
        return assemblyAddressMumbai;
      }
    }
  };

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

  const handleERC721Number = (e) => {
    setERC721Number(e.target.value);
  };

  const handleERC1155Number = (e) => {
    setERC1155Number(e.target.value);
  };

  const handleBundleNumber = (e) => {
    setBundleNumber(e.target.value);
  };

  const getJsonFile = (file) => {
    setJsonFile(file);
  };

  const isJsonFile = (bool) => {
    setIsJSON(bool);
  };

  async function getSingleBundleArrays() {
    let data = await sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  }

  async function getMultipleBundleArrays(fileContent) {
    let data = await sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  }

  async function singleApproveAll(address, numbers, contractAddr) {
    const currentApproval = await checkMultipleAssetsApproval(
      address,
      numbers,
      walletAddress,
      contractAddr,
      contractProcessor
    );

    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);
    try {
      for (let i = 0; i < ERC20add.length; i++) {
        let toAllow = numbers[count];
        if (parseInt(currentApproval[i]) < parseInt(toAllow)) {
          await approveERC20contract(ERC20add[i], toAllow.toString(), contractAddr, contractProcessor);
          count++;
        }
      }

      var pointerNFT = numbers[1];
      for (let i = 0; i < address.length; i++) {
        if (currentApproval[pointerNFT] === false) {
          await approveNFTcontract(address[i], contractAddr, contractProcessor);
        }
        pointerNFT++;
      }
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your bundle's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function multipleApproveAll(address, numbers, contractAddr) {
    const currentMultipleApproval = await checkMultipleAssetsApproval(
      address,
      numbers,
      walletAddress,
      contractAddr,
      contractProcessor
    );

    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);
    try {
      for (let i = 0; i < ERC20add.length; i++) {
        let toAllow = (numbers[count] * bundleNumber).toString();
        if (parseInt(currentMultipleApproval[i]) < parseInt(toAllow)) {
          await approveERC20contract(ERC20add[i], toAllow, contractAddr, contractProcessor);
          count++;
        }
      }

      var pointerNFT = numbers[1];
      for (let i = 0; i < address.length; i++) {
        if (currentMultipleApproval[pointerNFT] === false) {
          await approveNFTcontract(address[i], contractAddr, contractProcessor);
        }
        pointerNFT++;
      }
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your bundles's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function singleBundleMint(assetContracts, assetNumbers, contractAddr) {
    const addressArr = cloneDeep(assetContracts);

    await singleApproveAll(addressArr, assetNumbers, contractAddr).then(() => {
      const ops = {
        contractAddress: contractAddr,
        functionName: "mint",
        abi: contractABIJson,
        msgValue: assetNumbers[0],
        params: {
          _to: walletAddress,
          _addresses: assetContracts,
          _numbers: assetNumbers
        }
      };

      contractProcessor.fetch({
        params: ops,
        onSuccess: async (response) => {
          let asset = response.events.AssemblyAsset.returnValues;
          let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
          let title = "Bundle created!";
          let msg = (
            <div>
              Your bundle has been succesfully created!
              <br></br>
              Token id: {getEllipsisTxt(asset.tokenId, 6)}
              <br></br>
              <a href={link} target='_blank' rel='noreferrer noopener'>
                View in explorer: &nbsp;
                <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
              </a>
            </div>
          );

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

  async function multipleBundleMint(assetContracts, assetNumbers, bundleNum, contractAddr) {
    const addressArr = cloneDeep(assetContracts);
    const ops = {
      contractAddress: contractAddr,
      functionName: "batchMint",
      abi: contractABIJson,
      msgValue: parseInt(assetNumbers[0]) * parseInt(bundleNum),
      params: {
        _to: walletAddress,
        _addresses: addressArr,
        _arrayOfNumbers: assetNumbers,
        _amountOfBundles: bundleNum
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: (response) => {
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
        let title = `Bundles minted!`;
        let msg = (
          <div>
            Congrats!!! {bundleNum} bundles have just been minted and sent to your wallet!
            <br></br>
            <a href={link} target='_blank' rel='noreferrer noopener'>
              View in explorer: &nbsp;
              <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
            </a>
          </div>
        );
        openNotification("success", title, msg);
        console.log(`${bundleNum} bundles have been minted`);
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
    const contractAddress = getContractAddress();
    let result = await getSingleBundleArrays();
    singleBundleMint(result[0], result[1], contractAddress);
  }

  async function handleMultipleBundle() {
    if (!isJSON) {
      let title = "No CSV submitted";
      let msg =
        "You haven't submitted any CSV file. Your bundles won't contain any NFTs. Reject all transactions to cancel.";
      openNotification("warning", title, msg);
    }
    const BUNDLE_LIMIT = 200;
    const contractAddress = getContractAddress();
    try {
      const sortedData = await getMultipleBundleArrays(jsonFile);
      const assetsArray = sortedData[0];
      const numbersArray = sortedData[1];
      const contractNumbersArray = await updateTokenIdsInArray(jsonFile, numbersArray, bundleNumber);

      /*SMART-CONTRACT CALL:
       **********************/
      const clonedArray = cloneDeep(assetsArray);
      await multipleApproveAll(clonedArray, numbersArray, contractAddress).then(() => {
        let counter = contractNumbersArray.length / BUNDLE_LIMIT;
        counter = Math.ceil(counter);

        for (let i = 0; i < counter; i++) {
          if (contractNumbersArray.length > BUNDLE_LIMIT) {
            let temp = contractNumbersArray.splice(0, BUNDLE_LIMIT);
            multipleBundleMint(assetsArray, temp, BUNDLE_LIMIT, contractAddress);
          } else {
            multipleBundleMint(assetsArray, contractNumbersArray, contractNumbersArray.length, contractAddress);
          }
        }
      });
    } catch (err) {
      let title = "Batch Bundle error";
      let msg = "Something went wrong while doing your batch bundles. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  }

  const onClickReset = () => {
    setERC721Number(0);
    setERC1155Number(0);
    setBundleNumber();
    setIsJSON(false);
    setJsonFile();
    if (assetPerBundleRef && assetPerBundleRef.current) {
      assetPerBundleRef.current.reset();
    }
    if (assetModalRef && assetModalRef.current) {
      assetModalRef.current.reset();
    }
    if (customContractAddrsRef && customContractAddrsRef.current) {
      customContractAddrsRef.current.reset();
    }
    if (uploaderRef && uploaderRef.current) {
      uploaderRef.current.reset();
    }
  };

  return (
    <div style={styles.content}>
      <Tabs centered tabBarGutter='50px' onChange={onClickReset} tabBarStyle={styles.tabs} type='line'>
        <TabPane tab='SINGLE BUNDLE' key='1'>
          <div style={{ height: "auto" }}>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your single Bundle</label>

              <div style={{ display: "grid", gridTemplateColumns: "49% 2% 49%" }}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ position: "relative" }}>
                    <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
                      Pick Some NFTs
                    </Button>
                    <Tooltip
                      title="Select the NFT(s) that you'd like to add to the bundle."
                      style={{ position: "absolute", top: "35px", right: "80px" }}
                    >
                      <QuestionCircleOutlined
                        style={{ color: "white", paddingLeft: "15px", paddingBottom: "40px", transform: "scale(0.8)" }}
                      />
                    </Tooltip>
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
                            key={` ${nftItem.name} - ${nftItem.token_id} - ${nftItem.contract_type}`}
                          >
                            {nftItem.token_id.length > 6 ? (
                              <p>{` ${nftItem.name} - Id: ${getEllipsisTxt(nftItem.token_id, 3)} - ${
                                nftItem.contract_type
                              }`}</p>
                            ) : (
                              <p>{`${nftItem.name} - Id: ${nftItem.token_id} - ${nftItem.contract_type}`}</p>
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
            <Button shape='round' style={styles.runFunctionButton} onClick={handleSingleBundle}>
              BUNDLE
            </Button>
          </div>
        </TabPane>
        <TabPane tab='BATCH BUNDLE' key='2'>
          <div style={{ height: "auto" }}>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your Multiple Bundles</label>
              <p style={{ fontSize: "18px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                1. Create a brand new ERC721 bundle collection (Optional)
              </p>

              <ContractAddrsSelector customContractAddrs={customContractAddrs} ref={customContractAddrsRef} />

              <p style={{ fontSize: "18px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                2. Select all the assets to bundle - Native currency | ERC20 | NFTs
              </p>
              <div style={styles.contentGrid}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ margin: "auto", marginTop: "30px" }}>
                    <Uploader isJsonFile={isJsonFile} getJsonFile={getJsonFile} ref={uploaderRef} />
                    <p style={{ fontSize: "15px" }}>
                      Number of ERC721 per bundle:
                      <Tooltip
                        title='Enter the number of ERC721 NFT that will be contained inside each bundle (up to 50 ERC721 per bundle).'
                        style={{ position: "absolute", top: "35px", right: "80px" }}
                      >
                        <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
                      </Tooltip>
                    </p>
                    <p>
                      <Input
                        style={styles.transparentInput}
                        type='number'
                        min='0'
                        max='50'
                        value={ERC721Number}
                        onChange={handleERC721Number}
                      />
                    </p>
                    <p style={{ fontSize: "15px", marginTop: "20px" }}>
                      Number of ERC1155 per bundle:
                      <Tooltip
                        title='Enter the number of ERC1155 NFT that will be contained inside each bundle (up to 50 ERC1155 per bundle).'
                        style={{ position: "absolute", top: "35px", right: "80px" }}
                      >
                        <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
                      </Tooltip>
                    </p>
                    <p>
                      <Input
                        style={styles.transparentInput}
                        type='number'
                        min='0'
                        max='50'
                        value={ERC1155Number}
                        onChange={handleERC1155Number}
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
                <p style={{ fontSize: "18px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                  3. Enter the desired amount of bundles:
                  <Tooltip
                    title='Enter the total amount of bundles to be minted. Up to 200 bundles per Txs, up to 10,000 in total (10,000 = 50 Txs).'
                    style={{ position: "absolute", top: "35px", right: "80px" }}
                  >
                    <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
                  </Tooltip>
                </p>
                <Input
                  style={styles.transparentInput}
                  type='number'
                  min='0'
                  max='10000'
                  value={bundleNumber}
                  onChange={handleBundleNumber}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button style={styles.resetButton} shape='round' onClick={onClickReset}>
                  RESET
                </Button>
              </div>
            </div>
            <div>
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
