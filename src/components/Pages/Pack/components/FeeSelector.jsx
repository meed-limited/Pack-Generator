/*eslint no-dupe-keys: "Off"*/
import { useEffect, useState } from "react";
import Moralis from "moralis";
import { useMoralis, useNativeBalance } from "react-moralis";
import { CHAINS_WITH_L3P_SUPPORT, assemblyABI, getAssemblyAddress } from "../../../../Constant/constant";
import { menuItems } from "../../../Chains/Chains";
import { Alert, Switch } from "antd";
import Text from "antd/lib/typography/Text";

const styles = {
  transparentContainerInside: {
    borderRadius: "15px",
    margin: "auto",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "center",
    padding: "30px 50px 15px 50px"
  },
  feeSelection: {
    color: "white",
    fontSize: "20px",
    textAlign: "center",
    margin: "10px",
    padding: "20px"
  }
};

const FeeSelector = ({ serviceFee, setServiceFee, customCollectionData, packNumber, isBatch = false }) => {
  const { chainId, isWeb3Enabled } = useMoralis();
  const { nativeToken } = useNativeBalance(chainId);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [feeInETH, setFeeinETH] = useState();
  const [feeInL3P, setFeeinL3P] = useState();
  const onLP3Chain = CHAINS_WITH_L3P_SUPPORT.includes(chainId);

  const getContractAddress = () => {
    if (customCollectionData !== undefined && customCollectionData[0] && customCollectionData[0].length > 0) {
      return customCollectionData[0];
    } else {
      return getAssemblyAddress(chainId);
    }
  };
  const contractAddress = getContractAddress();

  const getFeeinETH = async () => {
    const readOptions = {
      contractAddress: contractAddress,
      functionName: "feeETH",
      abi: assemblyABIJson
    };

    try {
      let feeEth = await Moralis.executeFunction(readOptions);
      feeEth = parseFloat(feeEth) / "1e18";
      setFeeinETH(feeEth);
      setServiceFee({ type: "native", amount: feeEth }); //initialisation
    } catch (error) {
      console.log(error);
    }
  };

  const getFeeinL3P = async () => {
    const readOptions = {
      contractAddress: contractAddress,
      functionName: "feeL3P",
      abi: assemblyABIJson
    };

    try {
      let feeL3P = await Moralis.executeFunction(readOptions);
      feeL3P = parseInt(feeL3P) / "1e18";
      setFeeinL3P(feeL3P);
    } catch (error) {
      console.log(error);
    }
  };

  const getDiscountPerPack = (packNumber) => {
    if (packNumber > 5000) {
      return 0.6;
    } else if (packNumber > 1000 && packNumber < 5001) {
      return 0.8;
    } else return 1;
  };

  const displayDiscount = (discount) => {
    if (discount !== 1) {
      return <>(-{100 - discount * 100}%)</>;
    }
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getFeeinETH();
      getFeeinL3P();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, contractAddress]);

  useEffect(() => {
    getContractAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customCollectionData, chainId]);

  const onSwitchChange = (checked) => {
    if (checked) {
      setServiceFee({ type: "L3P", amount: feeInL3P });
    } else {
      setServiceFee({ type: "native", amount: feeInETH });
    }
  };

  const chainName = menuItems.filter((name) => name.key === chainId)[0].value;
  const discount = getDiscountPerPack(packNumber);

  return (
    <>
      <Text style={{ fontSize: "20px", textAlign: "center" }}>Service fees payment options:</Text>
      {!isBatch && (
        <>
          <div style={styles.feeSelection}>
            {feeInETH} {nativeToken?.symbol}
            <Switch
              onChange={onSwitchChange}
              disabled={!onLP3Chain}
              checked={onLP3Chain ? true : false}
              style={{ margin: "0 15px", padding: "0 10px" }}
            ></Switch>
            {feeInL3P} L3P
          </div>
          {!onLP3Chain && (
            <Alert
              type='info'
              style={{ width: "80%", margin: "auto", marginBottom: "20px" }}
              showIcon
              message={`L3P payment is not available on ${chainName} yet.`}
            />
          )}
        </>
      )}
      {isBatch && (
        <>
          <div style={{ marginTop: "30px", fontSize: "15px" }}>
            <Text style={{ fontSize: "15px" }}>Per pack and before discount (if applicable)</Text>
          </div>

          <div style={{ ...styles.feeSelection, paddingTop: "0" }}>
            {feeInETH} {nativeToken?.symbol}
            <Switch
              onChange={onSwitchChange}
              disabled={!onLP3Chain}
              checked={onLP3Chain ? true : false}
              style={{ margin: "0 15px", padding: "0 10px" }}
            ></Switch>
            {feeInL3P} L3P
          </div>
          {!onLP3Chain && (
            <Alert
              type='info'
              style={{ width: "80%", margin: "auto", marginBottom: "20px" }}
              showIcon
              message={`L3P payment is not available on ${chainName} yet.`}
            />
          )}
          {serviceFee?.type === "native" && (
            <div style={{ margin: "20px auto", fontSize: "18px", color: "yellow" }}>
              Service fee for {packNumber} packs {displayDiscount(discount)} :<br></br>
              {packNumber * (feeInETH * discount)} {nativeToken?.symbol}
            </div>
          )}
          {serviceFee?.type === "L3P" && (
            <div style={{ margin: "20px auto", fontSize: "18px", color: "yellow" }}>
              Service fee for {packNumber} packs {displayDiscount(discount)} :<br></br>
              {packNumber * (feeInL3P * discount)} L3P
            </div>
          )}
          <div></div>
        </>
      )}
    </>
  );
};

export default FeeSelector;
