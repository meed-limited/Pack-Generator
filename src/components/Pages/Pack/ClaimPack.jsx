import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getAssemblyAddress } from "../../../Constant/constant";
import NFTsSelection from "./components/NFTsSelection";
import Done from "./components/Done";
import { useContractEvents } from "hooks/useContractEvents";
import { claimPack } from "helpers/contractCall";
import { Button, Spin } from "antd";
import styles from "./styles";

const ClaimPack = ({ displayPaneMode, setDisplayPaneMode }) => {
  const { chainId, account } = useMoralis();
  const { getPackData } = useContractEvents();
  const [selectedPack, setSelectedPack] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [packReceipt, setPackReceipt] = useState([]);

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress(chainId);
    if (selectedPack && selectedPack[0]?.token_address !== defaultAssemblyAddress) {
      return selectedPack[0].token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  useEffect(() => {
    setDisplayPaneMode("claim");
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNFT = (pack) => {
    setSelectedPack(pack);
  };

  const handleClaim = async () => {
    setWaiting(true);
    const contractAddress = getContractAddress();
    const nftData = await getPackData(selectedPack, contractAddress);
    await claimPack(selectedPack[0], contractAddress, nftData, account, chainId).then((result) => {
      if (result.isSuccess === true) {
        setPackReceipt(result);
        resetOnClaim();
        setDisplayPaneMode("done");
      }
    });
    setWaiting(false);
  };

  const resetOnClaim = () => {
    setSelectedPack();
  };

  return (
    <div style={styles.mainPackContainer}>
      {displayPaneMode !== "done" && (
        <Spin style={{ borderRadius: "20px" }} spinning={waiting} size='large'>
          <NFTsSelection handleNFT={handleNFT} isMultiple={false} NFTsPerPage={500} isPackOnly={true} />
          <Button shape='round' style={styles.resetButton} onClick={handleClaim}>
            CLAIM PACK
          </Button>
        </Spin>
      )}

      {displayPaneMode === "done" && <Done packReceipt={packReceipt} isClaim={true} />}
    </div>
  );
};

export default ClaimPack;
