import React, { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useContractAddress } from "hooks/useContractAddress";
import { useContractEvents } from "hooks/useContractEvents";
import { getExplorer } from "helpers/networks";
import { openNotification } from "../Notification";
import { getEllipsisTxt } from "helpers/formatters";
import buttonImg from "../../assets/buttonImg.svg";
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
  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId, assemblyABI } = useMoralisDapp();
  const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const { getAssemblyAddress } = useContractAddress();
  const assemblyABIJson = JSON.parse(assemblyABI);
  //const customAssemblyABIJson = JSON.parse(customAssemblyABI);
  const [isClaiming, setIsClaiming] = useState(false);

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress();
    if (nftToClaim && nftToClaim.token_address !== defaultAssemblyAddress) {
      return nftToClaim.token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  useEffect(() => {
  }, [isClaiming]);

  const claimPack = async () => {
    setIsClaiming(true);
    const contractAddress = getContractAddress();
    const data = await retrieveCreatedAssemblyEvent(nftToClaim, contractAddress);
    try {
      const ops = {
        contractAddress: contractAddress,
        functionName: "burn",
        abi: assemblyABIJson,
        params: {
          _to: walletAddress,
          _tokenId: nftToClaim.token_id,
          _salt: data[2],
          _addresses: data[0],
          _numbers: data[1]
        }
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: (response) => {
          var asset;
          if (response.events.Transfer.length > 0) {
            asset = response.events.Transfer[0].returnValues;
          } else {
            asset = response.events.Transfer.returnValues;
          }

          let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
          let title = "Pack claimed!";
          let msg = (
            <>
              Your pack id: "{getEllipsisTxt(asset.tokenId, 6)}" has been succesfully unpacked!
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
        },
        onError: (error) => {
          let title = "Unexpected error";
          let msg = "Oops, something went wrong while unpacking your pack!";
          openNotification("error", title, msg);
          setIsClaiming(false);
          getClaimStatut(false);
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
