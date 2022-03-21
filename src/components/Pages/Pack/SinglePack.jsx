import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { getAssemblyAddress, assemblyABI } from "../../../Constant/constant";
import TokenSelection from "./components/TokenSelection";
import NFTsSelection from "./components/NFTsSelection";
import PackConfirm from "./components/PackConfirm";
import Done from "./components/Done";
import { sortSingleArrays } from "../../../helpers/arraySorting";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "../../../helpers/approval";
import { openNotification } from "../../../helpers/notifications";
import { getExplorer } from "helpers/networks";
import cloneDeep from "lodash/cloneDeep";
import { Button, Spin } from "antd";
import styles from "./styles";

function SinglePack({ displayPaneMode, setDisplayPaneMode }) {
  const { account, chainId } = useMoralis();
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [NFTsArr, setNFTsArr] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [packReceipt, setPackReceipt] = useState([]);
  const tokenSelectionRef = React.useRef();

  useEffect(() => {
    setDisplayPaneMode("tokens");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNFTOk = (selectedItems) => {
    setNFTsArr(selectedItems);
  };

  const getAssetValues = (ethAmt, Erc20) => {
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

  const onClickReset = () => {
    setEthAmount(0);
    setSelectedTokens([]);
    setNFTsArr([]);
    setDisplayPaneMode("tokens");
    if (tokenSelectionRef && tokenSelectionRef.current) {
      tokenSelectionRef.current.reset();
    }
  };

  const getSinglePackArrays = () => {
    let data = sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  };

  const handleSinglePack = async () => {
    const contractAddress = getAssemblyAddress(chainId);
    const result = getSinglePackArrays();

    try {
      const addressArr = result[0];
      const assetNumbers = result[1];
      const clonedArray = cloneDeep(addressArr);

      await singleApproveAll(clonedArray, assetNumbers, contractAddress).then(() => {
        singlePackMint(addressArr, assetNumbers, contractAddress).then(() => {
          setDisplayPaneMode("done");
        });
      });
    } catch (err) {
      let title = "Single Pack error";
      let msg = "Something went wrong while doing your pack. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  };

  async function singlePackMint(assetContracts, assetNumbers, contractAddr) {
    setWaiting(true);
    const sendOptions = {
      contractAddress: contractAddr,
      functionName: "mint",
      abi: assemblyABIJson,
      msgValue: assetNumbers[0],
      params: {
        _to: account,
        _addresses: assetContracts,
        _numbers: assetNumbers
      }
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      const receipt = await transaction.wait(2);
      setPackReceipt({ txHash: receipt.transactionHash, link: `${getExplorer(chainId)}tx/${receipt.transactionHash}` });
      setWaiting(false);
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while creating your pack!";
      openNotification("error", title, msg);
      console.log(error);
      setWaiting(false);
    }
  }

  async function singleApproveAll(address, numbers, contractAddr) {
    setWaiting(true);
    const addressArr = cloneDeep(address);
    const currentApproval = await checkMultipleAssetsApproval(addressArr, numbers, account, contractAddr);

    var ERC20add = [];
    var count = 4;
    ERC20add = address.splice(0, numbers[1]);
    try {
      for (let i = 0; i < ERC20add.length; i++) {
        let toAllow = numbers[count].toString();
        if (parseInt(currentApproval[i]) < parseInt(toAllow)) {
          await approveERC20contract(ERC20add[i], toAllow, contractAddr);
          count++;
        }
      }

      var pointerNFT = numbers[1];
      let uniqueAddrs = [...new Set(address)];
      for (let i = 0; i < uniqueAddrs.length; i++) {
        if (currentApproval[pointerNFT] === false) {
          await approveNFTcontract(uniqueAddrs[i], contractAddr);
        }
        pointerNFT++;
      }
      setWaiting(false);
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your pack's assets!";
      openNotification("error", title, msg);
      console.log(error);
      setWaiting(false);
    }
  }

  return (
    <div style={styles.mainPackContainer}>
      <div>
        {displayPaneMode === "tokens" && (
          <TokenSelection
            getAssetValues={getAssetValues}
            onFinishSelection={() => setDisplayPaneMode("nfts")}
            ref={tokenSelectionRef}
          />
        )}
        {displayPaneMode === "nfts" && (
          <NFTsSelection
            handleNFTOk={handleNFTOk}
            isMultiple={true}
            NFTsPerPage={100}
            isPackOnly={false}
            onFinishSelection={() => setDisplayPaneMode("confirm")}
          />
        )}
        {displayPaneMode === "confirm" && (
          <>
            <Spin style={{ borderRadius: "20px" }} spinning={waiting} size='large'>
              <div style={styles.transparentContainerInside}>
                <PackConfirm NFTsArr={NFTsArr} ethAmount={ethAmount} selectedTokens={selectedTokens} isBatch={false} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button shape='round' style={styles.resetButton} onClick={onClickReset}>
                  RESET
                </Button>
                <Button shape='round' style={styles.runFunctionButton} onClick={handleSinglePack}>
                  PACK
                </Button>
              </div>
            </Spin>
          </>
        )}
        {displayPaneMode === "done" && <Done packReceipt={packReceipt} isClaim={false} />}
      </div>
      {displayPaneMode !== "confirm" && displayPaneMode !== "done" && (
        <div style={{ marginTop: "15px" }}>
          <Button shape='round' style={styles.resetButton} onClick={onClickReset}>
            RESET
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
