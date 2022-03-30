import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { L3P_TOKEN_ADDRESS, getAssemblyAddress, customAssemblyABI } from "../../../Constant/constant";
import CollectionSelector from "./components/CollectionSelector";
import TokenSelection from "./components/TokenSelection";
import Uploader from "./components/Uploader";
import NumOfNftPerPack from "./components/NumOfNftPerPack";
import PackConfirm from "./components/PackConfirm";
import FeeSelector from "./components/FeeSelector";
import Done from "./components/Done";
import { sortMultipleArrays, updateTokenIdsInArray } from "../../../helpers/arraySorting";
import { multipleApproveAll } from "helpers/contractCall";
import { checkERC20allowance, approveERC20contract } from "../../../helpers/approval";
import { openNotification } from "../../../helpers/notifications";
import { getExplorer } from "helpers/networks";
import cloneDeep from "lodash/cloneDeep";
import { Button, Input, Spin, Tooltip } from "antd";
import { DownloadOutlined, FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import styles from "./styles";

const BatchPack = ({ displayPaneMode, setDisplayPaneMode }) => {
  const { account, chainId } = useMoralis();
  const customAssemblyABIJson = JSON.parse(customAssemblyABI);
  const [serviceFee, setServiceFee] = useState();
  const [customCollectionData, setCustomCollectionData] = useState({}); // Address, Name, Symbol, Supply from CollectionSelector
  const [isJSON, setIsJSON] = useState(false);
  const [jsonFile, setJsonFile] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [ERC721Number, setERC721Number] = useState(0);
  const [ERC1155Number, setERC1155Number] = useState(0);
  const [packNumber, setPackNumber] = useState();
  const tokenSelectionRef = React.useRef();
  const customCollectionInfoRef = React.useRef();
  const [packReceipt, setPackReceipt] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const uploaderRef = React.useRef();

  useEffect(() => {
    setDisplayPaneMode("factory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customCollectionInfo = (info) => {
    if (info !== undefined) {
      setCustomCollectionData({ address: info[0], name: info[1], symbol: info[2], supply: info[3] });
    }
  };

  const getContractAddress = () => {
    if (customCollectionData.address && customCollectionData.address.length > 0) {
      return customCollectionData.address;
    } else {
      return getAssemblyAddress(chainId);
    }
  };
  const contractAddress = getContractAddress();

  const handleAssets = (ethAmt, Erc20) => {
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

  const handleNext = () => {
    if (displayPaneMode === "factory") {
      setDisplayPaneMode("tokens");
    } else if (displayPaneMode === "tokens") {
      setDisplayPaneMode("nfts");
    } else if (displayPaneMode === "nfts") {
      setDisplayPaneMode("confirm");
    } else if (displayPaneMode === "confirm") {
      setDisplayPaneMode("pack");
    } else if (displayPaneMode === "pack") {
      setDisplayPaneMode("done");
    }
  };

  const handleBack = () => {
    if (displayPaneMode === "tokens") {
      setDisplayPaneMode("factory");
    } else if (displayPaneMode === "nfts") {
      setDisplayPaneMode("tokens");
    } else if (displayPaneMode === "confirm") {
      setDisplayPaneMode("nfts");
    } else if (displayPaneMode === "pack") {
      setDisplayPaneMode("confirm");
    }
  };

  const handleReset = () => {
    setCustomCollectionData({});
    setERC721Number(0);
    setERC1155Number(0);
    setPackNumber();
    setIsJSON(false);
    setJsonFile();
    setEthAmount(0);
    setSelectedTokens([]);
    setDisplayPaneMode("factory");
    if (tokenSelectionRef && tokenSelectionRef.current) {
      tokenSelectionRef.current.reset();
    }
    if (customCollectionInfoRef && customCollectionInfoRef.current) {
      customCollectionInfoRef.current.reset();
    }
    if (uploaderRef && uploaderRef.current) {
      uploaderRef.current.reset();
    }
  };

  const getMultiplePackArrays = (fileContent) => {
    let data = sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  };

  async function multiplePackMint(assetContracts, assetNumbers, packNum, nativeFee, contractAddr) {
    setWaiting(true);
    const addressArr = cloneDeep(assetContracts);
    const msgValue = (
      parseInt(assetNumbers[0]) * parseInt(packNum) +
      parseInt(nativeFee) * parseInt(packNum)
    ).toString();
    var txHash;

    const sendOptions = {
      contractAddress: contractAddr,
      functionName: "batchMint",
      abi: customAssemblyABIJson,
      msgValue: msgValue,
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
      const receipt = await transaction.wait(2);
      txHash = receipt.transactionHash;
      let link = `${getExplorer(chainId)}tx/${txHash}`;
      setPackReceipt({ txHash: txHash, link: link, PackAmount: packNumber });
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

      setWaiting(false);
      setDisplayPaneMode("done");
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while batch bundling! Please, check your input datas";
      openNotification("error", title, msg);
      console.log(error);
      setWaiting(false);
    }
  }

  const handleMultiplePack = async () => {
    setWaiting(true);
    const PACK_LIMIT = 200;
    const contractAddress = await getContractAddress();
    const feeAmount = getFeeAmountPerPack(packNumber); // Check potential discount
    const nativeAmount = serviceFee.type === "native" ? feeAmount * "1e18" : 0; // Apply discount if fee in native

    if (serviceFee.type === "L3P") {
      await ifServiceFeeInL3P(feeAmount);
    }

    if (!isJSON) {
      let title = "No CSV submitted";
      let msg = "No CSV file submitted. Your packs won't contain any NFTs. Reject all transactions to cancel.";
      openNotification("warning", title, msg);
    }

    try {
      const sortedData = getMultiplePackArrays(jsonFile);
      const assetsArray = sortedData[0];
      const numbersArray = sortedData[1];
      const contractNumbersArray = updateTokenIdsInArray(jsonFile, numbersArray, packNumber, ERC1155Number);
      const clonedArray = cloneDeep(assetsArray);

      await multipleApproveAll(account, clonedArray, numbersArray, packNumber, contractAddress).then(() => {
        let counter = contractNumbersArray.length / PACK_LIMIT;
        counter = Math.ceil(counter);

        for (let i = 0; i < counter; i++) {
          if (contractNumbersArray.length > PACK_LIMIT) {
            let temp = contractNumbersArray.splice(0, PACK_LIMIT);
            multiplePackMint(assetsArray, temp, PACK_LIMIT, nativeAmount.toString(), contractAddress);
          } else {
            multiplePackMint(
              assetsArray,
              contractNumbersArray,
              contractNumbersArray.length,
              nativeAmount.toString(),
              contractAddress
            );
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

  const getFeeAmountPerPack = (packNumber) => {
    if (packNumber > 5000) {
      return serviceFee.amount * 0.6;
    } else if (packNumber > 1000 && packNumber < 5001) {
      return serviceFee.amount * 0.8;
    } else return serviceFee.amount;
  };

  const ifServiceFeeInL3P = async (feeAmount) => {
    const currentAllowance = await checkERC20allowance(account, L3P_TOKEN_ADDRESS, contractAddress);
    const neededAllowance = feeAmount * packNumber;
    if (currentAllowance < neededAllowance) {
      approveERC20contract(L3P_TOKEN_ADDRESS, neededAllowance, contractAddress);
    }
  };

  return (
    <div style={styles.mainPackContainer}>
      <div style={{ width: "90%" }}>
        {displayPaneMode === "factory" && (
          <>
            <CollectionSelector customCollectionInfo={customCollectionInfo} ref={customCollectionInfoRef} />
            <div style={{ marginTop: "15px" }}>
              <Button shape='round' style={styles.resetButton} onClick={handleNext}>
                NEXT
              </Button>
            </div>
          </>
        )}
        {displayPaneMode === "tokens" && (
          <TokenSelection
            handleAssets={handleAssets}
            onFinishSelection={() => setDisplayPaneMode("nfts")}
            ref={tokenSelectionRef}
          />
        )}

        {displayPaneMode === "nfts" && (
          <div style={styles.transparentContainerInside}>
            <div style={{ margin: "auto" }}>
              <Uploader isJsonFile={isJsonFile} getJsonFile={getJsonFile} ref={uploaderRef} />
              <NumOfNftPerPack
                ERC721Number={ERC721Number}
                handleERC721Number={handleERC721Number}
                ERC1155Number={ERC1155Number}
                handleERC1155Number={handleERC1155Number}
              />
            </div>
          </div>
        )}

        {displayPaneMode === "confirm" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "inline-flex", marginBottom: "5px" }}>
                <Text style={{ fontSize: "16px" }}>Number of packs to mint:</Text>

                <Tooltip title='Enter the total amount of packs to be minted. Up to 200 packs per Txs, up to 10,000 in total (10,000 = 50 Txs).'>
                  <QuestionCircleOutlined style={{ marginLeft: "15px" }} />
                </Tooltip>
              </div>
              <Input
                style={{ ...styles.transparentInput, width: "50%" }}
                type='number'
                min='0'
                max='10000'
                value={packNumber}
                onChange={handlePackNumber}
              />
            </div>

            {packNumber !== undefined && (
              <div style={{ ...styles.transparentContainerInside, marginTop: "15px" }}>
                <PackConfirm
                  NFTsArr={[]}
                  ethAmount={ethAmount}
                  selectedTokens={selectedTokens}
                  isBatch={true}
                  packNumber={packNumber}
                  ERC721Number={ERC721Number}
                  ERC1155Number={ERC1155Number}
                  csv={jsonFile}
                />
              </div>
            )}
          </>
        )}

        {displayPaneMode === "pack" && (
          <>
            <Spin style={{ borderRadius: "20px" }} spinning={waiting} size='large'>
              <div style={{ ...styles.transparentContainerInside, padding: "20px" }}>
                <FeeSelector
                  serviceFee={serviceFee}
                  setServiceFee={setServiceFee}
                  customCollectionData={customCollectionData}
                  isBatch={true}
                  packNumber={packNumber}
                />
                <Button shape='round' style={styles.runFunctionButton} onClick={handleMultiplePack}>
                  BATCH-PACK <DownloadOutlined style={{ marginLeft: "25px", transform: "scale(1.2)" }} />
                </Button>
              </div>
            </Spin>
            <div style={{ marginTop: "15px" }}>
              <Button style={{ ...styles.resetButton }} shape='round' onClick={handleBack}>
                BACK
              </Button>
              <Button style={styles.resetButton} shape='round' onClick={handleReset}>
                RESTART
              </Button>
            </div>
          </>
        )}

        {displayPaneMode === "done" && <Done packReceipt={packReceipt} isClaim={false} />}
      </div>

      {displayPaneMode !== "factory" && displayPaneMode !== "pack" && displayPaneMode !== "done" && (
        <div style={{ marginTop: "15px" }}>
          <Button shape='round' style={styles.resetButton} onClick={handleBack}>
            BACK
          </Button>
          <Button shape='round' style={styles.resetButton} onClick={handleNext}>
            NEXT
          </Button>
        </div>
      )}
    </div>
  );
};

export default BatchPack;
