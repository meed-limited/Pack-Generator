import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { useDapp } from "dappProvider/DappProvider";
import cloneDeep from "lodash/cloneDeep";
import { approveERC20contract, approveNFTcontract, checkMultipleAssetsApproval } from "../../../helpers/approval";
import { sortSingleArrays } from "../../../helpers/arraySorting";
import AssetPerPack from "./components/AssetPerPack";
import ModalNFT from "./components/ModalNFT";
import PackConfirm from "./components/PackConfirm";
import { openNotification } from "../../../helpers/notifications";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { Button, Tooltip } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "./styles";

function SinglePack() {
  const { account, chainId } = useMoralis();
  const { assemblyAddressEthereum, assemblyAddressPolygon, assemblyAddressMumbai, assemblyABI } =
    useDapp();
  const [isSinglePackConfirmVisible, setIsSinglePackConfirmVisible] = useState(false);
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [NFTsArr, setNFTsArr] = useState([]);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [ethAmount, setEthAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const assetPerPackRef = React.useRef();
  const assetModalRef = React.useRef();

  const showModalNFT = () => {
    setIsModalNFTVisible(true);
  };

  const handleNFTOk = (selectedItems) => {
    setNFTsArr(selectedItems);
    setIsModalNFTVisible(false);
  };

  const handleNFTCancel = () => {
    setIsModalNFTVisible(false);
  };

  const showSingleConfirm = () => {
    setIsSinglePackConfirmVisible(true);
  };

  const handleSingleConfirmOk = () => {
    setIsSinglePackConfirmVisible(false);
    handleSinglePack();
  };

  const handleSingleConfirmCancel = () => {
    setIsSinglePackConfirmVisible(false);
  };

  const getAssetValues = (ethAmt, Erc20) => {
    setEthAmount(ethAmt);
    setSelectedTokens(Erc20);
  };

  const getContractAddress = () => {
    if (chainId === "0x1") {
      return assemblyAddressEthereum;
    } else if (chainId === "0x89") {
      return assemblyAddressPolygon;
    } else if (chainId === "0x13881") {
      return assemblyAddressMumbai;
    }
  };

  const onClickReset = () => {
    setEthAmount(0);
    setSelectedTokens([]);
    if (assetPerPackRef && assetPerPackRef.current) {
      assetPerPackRef.current.reset();
    }
    if (assetModalRef && assetModalRef.current) {
      assetModalRef.current.reset();
    }
  };

  const getSinglePackArrays = () => {
    let data = sortSingleArrays(ethAmount, selectedTokens, NFTsArr);
    return [data[0], data[1]];
  }

  const handleSinglePack = async () => {
    const contractAddress = getContractAddress();
    const result = getSinglePackArrays();

    try {
      const addressArr = result[0];
      const assetNumbers = result[1];
      const clonedArray = cloneDeep(addressArr);

      await singleApproveAll(clonedArray, assetNumbers, contractAddress).then(() => {
        singlePackMint(addressArr, assetNumbers, contractAddress);
      });
    } catch (err) {
      let title = "Single Pack error";
      let msg = "Something went wrong while doing your pack. Please check your inputs.";
      openNotification("error", title, msg);
      console.log(err);
    }
  }

  async function singlePackMint(assetContracts, assetNumbers, contractAddr) {
    console.log(assetNumbers)
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
      let link = `${getExplorer(chainId)}tx/${receipt.transactionHash}`;
      let title = "Pack created!";
      let msg = (
        <>
          Your pack has been succesfully created!
          <br></br>
          <a href={link} target='_blank' rel='noreferrer noopener'>
            View in explorer: &nbsp;
            <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
          </a>
        </>
      );
      openNotification("success", title, msg);
      onClickReset();
      console.log("Pack created");
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while creating your pack!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  async function singleApproveAll(address, numbers, contractAddr) {
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
    } catch (error) {
      let title = "Approval error";
      let msg = "Oops, something went wrong while approving some of your pack's assets!";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  return (
    <div style={{ height: "auto" }}>
      <div style={styles.transparentContainer}>
        <label style={{ letterSpacing: "1px" }}>Prepare your single Pack</label>

        <div style={{ display: "grid", gridTemplateColumns: "49% 2% 49%" }}>
          <div style={styles.transparentContainerInside}>
            <div style={{ position: "relative" }}>
              <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalNFT}>
                PICK SOME NFTs
              </Button>
              <Tooltip
                title="Select the NFT(s) that you'd like to add to the pack."
                style={{ position: "absolute", top: "35px", right: "80px" }}
              >
                <QuestionCircleOutlined
                  style={{ color: "white", paddingLeft: "15px", paddingBottom: "40px", transform: "scale(0.8)" }}
                />
              </Tooltip>
              <ModalNFT
                handleNFTCancel={handleNFTCancel}
                isModalNFTVisible={isModalNFTVisible}
                handleNFTOk={handleNFTOk}
                isMultiple={true}
                ref={assetModalRef}
              />
              <div style={{ color: "white", fontSize: "13px" }}>
                {NFTsArr && NFTsArr.length > 0 && <p>NFTs to Pack:</p>}

                {NFTsArr &&
                  NFTsArr.length > 0 &&
                  NFTsArr.map((nftItem, key) => (
                    <div
                      style={{
                        margin: "15px",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        color: "black",
                        opacity: "0.8"
                      }}
                      key={key}
                    >
                      {nftItem.token_id.length > 6 ? (
                        <p>{` ${nftItem.name} - Id: ${getEllipsisTxt(nftItem.token_id, 3)} - ${
                          nftItem.contract_type
                        }`}</p>
                      ) : (
                        <p>{`${nftItem.name} - Id: ${nftItem.token_id} - ${nftItem.contract_type}`}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "10px", margin: "auto", justifyContent: "center" }}>
            <p>AND</p>
            <p>/</p>
            <p>OR</p>
          </div>
          <div style={styles.transparentContainerInside}>
            <>
              <AssetPerPack getAssetValues={getAssetValues} ref={assetPerPackRef} />
            </>
          </div>
        </div>
        <div style={{ marginTop: "10px" }}>
          <Button shape='round' style={styles.resetButton} onClick={onClickReset}>
            RESET
          </Button>
        </div>
      </div>
      <PackConfirm
        onOk={handleSingleConfirmOk}
        onCancel={handleSingleConfirmCancel}
        isVisible={isSinglePackConfirmVisible}
        NFTsArr={NFTsArr}
        ethAmount={ethAmount}
        selectedTokens={selectedTokens}
        isBatch={false}
      ></PackConfirm>
      <Button shape='round' style={styles.runFunctionButton} onClick={showSingleConfirm}>
        PACK
      </Button>
    </div>
  );
}

export default SinglePack;
