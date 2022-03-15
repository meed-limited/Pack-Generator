import React, { useState } from "react";
import { useMoralis, useNativeBalance } from "react-moralis";
import { Moralis } from "moralis";
import { getAssemblyAddress, customAssemblyABI } from "constant/constant";
import cloneDeep from "lodash/cloneDeep";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "../../../helpers/approval";
import { sortMultipleArrays, updateTokenIdsInArray } from "../../../helpers/arraySorting";
import AssetPerPack from "./components/AssetPerPack";
import CollectionSelector from "./components/CollectionSelector";
import Uploader from "./components/Uploader";
import PackConfirm from "./components/PackConfirm";
import { openNotification } from "../../../helpers/notifications";
import { getExplorer } from "helpers/networks";
import { Button, Input, Switch, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./styles";

const BatchPack = () => {
  const { account, chainId } = useMoralis();
  const customAssemblyABIJson = JSON.parse(customAssemblyABI);
  const [displayFactory, setDisplayFactory] = useState(false);
  const { nativeToken } = useNativeBalance(chainId);
  const [isBatchPackConfirmVisible, setIsBatchPackConfirmVisible] = useState(false);
  const [customCollectionData, setCustomCollectionData] = useState([]); // Address, Name, Symbol, Supply from CollectionSelector
  const [isJSON, setIsJSON] = useState(false);
  const [jsonFile, setJsonFile] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [packNumber, setPackNumber] = useState();
  const assetPerPackRef = React.useRef();
  const assetModalRef = React.useRef();
  const customCollectionInfoRef = React.useRef();
  const uploaderRef = React.useRef();

  const handleFactorySwitch = () => {
    !displayFactory ? setDisplayFactory(true) : setDisplayFactory(false);
  };

  const customCollectionInfo = (info) => {
    if (info !== undefined) {
      setCustomCollectionData([info[0], info[1], info[2], info[3]]);
    }
  };

  const getContractAddress = () => {
    if (customCollectionData[0] && customCollectionData[0].length > 0) {
      return customCollectionData[0];
    } else {
      return getAssemblyAddress(chainId);
    }
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

  const getJsonFile = (file) => {
    setJsonFile(file);
  };

  const isJsonFile = (bool) => {
    setIsJSON(bool);
  };

  const getMultiplePackArrays = (fileContent) => {
    let data = sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  };

  async function multipleApproveAll(address, numbers, contractAddr) {
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
  }

  async function multiplePackMint(assetContracts, assetNumbers, packNum, contractAddr) {
    const addressArr = cloneDeep(assetContracts);
    var txHash;

    const sendOptions = {
      contractAddress: contractAddr,
      functionName: "batchMint",
      abi: customAssemblyABIJson,
      msgValue: parseInt(assetNumbers[0]) * parseInt(packNum),
      params: {
        _to: account,
        _addresses: addressArr,
        _arrayOfNumbers: assetNumbers,
        _amountOfPacks: packNum
      }
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      const receipt = await transaction.wait(2);
      txHash = receipt.transactionHash;
      let link = `${getExplorer(chainId)}tx/${txHash}`;
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
      createdBatchPack.set("amountOfPack", packNumber);
      createdBatchPack.set("transaction_hash", txHash);
      createdBatchPack.set("collectionName", customCollectionData[1] ? customCollectionData[1] : "Pack-Generator-NFT");
      createdBatchPack.set("collectionSymbol", customCollectionData[2] ? customCollectionData[2] : "PGNFT");
      createdBatchPack.save();
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while batch bundling! Please, check your input datas";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  const handleMultiplePack = async () => {
    if (!isJSON) {
      let title = "No CSV submitted";
      let msg =
        "You haven't submitted any CSV file. Your packs won't contain any NFTs. Reject all transactions to cancel.";
      openNotification("warning", title, msg);
    }
    const PACK_LIMIT = 200;
    const contractAddress = await getContractAddress();
    try {
      const sortedData = getMultiplePackArrays(jsonFile);
      const assetsArray = sortedData[0];
      const numbersArray = sortedData[1];
      const contractNumbersArray = updateTokenIdsInArray(jsonFile, numbersArray, packNumber, ERC1155Number);

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
  };

  const onClickReset = () => {
    setDisplayFactory(false);
    setCustomCollectionData([]);
    setERC721Number(0);
    setERC1155Number(0);
    setPackNumber();
    setIsJSON(false);
    setJsonFile();
    setEthAmount(0);
    setSelectedTokens([]);
    if (assetPerPackRef && assetPerPackRef.current) {
      assetPerPackRef.current.reset();
    }
    if (assetModalRef && assetModalRef.current) {
      assetModalRef.current.reset();
    }
    if (customCollectionInfoRef && customCollectionInfoRef.current) {
      customCollectionInfoRef.current.reset();
    }
    if (uploaderRef && uploaderRef.current) {
      uploaderRef.current.reset();
    }
  };

  return (
    <div style={{ height: "auto" }}>
      <div style={styles.transparentContainer}>
        <label style={{ letterSpacing: "1px" }}>Prepare your Multiple Packs</label>
        <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
          1. Create / Select a pack collection (Optional)
          <Switch
            style={{ marginLeft: "30px" }}
            defaultChecked={false}
            checked={!displayFactory ? false : true}
            onChange={handleFactorySwitch}
          />
        </p>
        {displayFactory && (
          <CollectionSelector customCollectionInfo={customCollectionInfo} ref={customCollectionInfoRef} />
        )}

        <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
          2. Select the assets to pack: {nativeToken?.name} | TOKENS | NFTs
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
          ERC1155Number={ERC1155Number}
          csv={jsonFile}
        ></PackConfirm>
        <Button shape='round' style={styles.runFunctionButton} onClick={showBatchConfirm}>
          BATCH PACK
        </Button>
      </>
    </div>
  );
};

export default BatchPack;
