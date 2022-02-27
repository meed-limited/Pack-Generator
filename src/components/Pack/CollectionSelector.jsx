import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import { openNotification } from "components/Notification";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import { Button, Input, Tooltip, Select, Upload, message, Space, Switch } from "antd";
import { FileSearchOutlined, QuestionCircleOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import "../../style.css";
import styles from "./styles";

const CollectionSelector = forwardRef(({ customContractAddrs, passNameAndSymbol }, ref) => {
  const contractProcessor = useWeb3ExecuteFunction();
  const { chainId, walletAddress, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } =
    useMoralisDapp();
  const { Moralis } = useMoralis();
  const factoryABIJson = JSON.parse(factoryABI);
  const { getCustomCollectionData, parseData } = useQueryMoralisDb();
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [supply, setSupply] = useState(0);
  const [description, setDescription] = useState("");
  const [isExistingCollection, setIsExistingCollection] = useState(false);
  const [customAddress, setCustomAddress] = useState();
  const [customCollection, setCustomCollection] = useState([]);
  const [imageURL, setImageURL] = useState();
  const [imageURI, setImageURI] = useState();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [displayFactory, setDisplayFactory] = useState(false);
  const { Option } = Select;

  const getContractAddress = () => {
    if (chainId === "0x1") {
      return factoryAddressEthereum;
    } else if (chainId === "0x89") {
      return factoryAddressPolygon;
    } else if (chainId === "0x13881") {
      return factoryAddressMumbai;
    }
  };

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
    try {
      const image = e.file.originFileObj;
      const file = new Moralis.File(e.file.name, image);
      await file.saveIPFS();
      setImageURL(file.ipfs());
    } catch (error) {
      let title = "Image error";
      let msg = "Something went wrong while loading your image. Please, try again.";
      openNotification("error", title, msg);
    }
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

  const handleCreate = async () => {
    createNewContract(name, symbol);
  };

  const uploadMetadataToIpfs = async () => {
    const metadata = {
      name: name,
      image: imageURL,
      description: description
    };

    const file = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    let ipfsURI = await file.saveIPFS();
    setImageURI(ipfsURI);

    return file.ipfs();
  };

  const uploadMetadataToMoralis = (collectionAddress, metadataURI) => {
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const customCollections = new CustomCollections();
    customCollections.set("owner", walletAddress);
    customCollections.set("name", name ? name : "LepriPack");
    customCollections.set("symbol", symbol ? symbol : "L3P");
    customCollections.set("maxSupply", supply);
    customCollections.set("description", description);
    customCollections.set("collectionAddress", collectionAddress);
    customCollections.set("image", imageURL);
    customCollections.set("metadataURI", metadataURI);

    try {
      customCollections.save();
    } catch (error) {
      console.log(error);
    }
  };

  const createNewContract = async (name, symbol) => {
    message.config({
      maxCount: 1
    });
    message.loading("Uploading metadata to IPFS, please wait until a metamask invit shows up...", 30);

    const metadataURI = await uploadMetadataToIpfs();
    setImageURI(metadataURI);

    var contractAddr = getContractAddress();
    var newAddress;

    const ops = {
      contractAddress: contractAddr,
      functionName: "createCustomCollection",
      abi: factoryABIJson,
      params: {
        _name: name,
        _symbol: symbol,
        _maxSupply: supply,
        _baseURIextended: metadataURI
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: async (response) => {
        newAddress = response.events.NewCustomCollectionCreated.returnValues.newCustomCollection;
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
        let title = "Collection created!";
        let msg = (
          <>
            Your new ERC721 collection has been succesfully created!
            <br></br>
            Your smart-contract address: {newAddress}
            <br></br>
            <a href={link} target='_blank' rel='noreferrer noopener'>
              View in explorer: &nbsp;
              <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
            </a>
          </>
        );

        openNotification("success", title, msg);
        console.log("Collection created");
        uploadMetadataToMoralis(newAddress, metadataURI);
      },
      onError: (error) => {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while creating your custom collection!";
        openNotification("error", title, msg);
        console.log(error);
      }
    });

    setCustomAddress(newAddress);
    customContractAddrs(newAddress);
  };

  useEffect(() => {
    passNameAndSymbol([name, symbol, parseInt(supply)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, symbol, supply]);

  const getCustomCollections = async () => {
    const res = await getCustomCollectionData(walletAddress);
    const parsedcollections = await parseData(res, walletAddress);
    setCustomCollection(parsedcollections);
  };

  useEffect(() => {
    getCustomCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onCollectionChange(valueArr) {
    if (valueArr === undefined) {
      handleDeselect();
    } else {
      setIsExistingCollection(true);
      setCustomAddress(valueArr[3]);
      customContractAddrs(valueArr[3]);
      setName(valueArr[1]);
      setDescription(valueArr[4]);
      setImageURI(valueArr[5]);
    }
  }

  const handleDeselect = () => {
    setIsExistingCollection(false);
    setDisplayFactory(false);
    setCustomAddress();
    customContractAddrs();
    setName();
    setSymbol();
    setDescription();
    setImageURI();
  };

  const handleSwitch = () => {
    !displayFactory ? setDisplayFactory(true) : setDisplayFactory(false);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      setIsExistingCollection(false);
      setDisplayFactory(false);
      setCustomAddress();
      customContractAddrs();
      setName();
      setSymbol();
      setDescription();
      setImageURI();
    }
  }));

  const uploadButton = (
    <div>
      {isImageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Picture</div>
    </div>
  );

  return (
    <div style={styles.transparentContainerInside}>
      <Select
        showSearch
        allowClear={true}
        style={{ width: "70%", marginTop: "20px" }}
        placeholder='Pick an existing collection'
        optionFilterProp='children'
        optionLabelProp='label'
        onChange={onCollectionChange}
        onDeselect={handleDeselect}
      >
        {customCollection &&
          customCollection.map((collection, i) => (
            <Option
              value={[
                collection.name,
                collection.image,
                collection.maxSupply,
                collection.collectionAddress,
                collection.description,
                collection.metadataURI
              ]}
              key={i}
            >
              <Space size='middle'>
                <>
                  <img src={collection.image} alt='' style={{ width: "30px", height: "30px", borderRadius: "4px" }} />
                  <span>{collection.name}</span>
                </>
              </Space>
            </Option>
          ))}
      </Select>

      {!isExistingCollection && (
        <>
          <div style={{ fontSize: "12px", margin: "20px", justifyContent: "center" }}>
            <p>OR</p>
          </div>
          <div style={{ fontSize: "17px", margin: "20px", justifyContent: "center" }}>
            <span>Create a new collection: </span>
            <Tooltip
              title='Create your very own pack collection from scratch ! Define the name, symbol, supply and description. Leave blanck to use our default collection.'
              style={{ position: "absolute", top: "35px", right: "80px" }}
            >
              <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
            </Tooltip>
            <Switch style={{ marginLeft: "30px" }} size='small' defaultChecked={false} onChange={handleSwitch} />
          </div>

          {displayFactory && (
            <>
              <div style={styles.transparentContainerInside}>
                <p style={{ fontSize: "13px", marginTop: "8px", letterSpacing: "1px", fontWeight: "300" }}>
                  Fill the fields below to create a new pack collection:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "65% 35%", textAlign: "center", margin: "auto" }}>
                  <div>
                    <div style={{ display: "column-flex" }}>
                      <label style={{ fontSize: "11px" }}>Collection Name:</label>
                      <Input
                        style={styles.transparentInput}
                        placeholder='e.g. My Super Collection'
                        value={name}
                        onChange={handleNameChange}
                      />
                    </div>

                    <div
                      style={{ display: "grid", gridTemplateColumns: "50% 50%", textAlign: "center", margin: "auto" }}
                    >
                      <div style={{ display: "column-flex" }}>
                        <label style={{ fontSize: "11px" }}>Collection Symbol:</label>
                        <Input
                          style={styles.transparentInputSmaller}
                          placeholder='e.g. MSC'
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
                          <QuestionCircleOutlined
                            style={{ color: "white", paddingLeft: "15px", transform: "scale(0.8)" }}
                          />
                        </Tooltip>
                        <Input style={styles.transparentInputSmaller} value={supply} onChange={handleSupplyChange} />
                      </div>
                    </div>

                    <div style={{ display: "column-flex" }}>
                      <label style={{ fontSize: "11px" }}>Collection Description:</label>
                      <TextArea
                        style={styles.transparentInput}
                        placeholder='e.g. This is a great collection.'
                        maxLength={250}
                        showCount
                        value={description}
                        onChange={handleDescriptionChange}
                      />
                    </div>
                  </div>
                  <div style={{ alignItems: "center", margin: "auto" }}>
                    <Upload
                      type='file'
                      maxCount='1'
                      name='image'
                      listType='picture-card'
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handleImageChange}
                    >
                      {imageURL ? <img src={imageURL} alt='' style={{ width: "100%" }} /> : uploadButton}
                    </Upload>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <Button type='primary' shape='round' size='large' style={styles.resetButton} onClick={handleCreate}>
                    CREATE NEW COLLECTION
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {customAddress && customAddress.length > 0 && (
        <div style={styles.transparentContainerInside}>
          <p style={{ padding: "20px 10px 0px 10px", fontSize: "14px" }}>
            Here is the smart-contract address of your pack collection:
            <br></br>
            <span style={{ fontSize: "13px", color: "yellow" }}>{customAddress}</span>
            <br></br>
            To start minting your packs, scroll down and prepare them.
          </p>
        </div>
      )}

      <p style={{ fontSize: "11px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
        *Just leave everything blank if you do not want to create a new collection and simply use our integrated L3PB
        collection.
      </p>
    </div>
  );
});
export default CollectionSelector;
