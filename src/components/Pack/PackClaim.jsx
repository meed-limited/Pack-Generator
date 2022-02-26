import React, { useState } from "react";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import { openNotification } from "../Notification";
import { getExplorer } from "helpers/networks";
import ModalL3PBOnly from "./ModalL3PBOnly";
import { useContractEvents } from "hooks/useContractEvents";
import { useContractAddress } from "hooks/useContractAddress";
import { Button, Input, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./styles";

const PackClaim = () => {
  const { walletAddress, chainId, assemblyABI } = useMoralisDapp();
  const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const { getAssemblyAddress } = useContractAddress();
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();
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
    try {
      const ops = {
        contractAddress: contractAddress,
        functionName: "burn",
        abi: assemblyABIJson,
        params: {
          _to: walletAddress,
          _tokenId: selectedPack[0].token_id,
          _salt: data[2],
          _addresses: data[0],
          _numbers: data[1]
        }
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: (response) => {
          let asset = response.events.Transfer.returnValues;
          let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
          let title = "Pack claimed!";
          let msg = (
            <div>
              Your pack id: "{getEllipsisTxt(asset.tokenId, 6)}" has been succesfully unpacked!
              <br></br>
              <a href={link} target='_blank' rel='noreferrer noopener'>
                View in explorer: &nbsp;
                <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
              </a>
            </div>
          );
          openNotification("success", title, msg);
          console.log("pack claimed");
          resetOnClaim();
        },
        onError: (error) => {
          let title = "Unexpected error";
          let msg = "Oops, something went wrong while unpacking your pack!";
          openNotification("error", title, msg);
          console.log(error);
        }
      });
    } catch (error) {
      let title = "Pack non-claimable";
      let msg = "Oops, you can't claim this pack at this time. It is either unconfirmed yet, or already claimed.";
      openNotification("error", title, msg);
    }
  };

  return (
    <div style={{ height: "auto" }}>
      <div style={styles.transparentContainer}>
        <label style={{ letterSpacing: "1px" }}>Unpack your Pack</label>
        <div style={{ display: "grid", margin: "auto", width: "70%" }}>
          <div style={{ width: "70%", margin: "auto", position: "relative" }}>
            <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
              PICK AN NFT
            </Button>

            <Tooltip
              title="Pick the L3P pack that you'd like to unpack."
              style={{ position: "absolute", top: "35px", right: "80px" }}
            >
              <QuestionCircleOutlined
                style={{ color: "white", paddingLeft: "15px", paddingBottom: "40px", transform: "scale(0.8)" }}
              />
            </Tooltip>
          </div>
          <ModalL3PBOnly
            handleNFTCancel={handleNFTCancel}
            isModalNFTVisible={isModalNFTVisible}
            handleNFTOk={handleNFTOk}
            isMultiple={false}
            confirmLoading={confirmLoading}
          />
          <p style={{ margin: "auto", marginBottom: "25px", fontSize: "14px" }}>or</p>
          <label style={styles.label}>ENTER PACK ID</label>
          <Input
            style={styles.transparentInput}
            type='number'
            min='0'
            value={packId}
            onChange={(e) => setPackId(e.target.value)}
          />

          {selectedPack && selectedPack.length > 0 && (
            <div style={styles.displaySelected}>{`Packs Id: ${getEllipsisTxt(packId, 5)}`}</div>
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
