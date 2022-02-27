import React, { useState } from "react";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction, useMoralis } from "react-moralis";
import cloneDeep from "lodash/cloneDeep";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "./Pack/Approval";
import { sortSingleArrays, sortMultipleArrays, updateTokenIdsInArray } from "./Pack/ArraySorting";
import AssetPerPack from "./Pack/AssetPerPack";
import CollectionSelector from "./Pack/CollectionSelector";
import ModalNFT from "./Pack/ModalNFT";
import Uploader from "./Pack/Uploader";
import PackClaim from "./Pack/PackClaim";
import PackConfirm from "./Pack/PackConfirm";
import { openNotification } from "./Notification";
import { getExplorer, getNativeByChain } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { Button, Input, Switch, Tabs, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./Pack/styles";
const { TabPane } = Tabs;

const BatchPack = () => {
  const contractProcessor = useWeb3ExecuteFunction();
  const {
    walletAddress,
    chainId,
    assemblyAddressEthereum,
    assemblyAddressPolygon,
    assemblyAddressMumbai,
    assemblyABI,
    customAssemblyABI
  } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const [isSinglePackConfirmVisible, setIsSinglePackConfirmVisible] = useState(false);
  const [isBatchPackConfirmVisible, setIsBatchPackConfirmVisible] = useState(false);
  const [nameAndSymbol, setNameAndSymbol] = useState([]);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const customAssemblyABIJson = JSON.parse(customAssemblyABI);
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const nativeName = getNativeByChain(chainId);
  const [isJSON, setIsJSON] = useState(false);
  const [jsonFile, setJsonFile] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [packNumber, setPackNumber] = useState();
  const assetPerPackRef = React.useRef();
  const assetModalRef = React.useRef();
  const customContractAddrsRef = React.useRef();
  const uploaderRef = React.useRef();
  const [customAddrs, setCustomAddrs] = useState();
  const [displayFactory, setDisplayFactory] = useState(false);

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

  const showSingleConfirm = () => {
    setIsSinglePackConfirmVisible(true);
  };

  const handleSingleConfirmOk = () => {
    setIsSinglePackConfirmVisible(false);
    handleSinglePack();
  };

  const handleSingleConfirmCancel = () => {
    setIsSinglePackConfirmVisible(false);
  };

  const showBatchConfirm = () => {
    setIsBatchPackConfirmVisible(true);
  };

  const handleBatchConfirmOk = () => {
    handleMultiplePack();
    setIsBatchPackConfirmVisible(false);
  };

  const handleBatchConfirmCancel = () => {
    setIsBatchPackConfirmVisible(false);
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

  const handlePackNumber = (e) => {
    setPackNumber(e.target.value);
  };

  const handleSwitch = () => {
    !displayFactory ? setDisplayFactory(true) : setDisplayFactory(false);
  };

  const passNameAndSymbol = (data) => {
    setNameAndSymbol(data);
  };

  const getJsonFile = (file) => {
    setJsonFile(file);
  };

  const isJsonFile = (bool) => {
    setIsJSON(bool);
  };

  async function getSinglePackArrays() {
    let data = await sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  }

  async function getMultiplePackArrays(fileContent) {
    let data = await sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  }

  async function singleApproveAll(address, numbers, contractAddr) {
    const addressArr = cloneDeep(address);
    const currentApproval = await checkMultipleAssetsApproval(
      addressArr,
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
        let toAllow = numbers[count].toString();
        if (parseInt(currentApproval[i]) < parseInt(toAllow)) {
          await approveERC20contract(ERC20add[i], toAllow, contractAddr, contractProcessor);
          count++;
        }
      }

      var pointerNFT = numbers[1];
      let uniqueAddrs = [ ...new Set(address)]
      for (let i = 0; i < uniqueAddrs.length; i++) {
        if (currentApproval[pointerNFT] === false) {
          await approveNFTcontract(uniqueAddrs[i], contractAddr, contractProcessor);
        }
        pointerNFT++;
      }

    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your pack's assets!";
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
        let toAllow = (numbers[count] * packNumber).toString();
        if (parseInt(currentMultipleApproval[i]) < parseInt(toAllow)) {
          await approveERC20contract(ERC20add[i], toAllow, contractAddr, contractProcessor);
          count++;
        }
      }

      var pointerNFT = numbers[1];
      let uniqueAddrs = [ ...new Set(address)];
      for (let i = 0; i < uniqueAddrs.length; i++) {
        if (currentMultipleApproval[pointerNFT] === false) {
          await approveNFTcontract(uniqueAddrs[i], contractAddr, contractProcessor);
        }
        pointerNFT++;
      }

    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your packs's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function singlePackMint(assetContracts, assetNumbers, contractAddr) {
    const ops = {
      contractAddress: contractAddr,
      functionName: "mint",
      abi: assemblyABIJson,
      msgValue: assetNumbers[0],
      params: {
        _to: walletAddress,
        _addresses: assetContracts,
        _numbers: assetNumbers
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: (response) => {
        let asset = response.events.AssemblyAsset.returnValues;
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
        let title = "Pack created!";
        let msg = (
          <>
            Your pack has been succesfully created!
            <br></br>
            Token id: {getEllipsisTxt(asset.tokenId, 6)}
            <br></br>
            <a href={link} target='_blank' rel='noreferrer noopener'>
              View in explorer: &nbsp;
              <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
            </a>
          </>
        );

        openNotification("success", title, msg);
        console.log("Pack created");
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while creating your pack!";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  async function multiplePackMint(assetContracts, assetNumbers, packNum, contractAddr) {
    const addressArr = cloneDeep(assetContracts);
    var txHash;

    const ops = {
      contractAddress: contractAddr,
      functionName: "batchMint",
      abi: customAssemblyABIJson,
      msgValue: parseInt(assetNumbers[0]) * parseInt(packNum),
      params: {
        _to: walletAddress,
        _addresses: addressArr,
        _arrayOfNumbers: assetNumbers,
        _amountOfPacks: packNum
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: (response) => {
        txHash = response.transactionHash;
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
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
        createdBatchPack.set("owner", walletAddress);
        createdBatchPack.set("amountOfPack", packNumber);
        createdBatchPack.set("transaction_hash", txHash);
        createdBatchPack.set("collectionName", nameAndSymbol[0] ? nameAndSymbol[0] : "Pack-Generator-NFT");
        createdBatchPack.set("collectionSymbol", nameAndSymbol[1] ? nameAndSymbol[1] : "PGNFT");
        createdBatchPack.set("collectionSupply", nameAndSymbol[2]);

        try {
          createdBatchPack.save();
        } catch (error) {
          console.log(error);
        }
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while batch bundling! Please, check your input datas";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  async function handleSinglePack() {
    const contractAddress = getContractAddress();
    const result = await getSinglePackArrays();

    try {
      const addressArr = result[0];
      const assetNumbers = result[1];
      const clonedArray = cloneDeep(addressArr);

      await singleApproveAll(clonedArray, assetNumbers, contractAddress).then(() => {
        singlePackMint(addressArr, assetNumbers, contractAddress);
      });
    } catch (err) {
      let title = "Single Pack error";
      let msg = "Something went wrong while doing your pack. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  }

  async function handleMultiplePack() {
    if (!isJSON) {
      let title = "No CSV submitted";
      let msg =
        "You haven't submitted any CSV file. Your packs won't contain any NFTs. Reject all transactions to cancel.";
      openNotification("warning", title, msg);
    }
    const PACK_LIMIT = 200;
    const contractAddress = getContractAddress();
    try {
      const sortedData = await getMultiplePackArrays(jsonFile);
      const assetsArray = sortedData[0];
      const numbersArray = sortedData[1];
      const contractNumbersArray = await updateTokenIdsInArray(jsonFile, numbersArray, packNumber, ERC1155Number);
      console.log(contractNumbersArray);
      /*SMART-CONTRACT CALL:
       **********************/
      const clonedArray = cloneDeep(assetsArray);
      await multipleApproveAll(clonedArray, numbersArray, contractAddress).then(() => {
        let counter = contractNumbersArray.length / PACK_LIMIT;
        counter = Math.ceil(counter);

        for (let i = 0; i < counter; i++) {
          if (contractNumbersArray.length > PACK_LIMIT) {
            let temp = contractNumbersArray.splice(0, PACK_LIMIT);
            multiplePackMint(assetsArray, temp, PACK_LIMIT, contractAddress);
          } else {
            multiplePackMint(assetsArray, contractNumbersArray, contractNumbersArray.length, contractAddress);
          }
        }
      });
    } catch (err) {
      let title = "Batch Pack error";
      let msg = "Something went wrong while doing your batch packs. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  }

  const onClickReset = () => {
    setERC721Number(0);
    setERC1155Number(0);
    setPackNumber();
    setIsJSON(false);
    setJsonFile();
    if (assetPerPackRef && assetPerPackRef.current) {
      assetPerPackRef.current.reset();
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
        <TabPane tab='SINGLE PACK' key='1'>
          <div style={{ height: "auto" }}>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your single Pack</label>

              <div style={{ display: "grid", gridTemplateColumns: "49% 2% 49%" }}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ position: "relative" }}>
                    <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
                      PICK SOME NFTs
                    </Button>
                    <Tooltip
                      title="Select the NFT(s) that you'd like to add to the pack."
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
                    <div style={{ color: "white", fontSize: "13px" }}>
                      {NFTsArr && NFTsArr.length > 0 && <p>NFTs to Pack:</p>}

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
                            key={key}
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
                <div style={{ fontSize: "10px", margin: "auto", justifyContent: "center" }}>
                  <p>AND</p>
                  <p>/</p>
                  <p>OR</p>
                </div>
                <div style={styles.transparentContainerInside}>
                  <>
                    <AssetPerPack getAssetValues={getAssetValues} ref={assetPerPackRef} />
                  </>
                </div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button shape='round' style={styles.resetButton} onClick={onClickReset}>
                  RESET
                </Button>
              </div>
            </div>
            <PackConfirm
              onOk={handleSingleConfirmOk}
              onCancel={handleSingleConfirmCancel}
              isVisible={isSinglePackConfirmVisible}
              NFTsArr={NFTsArr}
              ethAmount={ethAmount}
              selectedTokens={selectedTokens}
              isBatch={false}
            ></PackConfirm>
            <Button shape='round' style={styles.runFunctionButton} onClick={showSingleConfirm}>
              PACK
            </Button>
          </div>
        </TabPane>
        <TabPane tab='BATCH PACK' key='2'>
          <div style={{ height: "auto" }}>
            <div style={styles.transparentContainer}>
              <label style={{ letterSpacing: "1px" }}>Prepare your Multiple Packs</label>
              <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                1. Create / Select a pack collection (Optional)
                <Switch style={{ marginLeft: "30px" }} defaultChecked={false} onChange={handleSwitch} />
              </p>
              {displayFactory && (
                <CollectionSelector
                  customContractAddrs={customContractAddrs}
                  ref={customContractAddrsRef}
                  passNameAndSymbol={passNameAndSymbol}
                />
              )}

              <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                2. Select the assets to pack: {nativeName} | TOKENS | NFTs
              </p>
              <div style={styles.contentGrid}>
                <div style={styles.transparentContainerInside}>
                  <div style={{ margin: "auto", marginTop: "30px" }}>
                    <Uploader isJsonFile={isJsonFile} getJsonFile={getJsonFile} ref={uploaderRef} />
                    <p style={{ fontSize: "12px" }}>
                      Number of ERC721 per pack:
                      <Tooltip
                        title='Enter the number of ERC721 NFT that will be contained inside each pack (up to 50 ERC721 per pack).'
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
                    <p style={{ fontSize: "12px", marginTop: "20px" }}>
                      Number of ERC1155 per pack:
                      <Tooltip
                        title='Enter the number of ERC1155 NFT that will be contained inside each pack (up to 50 ERC1155 per pack).'
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
                <div style={{ fontSize: "11px", margin: "auto", justifyContent: "center" }}>
                  <p>AND</p>
                  <p>/</p>
                  <p>OR</p>
                </div>
                <div style={styles.transparentContainerInside}>
                  <AssetPerPack getAssetValues={getAssetValues} ref={assetPerPackRef} />
                </div>
              </div>
              <div style={{ margin: "auto", marginTop: "10px", width: "50%" }}>
                <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
                  3. Number of packs to mint:
                  <Tooltip
                    title='Enter the total amount of packs to be minted. Up to 200 packs per Txs, up to 10,000 in total (10,000 = 50 Txs).'
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
                  value={packNumber}
                  onChange={handlePackNumber}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button style={styles.resetButton} shape='round' onClick={onClickReset}>
                  RESET
                </Button>
              </div>
            </div>
            <>
              <PackConfirm
                isVisible={isBatchPackConfirmVisible}
                onCancel={handleBatchConfirmCancel}
                onOk={handleBatchConfirmOk}
                NFTsArr={[]}
                ethAmount={ethAmount}
                selectedTokens={selectedTokens}
                packNumber={packNumber}
                isBatch={true}
                ERC721Number={ERC721Number}
                ERC721Name={nameAndSymbol[0]}
                ERC1155Number={ERC1155Number}
                csv={jsonFile}
              ></PackConfirm>
              <Button shape='round' style={styles.runFunctionButton} onClick={showBatchConfirm}>
                BATCH PACK
              </Button>
            </>
          </div>
        </TabPane>
        <TabPane tab='CLAIM PACK' key='3'>
          <PackClaim />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BatchPack;
