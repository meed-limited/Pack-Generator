import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useContractEvents } from "hooks/useContractEvents";
import { getAssemblyAddress } from "helpers/getContractAddresses";
import { Button, Spin } from "antd";
import buttonImg from "../../../assets/buttonImg.svg";
import { claimPack } from "helpers/contractCalls/writeCall";

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
  const { getPackData } = useContractEvents();
  const [waiting, setWaiting] = useState(false);

  const getContractAddress = () => {
    const defaultAssemblyAddress = getAssemblyAddress(chainId);
    if (nftToClaim && nftToClaim.token_address !== defaultAssemblyAddress) {
      return nftToClaim.token_address;
    } else {
      return defaultAssemblyAddress;
    }
  };

  useEffect(() => {}, [waiting]);

  const handleClaim = async () => {
    setWaiting(true);
    getClaimStatut(true);
    const contractAddress = getContractAddress();
    const nftData = await getPackData(nftToClaim, contractAddress);
    console.log("contractAddress", contractAddress);
    console.log("nftData", nftData);
    console.log("nftToClaim", nftToClaim);
    await claimPack(nftToClaim, contractAddress, nftData, account, chainId).then((result) => {
      if (result.isSuccess === true) {
        getClaimStatut(false);
      }
    });
    setWaiting(false);
  };

  return (
    <>
      <Spin spinning={waiting} style={{ margin: "auto", display: "block" }} size='large'>
        <img
          src={`${nftToClaim?.image}`}
          alt=''
          style={{
            width: "250px",
            height: "250px",
            margin: "auto",
            borderRadius: "10px",
            marginBottom: "15px"
          }}
        />

        <Button type='primary' shape='round' style={styles.selectButton} onClick={handleClaim}>
          CLAIM
        </Button>
      </Spin>
    </>
  );
};

export default ClaimSingleNFT;
