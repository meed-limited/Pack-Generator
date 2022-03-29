import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { L3P_TOKEN_ADDRESS, getAssemblyAddress, assemblyABI } from "../../../Constant/constant";
import TokenSelection from "./components/TokenSelection";
import NFTsSelection from "./components/NFTsSelection";
import PackConfirm from "./components/PackConfirm";
import FeeSelector from "./components/FeeSelector";
import Done from "./components/Done";
import { singleApproveAll, singlePackMint } from "helpers/contractCall";
import { sortSingleArrays } from "../../../helpers/arraySorting";
import { checkERC20allowance, approveERC20contract } from "../../../helpers/approval";
import { openNotification } from "../../../helpers/notifications";
import cloneDeep from "lodash/cloneDeep";
import { Button, Spin } from "antd";
import styles from "./styles";
import { DownloadOutlined } from "@ant-design/icons";

function SinglePack({ displayPaneMode, setDisplayPaneMode }) {
  const { account, chainId } = useMoralis();
  const assemblyABIJson = JSON.parse(assemblyABI);
  const contractAddress = getAssemblyAddress(chainId);
  const [serviceFee, setServiceFee] = useState();
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [packReceipt, setPackReceipt] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const tokenSelectionRef = React.useRef();

  useEffect(() => {
    setDisplayPaneMode("tokens");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNFT = (selectedItems) => {
    setNFTsArr(selectedItems);
  };

  const handleAssets = (ethAmt, Erc20) => {
    setEthAmount(ethAmt);
    setSelectedTokens(Erc20);
  };

  const handleNext = () => {
    if (displayPaneMode === "tokens") {
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
    if (displayPaneMode === "nfts") {
      setDisplayPaneMode("tokens");
    } else if (displayPaneMode === "confirm") {
      setDisplayPaneMode("nfts");
    } else if (displayPaneMode === "pack") {
      setDisplayPaneMode("confirm");
    }
  };

  const handleReset = () => {
    setEthAmount(0);
    setSelectedTokens([]);
    setNFTsArr([]);
    setDisplayPaneMode("tokens");
    if (tokenSelectionRef && tokenSelectionRef.current) {
      tokenSelectionRef.current.reset();
    }
  };

  const ifServiceFeeInL3P = async () => {
    const currentAllowance = await checkERC20allowance(account, L3P_TOKEN_ADDRESS, contractAddress);
    if (currentAllowance < serviceFee.amount) {
      approveERC20contract(L3P_TOKEN_ADDRESS, serviceFee.amount, contractAddress);
    }
  };

  const getSinglePackArrays = () => {
    let data = sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  };

  const handleSinglePack = async () => {
    setWaiting(true);
    const result = getSinglePackArrays();
    const nativeAmount = serviceFee.type === "native" ? serviceFee.amount * "1e18" : 0;

    if (serviceFee.type === "L3P") {
      await ifServiceFeeInL3P();
    }

    try {
      const addressArr = result[0];
      const assetNumbers = result[1];
      const msgValue = assetNumbers[0] + nativeAmount;
      const clonedArray = cloneDeep(addressArr);

      await singleApproveAll(account, clonedArray, assetNumbers, contractAddress).then(() => {
        singlePackMint(assemblyABIJson, chainId, account, msgValue, addressArr, assetNumbers, contractAddress).then(
          (result) => {
            setPackReceipt(result);
            setDisplayPaneMode("done");
            setWaiting(false);
          }
        );
      });
    } catch (err) {
      setWaiting(false);
      let title = "Single Pack error";
      let msg = "Something went wrong while doing your pack. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  };

  return (
    <div style={styles.mainPackContainer}>
      <div style={{ width: "90%" }}>
        {displayPaneMode === "tokens" && (
          <>
            <TokenSelection
              handleAssets={handleAssets}
              onFinishSelection={() => setDisplayPaneMode("nfts")}
              ref={tokenSelectionRef}
            />
            <div style={{ marginTop: "15px" }}>
              <Button shape='round' style={styles.resetButton} onClick={handleNext}>
                NEXT
              </Button>
            </div>
          </>
        )}
        {displayPaneMode === "nfts" && (
          <NFTsSelection
            handleNFT={handleNFT}
            isMultiple={true}
            NFTsPerPage={100}
            isPackOnly={false}
            onFinishSelection={() => setDisplayPaneMode("confirm")}
          />
        )}
        {displayPaneMode === "confirm" && (
          <>
            <div style={styles.transparentContainerInside}>
              <PackConfirm NFTsArr={NFTsArr} ethAmount={ethAmount} selectedTokens={selectedTokens} isBatch={false} />
            </div>
          </>
        )}

        {displayPaneMode === "pack" && (
          <>
            <Spin style={{ borderRadius: "20px" }} spinning={waiting} size='large'>
              <div style={{ ...styles.transparentContainerInside, padding: "40px" }}>
              <FeeSelector setServiceFee={setServiceFee} isBatch={false} />
                <Button shape='round' style={styles.runFunctionButton} onClick={handleSinglePack}>
                  PACK <DownloadOutlined style={{ marginLeft: "25px", transform: "scale(1.2)" }} />
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

      {displayPaneMode !== "tokens" && displayPaneMode !== "pack" && displayPaneMode !== "done" && (
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
}

export default SinglePack;
