import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { L3P_TOKEN_ADDRESS, PACK_LIMIT } from "../../../constant/constant";
import {
  CollectionSelector,
  Done,
  FeeSelector,
  PackConfirm,
  NumOfNftPerPack,
  Uploader,
  TokenSelection,
} from "./components";
import { sortMultipleArrays, updateTokenIdsInArray } from "../../../helpers/arraySorting";
import { checkERC20allowance } from "helpers/contractCalls/readCall";
import { approveERC20contract, multipleApproveAll, multiplePackMint } from "helpers/contractCalls/writeCall";
import { openNotification } from "../../../helpers/notifications";
import { getAssemblyAddress } from "helpers/getContractAddresses";
import cloneDeep from "lodash/cloneDeep";
import { Button, Input, Spin, Tooltip } from "antd";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import styles from "./styles";

const BatchPack = ({ displayPaneMode, setDisplayPaneMode }) => {
  const { account, chainId } = useMoralis();
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
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customCollectionInfo = (info) => {
    if (info !== undefined) {
      setCustomCollectionData({
        address: info.collectionAddress,
        name: info.name,
        symbol: info.symbol,
        supply: info.maxSupply,
      });
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

  const isJson = () => {
    if (!isJSON) {
      let title = "No CSV submitted";
      let msg = "No CSV file submitted. Your packs won't contain any NFTs. Reject all transactions to cancel.";
      openNotification("warning", title, msg);
    }
  };

  const getMultiplePackArrays = (fileContent) => {
    let data = sortMultipleArrays(ethAmount, selectedTokens, fileContent, ERC721Number, ERC1155Number);
    return [data[0], data[1]];
  };

  const handleBatch = async () => {
    setWaiting(true);
    const feeAmount = getFeeAmountPerPack(packNumber); // Check potential discount
    const nativeAmount = serviceFee.type === "native" && feeAmount !== 0 ? feeAmount * "1e18" : 0; // Apply discount if fee in native
    isJson();
    if (serviceFee.type === "L3P") {
      await ifServiceFeeInL3P(feeAmount);
    }

    const sortedData = getMultiplePackArrays(jsonFile);
    const assetsArray = sortedData[0];
    const numbersArray = sortedData[1];
    const contractNumbersArray = updateTokenIdsInArray(jsonFile, numbersArray, packNumber, ERC1155Number);
    const clonedArray = cloneDeep(assetsArray);

    await multipleApproveAll(account, clonedArray, numbersArray, packNumber, contractAddress).then(() => {
      const promises = [];
      let counter = contractNumbersArray.length / PACK_LIMIT;
      counter = Math.ceil(counter);

      for (let i = 0; i < counter; i++) {
        if (contractNumbersArray.length > PACK_LIMIT) {
          let temp = contractNumbersArray.splice(0, PACK_LIMIT);

          promises.push(
            multiplePackMint(
              assetsArray,
              temp,
              PACK_LIMIT,
              nativeAmount.toString(),
              contractAddress.toString(),
              account,
              packNumber,
              chainId,
              customCollectionData
            )
          );
        } else {
          promises.push(
            multiplePackMint(
              assetsArray,
              contractNumbersArray,
              contractNumbersArray.length,
              nativeAmount.toString(),
              contractAddress.toString(),
              account,
              packNumber,
              chainId,
              customCollectionData
            )
          );
        }
      }

      Promise.all(promises).then((res) => {
        setWaiting(false);
        if (res[0].isSuccess) {
          setPackReceipt(res[0]);
          setDisplayPaneMode("done");
        }
      });
    });
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

  const navButton = () => {
    return (
      <div style={{ marginTop: "15px" }}>
        <Button shape="round" style={styles.resetButton} onClick={handleBack}>
          BACK
        </Button>
        <Button shape="round" style={styles.resetButton} onClick={handleNext}>
          NEXT
        </Button>
      </div>
    );
  };

  return (
    <div style={styles.mainPackContainer}>
      <div style={{ width: "90%" }}>
        {displayPaneMode === "factory" && (
          <>
            <CollectionSelector customCollectionInfo={customCollectionInfo} ref={customCollectionInfoRef} />
            <div style={{ marginTop: "15px" }}>
              <Button shape="round" style={styles.resetButton} onClick={handleNext}>
                NEXT
              </Button>
            </div>
          </>
        )}
        {displayPaneMode === "tokens" && (
          <>
            <TokenSelection
              handleAssets={handleAssets}
              onFinishSelection={() => setDisplayPaneMode("nfts")}
              ref={tokenSelectionRef}
            />
            {navButton()}
          </>
        )}
        {displayPaneMode === "nfts" && (
          <>
            <div style={styles.transparentContainerInside}>
              <Uploader isJsonFile={isJsonFile} getJsonFile={getJsonFile} ref={uploaderRef} />
              <NumOfNftPerPack
                ERC721Number={ERC721Number}
                handleERC721Number={handleERC721Number}
                ERC1155Number={ERC1155Number}
                handleERC1155Number={handleERC1155Number}
              />
            </div>
            {navButton()}
          </>
        )}
        {displayPaneMode === "confirm" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "inline-flex", marginBottom: "5px" }}>
                <Text style={{ fontSize: "16px" }}>Number of packs to mint:</Text>
                <Tooltip title="Enter the total amount of packs to be minted. Up to 200 packs per Txs, up to 10,000 in total (10,000 = 50 Txs).">
                  <QuestionCircleOutlined style={{ marginLeft: "15px" }} />
                </Tooltip>
              </div>
              <Input
                style={{ ...styles.transparentInput, width: "50%" }}
                type="number"
                min="0"
                max="10000"
                value={packNumber}
                onChange={handlePackNumber}
              />
            </div>
            {packNumber && packNumber !== undefined && (
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
            <div style={{ marginTop: "15px" }}>
              <Button shape="round" style={styles.resetButton} onClick={handleBack}>
                BACK
              </Button>
              <Button
                shape="round"
                style={styles.resetButton}
                disabled={!packNumber ? true : false}
                onClick={handleNext}
              >
                NEXT
              </Button>
            </div>
          </>
        )}
        {displayPaneMode === "pack" && (
          <Spin style={{ borderRadius: "20px" }} spinning={waiting} size="large">
            <div style={{ ...styles.transparentContainerInside, padding: "20px" }}>
              <FeeSelector
                serviceFee={serviceFee}
                setServiceFee={setServiceFee}
                customCollectionData={customCollectionData}
                isBatch={true}
                packNumber={packNumber}
              />
              <Button shape="round" style={styles.runFunctionButton} onClick={handleBatch}>
                BATCH-PACK <DownloadOutlined style={{ marginLeft: "25px", transform: "scale(1.2)" }} />
              </Button>
            </div>
            <div style={{ marginTop: "15px" }}>
              <Button style={{ ...styles.resetButton }} shape="round" onClick={handleBack}>
                BACK
              </Button>
              <Button style={styles.resetButton} shape="round" onClick={handleReset}>
                RESTART
              </Button>
            </div>
          </Spin>
        )}
        {displayPaneMode === "done" && <Done packReceipt={packReceipt} isClaim={false} />}
      </div>
    </div>
  );
};

export default BatchPack;
