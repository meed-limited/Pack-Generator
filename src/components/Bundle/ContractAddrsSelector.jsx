import { useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { FileSearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { openNotification } from "components/Notification";
import "../../style.css";
import styles from "./styles";

const ContractAddrsSelector = ({ customContractAddrs }) => {
  const contractProcessor = useWeb3ExecuteFunction();
  const { chainId, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } = useMoralisDapp();
  const factoryABIJson = JSON.parse(factoryABI);
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();


  const getContractAddress = () => {
    if (chainId === "0x1") {
      return factoryAddressEthereum;
    } else if (chainId === "0x89") {
      return factoryAddressPolygon;
    } else if (chainId === "0x13881") {
      return factoryAddressMumbai;
    }
  };

  const handleNameChange = (value) => {
    setName(value);
  }

  const handleSymbolChange = (value) => {
    setSymbol(value);
  }

  const handleCreate = () => {
    createNewContract(name, symbol);
  };

  const createNewContract = (name, symbol) => {
    var contractAddr = getContractAddress();
    const ops = {
      contractAddress: contractAddr,
      functionName: "createCustomCollection",
      abi: factoryABIJson,
      params: {
        _name: name,
        _symbol: symbol
      }
    };

    contractProcessor.fetch({
      params: ops,
      onSuccess: async (response) => {
        //let asset = response.events.AssemblyAsset.returnValues;
        let link = `${getExplorer(chainId)}tx/${response.transactionHash}`;
        let title = "Collection created!";
        let msg = (
          <div>
            Your bundle has been succesfully created!
            <br></br>
            {/* Token id: {getEllipsisTxt(asset.tokenId, 6)} */}
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
  };

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
        <Input
          style={styles.transparentInput}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        <label style={{ fontSize: "14px", paddingLeft: "50px", paddingRight: "10px" }}>Symbol:</label>
        <Input
          style={styles.transparentInput}
          onChange={(e) => handleSymbolChange(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "20px"}}>
      <Button type='primary' shape='round' size='large' style={ styles.resetButton } onClick={handleCreate}>
        CREATE NEW COLLECTION
      </Button>
      </div>
      
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
        onChange={(e) => customContractAddrs(e.target.value)}
      />
      <p style={{ fontSize: "14px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300" }}>
        *Just leave everything blank if you do not want to create a new collection and simply use our integrated L3PB
        collection.
      </p>
    </div>
  );
};

export default ContractAddrsSelector;
