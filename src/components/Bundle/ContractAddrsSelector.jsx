import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import { getExplorer } from "helpers/networks";
import { openNotification } from "components/Notification";
import "../../style.css";
import styles from "./styles";

const ContractAddrsSelector = forwardRef(({ customContractAddrs }, ref) => {
  const contractProcessor = useWeb3ExecuteFunction();
  const { chainId, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } = useMoralisDapp();
  const factoryABIJson = JSON.parse(factoryABI);
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
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

  const handleCustomAddress = async (e) => {
    setCustomAddress(e.target.value);
    customContractAddrs(e.target.value);
  };

  const handleCreate = async () => {
    createNewContract(name, symbol);
  };

  const createNewContract = async (name, symbol) => {
    var contractAddr = getContractAddress();
    var newAddress;
    const ops = {
      contractAddress: contractAddr,
      functionName: "createCustomCollection",
      abi: factoryABIJson,
      params: {
        _name: name,
        _symbol: symbol
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
      <p style={{ fontSize: "16px", marginTop: "8px", letterSpacing: "1px", fontWeight: "300" }}>
        Fill the fields below to create a new bundle collection:
        <Tooltip
          title='Enter a collection name and symbol to generate a new ERC721 contract and get your very own bundle collection! Leave blanck to use our default L3PB collection.'
          style={{ position: "absolute", top: "35px", right: "80px" }}
        >
          <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
        </Tooltip>
      </p>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <label style={{ fontSize: "14px", paddingRight: "10px" }}>Name:</label>
        <Input style={styles.transparentInput} value={name} onChange={handleNameChange} />
        <label style={{ fontSize: "14px", paddingLeft: "50px", paddingRight: "10px" }}>Symbol:</label>
        <Input style={styles.transparentInput} value={symbol} onChange={handleSymbolChange} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <Button type='primary' shape='round' size='large' style={styles.resetButton} onClick={handleCreate}>
          CREATE NEW COLLECTION
        </Button>
      </div>
      {customAddress && customAddress.length > 0 && (
        <div style={styles.transparentContainerInside}>
          <p style={{ padding: "20px 10px 0px 10px", fontSize: "17px" }}>
            Here is the smart-contract address of your new bundle collection:
            <br></br>
            <span style={{ fontSize: "19px", color: "yellow" }}>{customAddress}</span>
            <br></br>
            Make sure to keep it somewhere! To start minting your first bundles, scroll down and prepare your bundles.
          </p>
        </div>
      )}

      <div style={{ fontSize: "12px", margin: "20px", justifyContent: "center" }}>
        <p>OR</p>
      </div>
      <p style={{ fontSize: "16px", marginTop: "8px", letterSpacing: "1px", fontWeight: "300" }}>
        Select the collection contract address:
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
      <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
        *Just leave everything blank if you do not want to create a new collection and simply use our integrated L3PB
        collection.
      </p>
    </div>
  );
});
export default ContractAddrsSelector;
