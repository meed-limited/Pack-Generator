import React, { useEffect, useState } from "react";
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import { assemblyABI, getAssemblyAddress } from "../../../Constant/constant";
import NFTsSelection from "./components/NFTsSelection";
import { useContractEvents } from "hooks/useContractEvents";
import { getExplorer } from "helpers/networks";
import { openNotification } from "../../../helpers/notifications";
import { Button, Spin } from "antd";
import styles from "./styles";
import Done from "./components/Done";

const ClaimPack = ({ displayPaneMode, setDisplayPaneMode }) => {
  const { chainId, account } = useMoralis();
  const { retrieveCreatedAssemblyEvent, getPackData } = useContractEvents();
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [selectedPack, setSelectedPack] = useState({});
  const [waiting, setWaiting] = useState(false);
  const [packReceipt, setPackReceipt] = useState([]);

  useEffect(() => {
    setDisplayPaneMode("claim");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNFTOk = (pack) => {
    setSelectedPack(pack);
  };
  
  const handleClaim = () => {
    unpack();
    //getPackData(selectedPack);
  };

  const resetOnClaim = () => {
    setSelectedPack();
  };

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress(chainId);
    if (selectedPack && selectedPack[0].token_address !== defaultAssemblyAddress) {
      return selectedPack[0].token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  const unpack = async () => {
    setWaiting(true);
    const contractAddress = getContractAddress();
    const data = await retrieveCreatedAssemblyEvent(selectedPack, contractAddress);

    const sendOptions = {
      contractAddress: contractAddress,
      functionName: "burn",
      abi: assemblyABIJson,
      params: {
        _to: account,
        _tokenId: selectedPack[0].token_id,
        _salt: data[2],
        _addresses: data[0],
        _numbers: data[1]
      }
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      const receipt = await transaction.wait(2);
      setPackReceipt({ txHash: receipt.transactionHash, link: `${getExplorer(chainId)}tx/${receipt.transactionHash}` });
      resetOnClaim();
      setWaiting(false);
      setDisplayPaneMode("done");

      const ClaimedPacks = Moralis.Object.extend("ClaimedPacks");
      const claimedPacks = new ClaimedPacks();
      claimedPacks.set("address", contractAddress);
      claimedPacks.set("owner", account);
      claimedPacks.set("tokenId", selectedPack[0].token_id);
      claimedPacks.set("transaction_hash", receipt.transactionHash);
      claimedPacks.set("addresses", data[0]);
      claimedPacks.set("numbers", data[1]);
      claimedPacks.save();
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while unpacking your pack!";
      openNotification("error", title, msg);
      console.log(error);
      setWaiting(false);
    }
  };

  return (
    <div style={styles.mainPackContainer}>
      {displayPaneMode !== "done" && (
        <Spin style={{ borderRadius: "20px" }} spinning={waiting} size='large'>
          <NFTsSelection handleNFTOk={handleNFTOk} isMultiple={false} NFTsPerPage={500} isPackOnly={true} />
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
