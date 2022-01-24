import React, { useState } from "react";
import { Button, Divider, Input } from "antd";
import { useMoralisQuery } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import AssetModal from "./AssetModal";
import { getEllipsisTxt } from "helpers/formatters";
import { openNotification } from "../Notification";

const styles = {
  h2: {
    fontSize: "30px",
    color: "#f1356d",
    marginBottom: "50px"
  },
  claimButton: {
    margin: "20px",
    height: "auto",
    background: "#f1356d",
    color: "#fff",
    border: "0",
    padding: "20px",
    fontSize: "20px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  container: {
    opacity: "0.8",
    borderRadius: "8px",
    backgroundColor: "black",
    textAlign: "center",
    paddingTop: "50px",
    paddingBottom: "50px",
    fontSize: "25px",
    color: "white"
  }
};

const Claim = () => {
  const { walletAddress, assemblyAddress, assemblyABI } = useMoralisDapp();
  const [isNFTModalVisible, setIsNFTModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(assemblyABI);
  const [selectedBundle, setSelectedBundle] = useState({});
  const [bundleId, setBundleId] = useState();
  const queryMintedBundles = useMoralisQuery("CreatedBundle");
  const fetchMintedBundle = JSON.parse(
    JSON.stringify(queryMintedBundles.data, ["firstHolder", "tokenId", "salt", "addresses", "numbers", "confirmed"])
  );

  const getBundle = (idToFetch) => {
    const result = fetchMintedBundle?.find((e) => e.tokenId === idToFetch && e.confirmed === true);
    return result;
  };

  const showNFTModal = () => {
    setIsNFTModalVisible(true);
  };
  const handleNFTCancel = () => {
    setIsNFTModalVisible(false);
  };
  const handleNFTOk = (bundle) => {
    setSelectedBundle(bundle);

    if (bundle && bundle.length > 0) {
      setBundleId(bundle[0].token_id);
    } else {
      setBundleId("");
    }
    setIsNFTModalVisible(false);
    setConfirmLoading(false);
  };

  const handleClaim = () => {
    claimBundle();
  };

  async function claimBundle() {
    const data = await getBundle(bundleId);

    const ops = {
      contractAddress: assemblyAddress,
      functionName: "burn",
      abi: contractABIJson,
      params: {
        _to: walletAddress,
        _tokenId: bundleId,
        _salt: data.salt,
        _addresses: data.addresses,
        _numbers: data.numbers
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        let title = "Bundle unpacked!";
        let msg = "Your bundle has been succesfully unpacked!";
        openNotification("success", title, msg);
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while unpacking your bundle!";
        openNotification("error", title, msg);
        console.log(error);
      }
    });
  }

  return (
    <div
      style={{
        margin: "auto",
        textAlign: "center",
        width: "80%"
      }}
    >
      <Divider />
      <h2 style={styles.h2}>Unpack Your Bundle</h2>
      <div style={styles.container}>
        <label>Select the bundle to unpack:</label>
        <div style={{ display: "grid", margin: "auto", width: "70%", marginTop: "30px" }}>
          <Button type='primary' style={{ margin: "auto", width: "90%" }} onClick={showNFTModal}>
            Pick an NFT
          </Button>
          <AssetModal
            handleNFTCancel={handleNFTCancel}
            isNFTModalVisible={isNFTModalVisible}
            handleNFTOk={handleNFTOk}
            confirmLoading={confirmLoading}
          />

          <span style={{ marginBottom: "10px" }}>or</span>
          <Input
            style={{ textAlign: "center", width: "90%", margin: "auto" }}
            placeholder='Enter bundle Id'
            type='number'
            value={bundleId}
            onChange={(e) => setBundleId(e.target.value)}
          />

          {selectedBundle && selectedBundle.length > 0 && (
            <div
              style={{
                margin: "auto",
                marginTop: "50px",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "black",
                opacity: "0.8",
                fontSize: "16px",
                width: "40%"
              }}
            >
              {`Bundles Id: ${getEllipsisTxt(bundleId, 5)}`}
            </div>
          )}
        </div>
      </div>
      <Button style={styles.claimButton} onClick={handleClaim}>
        Claim you Bundle
      </Button>
    </div>
  );
};

export default Claim;
