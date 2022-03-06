import React, { useState } from "react";
import { useDapp } from "dappProvider/DappProvider";
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import { openNotification } from "../../../helpers/notifications";
import { getExplorer } from "helpers/networks";
import ModalPackOnly from "./components/ModalPackOnly";
import { useContractEvents } from "hooks/useContractEvents";
import { useContractAddress } from "hooks/useContractAddress";
import { Button, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./styles";

const PackClaim = () => {
  const { chainId, account } = useMoralis();
  const { assemblyABI } = useDapp();
  const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const { getAssemblyAddress } = useContractAddress();
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [selectedPack, setSelectedPack] = useState({});
  const [packId, setPackId] = useState();

  const showModalNFT = () => {
    setIsModalNFTVisible(true);
  };
  const handleNFTCancel = () => {
    setIsModalNFTVisible(false);
  };
  const handleNFTOk = (pack) => {
    setSelectedPack(pack);

    if (pack && pack.length > 0) {
      setPackId(pack[0].token_id);
    } else {
      setPackId("");
    }
    setIsModalNFTVisible(false);
    setConfirmLoading(false);
  };

  const handleClaim = () => {
    claimPack();
  };

  const resetOnClaim = () => {
    setSelectedPack();
    setPackId();
  };

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress();
    if (selectedPack && selectedPack[0].token_address !== defaultAssemblyAddress) {
      return selectedPack[0].token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  const claimPack = async () => {
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

      let link = `${getExplorer(chainId)}tx/${receipt.transactionHash}`;
      let title = "Pack claimed!";
      let msg = (
        <>
          Your pack has been succesfully unpacked!
          <br></br>
          <a href={link} target='_blank' rel='noreferrer noopener'>
            View in explorer: &nbsp;
            <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
          </a>
        </>
      );
      openNotification("success", title, msg);
      resetOnClaim();
      console.log("pack claimed");

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
    }
  };

  return (
    <div style={{ height: "auto" }}>
      <div style={styles.transparentContainer}>
        <label style={{ letterSpacing: "1px" }}>Select a Pack to reveal its content:</label>
        <div style={{ display: "grid", margin: "auto", width: "70%" }}>
          <div style={{ width: "70%", margin: "auto", position: "relative" }}>
            <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
              PICK A PACK
            </Button>

            <Tooltip
              title="Pick the pack that you'd like to unpack."
              style={{ position: "absolute", top: "35px", right: "80px" }}
            >
              <QuestionCircleOutlined
                style={{ color: "white", paddingLeft: "15px", paddingBottom: "40px", transform: "scale(0.8)" }}
              />
            </Tooltip>
          </div>
          <ModalPackOnly
            handleNFTCancel={handleNFTCancel}
            isModalNFTVisible={isModalNFTVisible}
            handleNFTOk={handleNFTOk}
            isMultiple={false}
            confirmLoading={confirmLoading}
          />

          {selectedPack && selectedPack?.length > 0 && (
            <div style={styles.displaySelected}>{`Selected Pack Id: ${getEllipsisTxt(packId, 5)}`}</div>
          )}
        </div>
      </div>
      <Button shape='round' style={styles.runFunctionButton} onClick={handleClaim}>
        CLAIM YOUR PACK
      </Button>
    </div>
  );
};

export default PackClaim;
