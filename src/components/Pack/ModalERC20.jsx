import React, { useState } from "react";
import { Modal, Input, Typography, Button, InputNumber } from "antd";
import AssetSelector from "../Wallet/components/AssetSelector";
import { useNativeBalance } from "hooks/useNativeBalance";

const { Title } = Typography;

const ModalERC20 = ({ isModalNFTVisible, handleAssetOk, confirmLoading, handleAssetCancel }) => {
  const [nativeAmount, setNativeAmount] = useState(0);
  const [ERC20Tokens, setERC20Tokens] = useState([]);
  const [currentToken, setCurrentToken] = useState();
  const { balance, nativeName } = useNativeBalance();

  const onChangeToken = (token) => {
    setCurrentToken({ ...currentToken, data: token });
  };

  const onChangeERC20Amount = (value) => {
      let max = (currentToken.data.balance / ("1e" + 18)).toString();
      if (parseFloat(value) <= 0) {
        setCurrentToken({...currentToken, value: 0});
      } else if (parseFloat(value) > parseFloat(max)) {
        setCurrentToken({...currentToken, value: parseFloat(max)});
      } else {
        setCurrentToken({...currentToken, value: parseFloat(value)});
      }
  };

  const handleAddToken = () => {
    if (ERC20Tokens.some((selectedToken) => selectedToken.data.token_address === currentToken.data.token_address)) {
      setERC20Tokens(
        ERC20Tokens.map((tokenItem) =>
          tokenItem.data.token_address !== currentToken.data.token_address
            ? tokenItem
            : { data: currentToken.data, value: currentToken.value }
        )
      );
    } else {
      setERC20Tokens(ERC20Tokens.concat([currentToken]));
    }
  };

  const handleClickOk = () => {
    handleAssetOk(nativeAmount, ERC20Tokens);
    // TODO: double check handle values and reset
    setNativeAmount(0);
    setERC20Tokens([]);
    setCurrentToken(currentToken);
  };

  return (
    <Modal
      title='Select assets to pack'
      visible={isModalNFTVisible}
      onOk={handleClickOk}
      confirmLoading={confirmLoading}
      onCancel={handleAssetCancel}
    >
      <Title level={5} style={{ color: "white" }}>Amount of {nativeName} to pack</Title>

      <InputNumber
        style={{ marginBottom: "80px", minWidth: "200px" }}
        type='number'
        min={0}
        max={balance.formatted}
        placeholder={`Enter ${nativeName} amount`}
        onChange={setNativeAmount}
      ></InputNumber>

      <Title level={5} style={{ color: "white" }}>Amount of ERC20 Tokens to pack</Title>
      <AssetSelector getAsset={onChangeToken} style={{ width: "auto", minWidth: "120px" }} />
      <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        <Input
          style={{ marginTop: "10px" }}
          type='number'
          min='0'
          step={0.00001}
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
      <div style={{ width: "100", color: "white", display: "flex", flexDirection: "column" }}>
        {ERC20Tokens &&
          ERC20Tokens.length > 0 &&
          ERC20Tokens.map((token) => (
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
