import React, { useState } from "react";
import { Button, Input } from "antd";
import { useMoralis } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import { openNotification } from "../Notification";
import styles from "./styles";
import { FileSearchOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import ModalL3PBOnly from "./ModalL3PBOnly";

const BundleClaim = () => {
  const {
    walletAddress,
    chainId,
    assemblyAddressEthereum,
    assemblyAddressPolygon,
    assemblyAddressMumbai,
    assemblyABI
  } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(assemblyABI);
  const [selectedBundle, setSelectedBundle] = useState({});
  const [bundleId, setBundleId] = useState();

  const getBundle = async (idToFetch) => {
    const CreatedBundle = Moralis.Object.extend("CreatedBundle");
    const query = new Moralis.Query(CreatedBundle);
    query.equalTo("tokenId", idToFetch);
    const res = await query.find();
    return res;
  };

  const showModalNFT = () => {
    setIsModalNFTVisible(true);
  };
  const handleNFTCancel = () => {
    setIsModalNFTVisible(false);
  };
  const handleNFTOk = (bundle) => {
    setSelectedBundle(bundle);

    if (bundle && bundle.length > 0) {
      setBundleId(bundle[0].token_id);
    } else {
      setBundleId("");
    }
    setIsModalNFTVisible(false);
    setConfirmLoading(false);
  };

  const handleClaim = () => {
    claimBundle();
  };

  const resetOnClaim = () => {
    setBundleId();
  };

  const getContractAddress = () => {
    var contractAddr;
    if (chainId === "0x1") {
      contractAddr = assemblyAddressEthereum;
    } else if (chainId === "0x89") {
      contractAddr = assemblyAddressPolygon;
    } else if (chainId === "0x13881") {
      contractAddr = assemblyAddressMumbai;
    }
    return contractAddr;
  };

  async function claimBundle() {
    const contractAddress = getContractAddress();
    const res = await getBundle(bundleId);
    const data = JSON.parse(JSON.stringify(res));
    try {
      const ops = {
        contractAddress: contractAddress,
        functionName: "burn",
        abi: contractABIJson,
        params: {
          _to: walletAddress,
          _tokenId: bundleId,
          _salt: data[0].salt,
          _addresses: data[0].addresses,
          _numbers: data[0].numbers
        }
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: (response) => {
          let asset = response.events.Transfer.returnValues;
          let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
          let title = "Bundle claimed!";
          let msg = (
            <div>
              Your bundle id: "{getEllipsisTxt(asset.tokenId, 6)}" has been succesfully unpacked!
              <br></br>
              <a href={link} target='_blank' rel='noreferrer noopener'>
                View in explorer: &nbsp;
                <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
              </a>
            </div>
          );
          openNotification("success", title, msg);
          console.log("bundle claimed");
          resetOnClaim();
        },
        onError: (error) => {
          let title = "Unexpected error";
          let msg = "Oops, something went wrong while unpacking your bundle!";
          openNotification("error", title, msg);
          console.log(error);
        }
      });
    } catch (error) {
      let title = "Bundle non-claimable";
      let msg = "Oops, you can't claim this bundle at this time. It is either unconfirmed yet, or already claimed.";
      openNotification("error", title, msg);
    }
  }

  return (
    <div style={{ height: "auto" }}>
      <div style={styles.transparentContainer}>
        <label style={{ letterSpacing: "1px" }}>Unpack your Bundle</label>
        <div style={{ display: "grid", margin: "auto", width: "70%" }}>
          <div style={{ width: "70%", margin: "auto" }}>
            <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
              PICK AN NFT
            </Button>
          </div>
          <ModalL3PBOnly
            handleNFTCancel={handleNFTCancel}
            isModalNFTVisible={isModalNFTVisible}
            handleNFTOk={handleNFTOk}
            isMultiple={false}
            confirmLoading={confirmLoading}
          />
          <p style={{ margin: "auto", marginBottom: "25px", fontSize: "16px" }}>or</p>
          <label style={styles.label}>ENTER BUNDLE ID</label>
          <Input
            style={styles.transparentInput}
            type='number'
            value={bundleId}
            onChange={(e) => setBundleId(e.target.value)}
          />

          {selectedBundle && selectedBundle.length > 0 && (
            <div style={styles.displaySelected}>{`Bundles Id: ${getEllipsisTxt(bundleId, 5)}`}</div>
          )}
        </div>
      </div>
      <Button shape='round' style={styles.runFunctionButton} onClick={handleClaim}>
        CLAIM YOUR BUNDLE
      </Button>
    </div>
  );
};

export default BundleClaim;
