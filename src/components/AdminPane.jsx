import { useState } from "react";
import { Moralis } from "moralis";
import { useMoralis, useNativeBalance } from "react-moralis";
import AddressInput from "./AddressInput";
import { openNotification } from "../helpers/notifications";
import { assemblyABI, factoryABI, getAssemblyAddress, getFactoryAddress } from "../Constant/constant";
import { Button, Divider, Input } from "antd";

const styles = {
  container: {
    background: "black",
    borderRadius: "20px",
    width: "80%",
    textAlign: "center",
    margin: "auto",
    padding: "30px 0"
  },
  title: {
    color: "white",
    fontWeight: 600,
    fontSize: "30px",
    marginBottom: "10px"
  },
  text: {
    color: "black",
    fontSize: "20px",
    marginTop: "10px"
  },
  adminButton: {
    height: "30px",
    textAlign: "center",
    fontWeight: "400",
    fontSize: "13px",
    border: "none",
    background: "white",
    color: "black",
    fontFamily: "Sora, sans-serif"
  }
};

const AdminPane = ({ adminAddress, setAdminAddress, setIsAdminPaneOpen }) => {
  const { chainId } = useMoralis();
  const contractAddress = getAssemblyAddress(chainId);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const factoryAddress = getFactoryAddress(chainId);
  const factoryABIJson = JSON.parse(factoryABI);
  const { nativeToken } = useNativeBalance(chainId);
  const [ethAmount, setEthAmount] = useState();
  const [L3PAmount, setL3PAmount] = useState();
  const [address, setAddress] = useState(null);
  const [IPFSurl, setIPFSurl] = useState("");
  const [newAdminAdd, setNewAdminAdd] = useState();
  const [customEthAmount, setCustomEthAmount] = useState();
  const [customL3PAmount, setCustomL3PAmount] = useState();

  const handleBackClic = () => {
    setIsAdminPaneOpen(false);
  };

  const setEthFee = async (contractAdd, abi, amount) => {
    if (amount && amount >= 0) {
      const nativeAmount = (amount * "1e18").toString();

      const sendOptions = {
        contractAddress: contractAdd,
        functionName: "setFeeETH",
        abi: abi,
        params: {
          _newEthFee: nativeAmount
        }
      };

      try {
        const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        let title = "All set!";
        let msg = `${nativeToken.symbol} fee set successfully.`;
        openNotification("success", title, msg);
      } catch (error) {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while updating the fee. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
      setEthAmount();
    }
  };

  const setL3PFee = async (contractAdd, abi, amount) => {
    if (amount && amount >= 0) {
      const tokenAmount = (amount * "1e18").toString();
      const sendOptions = {
        contractAddress: contractAdd,
        functionName: "setFeeL3P",
        abi: abi,
        params: {
          _newL3PFee: tokenAmount
        }
      };

      try {
        const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        let title = "All set!";
        let msg = "L3P fee set successfully.";
        openNotification("success", title, msg);
      } catch (error) {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while updating the fee. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
      setL3PAmount();
    }
  };

  const setReceiverAddress = async () => {
    if (address) {
      const sendOptions = {
        contractAddress: contractAddress,
        functionName: "setFeeReceiver",
        abi: assemblyABIJson,
        params: {
          _newFeeReceiver: address.toString()
        }
      };

      try {
        const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        let title = "All set!";
        let msg = "New receiver address set successfully.";
        openNotification("success", title, msg);
      } catch (error) {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while updating the receiver address. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
      setAddress(null);
    }
  };

  const setMetadata = async () => {
    if (IPFSurl && IPFSurl.length > 0) {
      const sendOptions = {
        contractAddress: contractAddress,
        functionName: "setTokenURI",
        abi: assemblyABIJson,
        params: {
          _newTokenURI: IPFSurl.toString()
        }
      };

      try {
        const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        let title = "All set!";
        let msg = "New metadata set successfully.";
        openNotification("success", title, msg);
      } catch (error) {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while updating the metadata. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
    }
    setIPFSurl("");
  };

  const setNewAdmin = async () => {
    if (adminAddress) {
      const sendOptions = {
        contractAddress: contractAddress,
        functionName: "transferOwnership",
        abi: assemblyABIJson,
        params: {
          newOwner: newAdminAdd.toString()
        }
      };

      try {
        const transaction = await Moralis.executeFunction(sendOptions);
        await transaction.wait();
        let title = "All set!";
        let msg = "New admin set successfully.";
        openNotification("success", title, msg);
      } catch (error) {
        let title = "Unexpected error";
        let msg = "Oops, something went wrong while changing the admin address. Please try again.";
        openNotification("error", title, msg);
        console.log(error);
      }
      setAdminAddress(null);
      setNewAdminAdd(null);
      setIsAdminPaneOpen(false);
    }
  };

  return (
    <div style={{ ...styles.container, marginTop: "60px" }}>
      <div style={styles.title}>Admin Panel</div>
      <Divider />
      <p style={{ color: "white", fontSize: "15px", paddingBottom: "10px" }}>Variables for Lepricon Main Collection</p>
      <div style={{ width: "60%", margin: "auto" }}>
        <Input
          type='number'
          placeholder={`Enter the new fee in ${nativeToken.symbol}`}
          style={{ marginBottom: "5px" }}
          onChange={(e) => setEthAmount(e.target.value)}
        />
        <Button
          type='primary'
          onClick={() => setEthFee(contractAddress, assemblyABIJson, ethAmount)}
          style={{ marginBottom: "20px" }}
        >
          Set {nativeToken.symbol} fee
        </Button>
        {chainId === 0x1 && chainId === 0x38 && (
          <>
            <Input
              type='number'
              placeholder='Enter the new fee in L3P'
              style={{ marginBottom: "5px" }}
              onChange={(e) => setL3PAmount(e.target.value)}
            />
            <Button
              type='primary'
              onClick={() => setL3PFee(contractAddress, assemblyABIJson, L3PAmount)}
              style={{ marginBottom: "20px" }}
            >
              Set L3P fee
            </Button>
          </>
        )}

        <AddressInput
          style={{ marginBottom: "5px" }}
          autoFocus
          placeholder='Enter the new receiver address'
          onChange={setAddress}
        />
        <Button type='primary' onClick={setReceiverAddress} style={{ marginBottom: "20px" }}>
          Set receiver address
        </Button>
        <Input
          style={{ marginBottom: "5px" }}
          placeholder='Enter the new metadata URL'
          onChange={(e) => setIPFSurl(e.target.value)}
        />
        <Button type='primary' onClick={setMetadata} style={{ marginBottom: "20px" }}>
          Set Metadata
        </Button>
        <AddressInput
          style={{ marginBottom: "5px" }}
          placeholder='Enter the new admin address'
          autoFocus
          onChange={setNewAdminAdd}
        />
        <Button type='primary' onClick={setNewAdmin} style={{ marginBottom: "20px" }}>
          Set admin address
        </Button>

        <Divider />
        <p style={{ color: "white", fontSize: "15px", paddingBottom: "10px" }}>Variables for Custom Collections</p>
        <Input
          type='number'
          placeholder={`Enter the new fee in ${nativeToken.symbol}`}
          style={{ marginBottom: "5px" }}
          onChange={(e) => setCustomEthAmount(e.target.value)}
        />
        <Button
          type='primary'
          onClick={() => setEthFee(factoryAddress, factoryABIJson, customEthAmount)}
          style={{ marginBottom: "20px" }}
        >
          Custom Collection: Set {nativeToken.symbol} fee
        </Button>
        <Input
          type='number'
          placeholder={`Enter the new fee in ${nativeToken.symbol}`}
          style={{ marginBottom: "5px" }}
          onChange={(e) => setCustomL3PAmount(e.target.value)}
        />
        <Button
          type='primary'
          onClick={() => setL3PFee(factoryAddress, factoryABIJson, customL3PAmount)}
          style={{ marginBottom: "20px" }}
        >
          Custom Collection: Set L3P fee
        </Button>
      </div>

      <div>
        <Button style={styles.adminButton} shape='round' onClick={handleBackClic}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default AdminPane;
