import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { factoryABIJson } from "../../../../constant/abis";
import { useUserData } from "userContext/UserContextProvider";
import { getExplorer } from "helpers/networks";
import { openNotification } from "helpers/notifications";
import { FileSearchOutlined, LoadingOutlined, PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Input, message, Tooltip, Upload } from "antd";
import TextArea from "antd/lib/input/TextArea";
import styles from "../styles";

const CollectionFactory = ({
  name,
  setName,
  symbol,
  setSymbol,
  supply,
  setSupply,
  description,
  setDescription,
  setWaiting,
  setCurrentCollection,
  customCollectionInfo,
}) => {
  const { chainId, account } = useMoralis();
  const { factoryAddress } = useUserData();
  const [imageURL, setImageURL] = useState();
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleSupplyChange = (e) => {
    setSupply(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleImageChange = async (e) => {
    setIsImageLoading(true);
    const image = e.file.originFileObj;
    const file = new Moralis.File(e.file.name, image);
    await file.saveIPFS().then(() => {
      setImageURL(file.ipfs());
    });
    // .catch((err) => {
    //   let title = "Image error";
    //   let msg = "Something went wrong while loading your image. Please, try again.";
    //   openNotification("error", title, msg);
    // });
    setIsImageLoading(false);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadMetadataToIpfs = async () => {
    const metadata = {
      name: name,
      image: imageURL,
      description: description,
    };

    const file = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    await file.saveIPFS();
    return file.ipfs();
  };

  const uploadMetadataToMoralis = (collectionAddress, TxHash, supply, metadataURI) => {
    const supplyToSave = supply === 0 ? "0" : supply;
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const customCollections = new CustomCollections();
    customCollections.set("chainId", chainId);
    customCollections.set("owner", account);
    customCollections.set("name", name ? name : "Pack-Generator-NFT");
    customCollections.set("symbol", symbol ? symbol : "PGNFT");
    customCollections.set("maxSupply", supplyToSave);
    customCollections.set("description", description);
    customCollections.set("collectionAddress", collectionAddress);
    customCollections.set("image", imageURL);
    customCollections.set("metadataURI", metadataURI);
    customCollections.set("transaction_hash", TxHash);

    try {
      customCollections.save();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreate = async () => {
    createNewContract(name, symbol, supply);
  };

  const createNewContract = async (name, symbol, supply) => {
    setWaiting(true);
    message.config({
      maxCount: 1,
    });
    message.loading("Uploading metadata to IPFS, please wait until a metamask invit shows up...", 5);

    const metadataURI = await uploadMetadataToIpfs();
    console.log(metadataURI); // Kept to easily generate metadata if needed
    var newAddress;

    const sendOptions = {
      contractAddress: factoryAddress,
      functionName: "createCustomCollection",
      abi: factoryABIJson,
      params: {
        _name: name,
        _symbol: symbol,
        _maxSupply: supply,
        _baseURIextended: metadataURI,
      },
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      const receipt = await transaction.wait();

      newAddress = receipt.events[0].address;
      const TxHash = receipt.transactionHash;
      let link = `${getExplorer(chainId)}tx/${TxHash}`;
      let title = "Collection created!";
      let msg = (
        <>
          Your new ERC721 collection has been succesfully created!
          <br></br>
          Your smart-contract address: {newAddress}
          <br></br>
          <a href={link} target="_blank" rel="noreferrer noopener">
            View in explorer: &nbsp;
            <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
          </a>
        </>
      );

      openNotification("success", title, msg);
      console.log("Collection created");
      uploadMetadataToMoralis(newAddress, TxHash, supply, metadataURI);
      const collec = {
        name: name,
        collectionAddress: newAddress,
        symbol: symbol,
        maxSupply: supply,
      };
      setCurrentCollection(collec);
      customCollectionInfo(collec);
      setWaiting(false);
    } catch (error) {
      let title = "Unexpected error";
      let msg = "Oops, something went wrong while creating your custom collection!";
      openNotification("error", title, msg);
      console.log(error);
      setWaiting(false);
    }
  };

  const uploadButton = (
    <div>
      {isImageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Picture</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "65% 35%", textAlign: "center", margin: "auto" }}>
        <div>
          <div style={{ display: "column-flex" }}>
            <label style={{ fontSize: "11px" }}>Collection Name:</label>
            <Input
              style={styles.transparentInput}
              placeholder="e.g. My Super Collection"
              value={name}
              onChange={handleNameChange}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "50% 50%", textAlign: "center", margin: "auto" }}>
            <div style={{ display: "column-flex" }}>
              <label style={{ fontSize: "11px" }}>Collection Symbol:</label>
              <Input
                style={styles.transparentInputSmaller}
                placeholder="e.g. MSC"
                value={symbol}
                onChange={handleSymbolChange}
              />
            </div>

            <div style={{ display: "column-flex" }}>
              <label style={{ fontSize: "11px" }}>Max Supply:</label>
              <Tooltip
                title='Optional - Define the limit of NFTs (hard-cap) that can be minted within this collection. Set to "0" for infinite supply.'
                style={{ position: "absolute", top: "35px", right: "80px" }}
              >
                <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px", transform: "scale(0.8)" }} />
              </Tooltip>
              <Input style={styles.transparentInputSmaller} value={supply} onChange={handleSupplyChange} />
            </div>
          </div>

          <div style={{ display: "column-flex" }}>
            <label style={{ fontSize: "11px" }}>Collection Description:</label>
            <TextArea
              style={styles.transparentInput}
              placeholder="e.g. This is a great collection."
              maxLength={250}
              showCount
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>
        <div style={{ alignItems: "center", margin: "auto" }}>
          <Upload
            type="file"
            maxCount="1"
            name="image"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleImageChange}
          >
            {imageURL ? <img src={imageURL} alt="" style={{ width: "100%" }} /> : uploadButton}
          </Upload>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Button type="primary" shape="round" size="large" style={styles.resetButton} onClick={handleCreate}>
          CREATE NEW COLLECTION
        </Button>
      </div>
    </>
  );
};

export default CollectionFactory;
