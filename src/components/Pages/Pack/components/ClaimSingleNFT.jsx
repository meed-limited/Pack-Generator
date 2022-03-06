import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { useDapp } from "dappProvider/DappProvider";
import { useContractAddress } from "hooks/useContractAddress";
import { useContractEvents } from "hooks/useContractEvents";
import { getExplorer } from "helpers/networks";
import { openNotification } from "../../../../helpers/notifications.js";
import buttonImg from "../../../../assets/buttonImg.svg";
import { Button, Spin } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";

const styles = {
  selectButton: {
    width: "60%",
    fontSize: "15px",
    display: "block",
    margin: "30px auto 30px",
    textAlign: "center",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "1px solid yellow"
  }
};

const ClaimSingleNFT = ({ nftToClaim, getClaimStatut }) => {
  const { chainId, account } = useMoralis();
  const { assemblyABI } = useDapp();
  const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const { getAssemblyAddress } = useContractAddress();
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [isClaiming, setIsClaiming] = useState(false);

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress();
    if (nftToClaim && nftToClaim.token_address !== defaultAssemblyAddress) {
      return nftToClaim.token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  useEffect(() => {}, [isClaiming]);

  const claimPack = async () => {
    setIsClaiming(true);
    const contractAddress = getContractAddress();
    const nftData = await retrieveCreatedAssemblyEvent(nftToClaim, contractAddress);
    const sendOptions = {
      contractAddress: contractAddress,
      functionName: "burn",
      abi: assemblyABIJson,
      params: {
        _to: account,
        _tokenId: nftToClaim.token_id,
        _salt: nftData[2],
        _addresses: nftData[0],
        _numbers: nftData[1]
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
      setIsClaiming(false);
      getClaimStatut(true);
      console.log("pack claimed");

      const ClaimedPacks = Moralis.Object.extend("ClaimedPacks");
      const claimedPacks = new ClaimedPacks();
      claimedPacks.set("address", contractAddress);
      claimedPacks.set("owner", account);
      claimedPacks.set("tokenId", nftToClaim.token_id);
      claimedPacks.set("transaction_hash", receipt.transactionHash);
      claimedPacks.set("addresses", nftData[0]);
      claimedPacks.set("numbers", nftData[1]);
      claimedPacks.save();

    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while unpacking your pack!";
      openNotification("error", title, msg);
      setIsClaiming(false);
      getClaimStatut(false);
      console.log(error);
    }
  };

  return (
    <>
      {!isClaiming && (
        <Button type='primary' shape='round' style={styles.selectButton} onClick={claimPack}>
          CLAIM
        </Button>
      )}

      {isClaiming && <Spin style={{ margin: "auto", display: "block" }} size='large' />}
    </>
  );
};

export default ClaimSingleNFT;
