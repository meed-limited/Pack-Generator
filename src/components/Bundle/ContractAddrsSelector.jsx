import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import { getExplorer } from "helpers/networks";
import { openNotification } from "components/Notification";
import "../../style.css";
import styles from "./styles";

const ContractAddrsSelector = forwardRef(({ customContractAddrs, passNameAndSymbol }, ref) => {
  const contractProcessor = useWeb3ExecuteFunction();
  const { chainId, walletAddress, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const factoryABIJson = JSON.parse(factoryABI);
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [supply, setSupply] = useState(0);
  const [customAddress, setCustomAddress] = useState();

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

  const handleCustomAddress = async (e) => {
    setCustomAddress(e.target.value);
    customContractAddrs(e.target.value);
  };

  const handleCreate = async () => {
    createNewContract(name, symbol);
  };

  const sendCollectionMetadataToMoralis = (collectionAddress) => {
    const CustomCollections = Moralis.Object.extend("CustomCollections")
    const customCollections = new CustomCollections();
    customCollections.set("owner", walletAddress);
    customCollections.set("name", name ? name : "LepriBundle");
    customCollections.set("symbol", symbol ? symbol : "L3P");
    customCollections.set("maxSupply", supply);
    customCollections.set("collectionAdress", collectionAddress);

    try {
      customCollections.save();
    } catch (error) {
      console.log(error);
    }
  }

  const createNewContract = async (name, symbol) => {
    var contractAddr = getContractAddress();
    var newAddress;
    const ops = {
      contractAddress: contractAddr,
      functionName: "createCustomCollection",
      abi: factoryABIJson,
      params: {
        _name: name,
        _symbol: symbol,
        _maxSupply: supply
      }
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: async (response) => {
        newAddress = response.events.NewCustomCollectionCreated.returnValues.newCustomCollection;
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
        let title = "Collection created!";
        let msg = (
          <div>
            Your new ERC721 collection has been succesfully created!
            <br></br>
            Your smart-contract address: {newAddress}
            <br></br>
            <a href={link} target='_blank' rel='noreferrer noopener'>
              View in explorer: &nbsp;
              <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
            </a>
          </div>
        );

        openNotification("success", title, msg);
        console.log("Collection created");

        sendCollectionMetadataToMoralis(newAddress);
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
    passNameAndSymbol([name, symbol, supply]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, symbol, supply]);

  useImperativeHandle(ref, () => ({
    reset() {
      setCustomAddress();
      customContractAddrs();
      setName();
      setSymbol();
    }
  }));

  return (
    <div style={styles.transparentContainerInside}>
      <p style={{ fontSize: "13px", marginTop: "8px", letterSpacing: "1px", fontWeight: "300" }}>
        Fill the fields below to create a new bundle collection:
        <Tooltip
          title='Enter a collection name and symbol to generate a new ERC721 contract and get your very own bundle collection! Leave blanck to use our default L3PB collection.'
          style={{ position: "absolute", top: "35px", right: "80px" }}
        >
          <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
        </Tooltip>
      </p>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <label style={{ fontSize: "11px", paddingRight: "10px" }}>Name:</label>
        <Input
          style={styles.transparentInput}
          placeholder='e.g. My Super Collection'
          value={name}
          onChange={handleNameChange}
        />
        <label style={{ fontSize: "11px", paddingLeft: "50px", paddingRight: "10px" }}>Symbol:</label>
        <Input style={styles.transparentInput} placeholder='e.g. MSC' value={symbol} onChange={handleSymbolChange} />
        <label style={{ fontSize: "11px", paddingLeft: "50px", paddingRight: "10px" }}>Max Supply:</label>
        <Input style={styles.transparentInput} value={supply} onChange={handleSupplyChange} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <Button type='primary' shape='round' size='large' style={styles.resetButton} onClick={handleCreate}>
          CREATE NEW COLLECTION
        </Button>
      </div>
      {customAddress && customAddress.length > 0 && (
        <div style={styles.transparentContainerInside}>
          <p style={{ padding: "20px 10px 0px 10px", fontSize: "14px" }}>
            Here is the smart-contract address of your new bundle collection:
            <br></br>
            <span style={{ fontSize: "13px", color: "yellow" }}>{customAddress}</span>
            <br></br>
            To start minting your bundles, scroll down and prepare them.
          </p>
        </div>
      )}

      <div style={{ fontSize: "12px", margin: "20px", justifyContent: "center" }}>
        <p>OR</p>
      </div>
      <p style={{ fontSize: "13px", marginTop: "8px", letterSpacing: "1px", fontWeight: "300" }}>
        Select an existing collection:
        <Tooltip
          title='Enter the collection contract address that you created via our factory, or leave the field blank to use our L3PB collection.'
          style={{ position: "absolute", top: "35px", right: "80px" }}
        >
          <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
        </Tooltip>
      </p>
      <Input
        style={styles.transparentInput}
        placeholder='Enter custom contract address if any. Leave free to use our L3PB collection.'
        value={customAddress}
        onChange={handleCustomAddress}
      />
      <p style={{ fontSize: "11px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
        *Just leave everything blank if you do not want to create a new collection and simply use our integrated L3PB
        collection.
      </p>
    </div>
  );
});
export default ContractAddrsSelector;
