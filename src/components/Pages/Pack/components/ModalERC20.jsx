import React, { useState, useEffect } from "react";
import { Modal, Input, Typography, Button, InputNumber } from "antd";
import AssetSelector from "../../../Wallet/components/AssetSelector";
import { useNativeBalance } from "react-moralis";
const { Title } = Typography;

const ModalERC20 = ({ isModalNFTVisible, handleAssetOk, confirmLoading, handleAssetCancel, native, erc20 }) => {
  const [nativeAmount, setNativeAmount] = useState(native);
  const [ERC20Tokens, setERC20Tokens] = useState(erc20);
  const [currentToken, setCurrentToken] = useState();
  const { data: balance, nativeToken } = useNativeBalance();

  const onChangeToken = (token) => {
    setCurrentToken({ ...currentToken, data: token });
  };

  const onChangeERC20Amount = (value) => {
    let max = (currentToken?.data.balance / ("1e" + 18)).toString();
    if (parseFloat(value) <= 0) {
      setCurrentToken({ ...currentToken, value: 0 });
    } else if (parseFloat(value) > parseFloat(max)) {
      setCurrentToken({ ...currentToken, value: parseFloat(max) });
    } else {
      setCurrentToken({ ...currentToken, value: parseFloat(value) });
    }
  };

  const handleAddToken = () => {
    const max = (currentToken.data.balance / ("1e" + 18)).toString();
    const cappedValue = currentToken.value < max ? currentToken.value : max;
    if (ERC20Tokens.some((selectedToken) => selectedToken.data.token_address === currentToken.data.token_address)) {
      setERC20Tokens(
        ERC20Tokens?.map((tokenItem) =>
          tokenItem.data.token_address !== currentToken.data.token_address
            ? tokenItem
            : { data: currentToken.data, value: cappedValue }
        )
      );
    } else {
      setERC20Tokens(ERC20Tokens.concat([{ ...currentToken, value: cappedValue }]));
    }
  };

  const handleClickOk = () => {
    handleAssetOk(nativeAmount, ERC20Tokens);
  };

  useEffect(() => {
    if (isModalNFTVisible) {
      setNativeAmount(native);
      setERC20Tokens(erc20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalNFTVisible]);

  return (
    <Modal
      title='Select some Crypto-Tokens to pack (Amount PER pack)'
      visible={isModalNFTVisible}
      onOk={handleClickOk}
      confirmLoading={confirmLoading}
      onCancel={handleAssetCancel}
    >
      <div style={{ margin: "auto", textAlign: "center" }}>
      <Title level={5} style={{ color: "white" }}>
        Amount of {nativeToken?.name} coins per pack:
      </Title>

      <InputNumber
        style={{ marginBottom: "80px", minWidth: "200px" }}
        type='number'
        step={0.01}
        min={0}
        max={balance?.balance / ("1e" + nativeToken?.decimals)}
        placeholder={`Enter ${nativeToken?.name} amount`}
        onChange={setNativeAmount}
        value={nativeAmount}
      ></InputNumber>

      <Title level={5} style={{ color: "white" }}>
        Amount of ERC20 Tokens per pack:
      </Title>
      <AssetSelector setAsset={onChangeToken} style={{ width: "auto", minWidth: "300px" }} />
      <div style={{ margin: "auto", width: "300px", alignItems: "center" }}>
        <Input
          style={{ marginTop: "10px" }}
          type='number'
          min='0'
          step={0.1}
          placeholder='Enter selected token amount'
          onChange={(e) => onChangeERC20Amount(parseFloat(e.target.value))}
          disabled={!currentToken ? true : false}
        ></Input>
        <Button
          onClick={handleAddToken}
          disabled={!currentToken || currentToken.value <= 0 || currentToken.value === undefined ? true : false}
          style={{ marginTop: "8px", marginLeft: "8px" }}
        >
          Add
        </Button>
      </div>
      </div>
      
      <div style={{ width: "100", color: "white", display: "flex", flexDirection: "column" }}>
        {ERC20Tokens &&
          ERC20Tokens.length > 0 &&
          ERC20Tokens?.map((token) => (
            <p key={token.data.symbol}>
              {token.data.symbol}: {token.value}
            </p>
          ))}
      </div>
      <div style={{ width: "100", display: "flex", justifyContent: "flex-end" }}></div>
    </Modal>
  );
};

export default ModalERC20;
