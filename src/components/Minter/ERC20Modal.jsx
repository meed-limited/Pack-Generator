import React, { useEffect, useState } from "react";
import { Modal, Input, Typography, Button, InputNumber } from "antd";
import AssetSelector from "../Wallet/components/AssetSelector";
import { useNativeBalance } from "hooks/useNativeBalance";

const { Title } = Typography;

const ERC20Modal = ({ isAssetModalVisible, handleAssetOk, confirmLoading, handleAssetCancel }) => {
  const [ethAmount, setEthAmount] = useState(0);
  const [ERC20Tokens, setERC20Tokens] = useState([]);
  const [currentToken, setCurrentToken] = useState();
  const [currentTokenMax, setCurrentTokenMax] = useState();
  const { balance, nativeName } = useNativeBalance();

  useEffect(() => {
    if (isAssetModalVisible) {
      setEthAmount(0);
      setERC20Tokens([]);
      setCurrentToken();
    }
  }, [isAssetModalVisible]);

  //   // const max = (token.balance / ("1e" + 18)).toString();
  //   // setCurrentTokenMax(max);

  const onChangeToken = (token) => {
    setCurrentToken({ ...currentToken, data: token });
  };

  const onChangeERC20Amount = (value) => {
    setCurrentToken({ ...currentToken, value });
  };

  const handleAddToken = () => {
    console.log(currentToken);

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
    handleAssetOk(ethAmount, ERC20Tokens);
  };

  return (
    <Modal
      title='Select assets to bundle'
      visible={isAssetModalVisible}
      onOk={handleClickOk}
      confirmLoading={confirmLoading}
      onCancel={handleAssetCancel}
    >
      <Title level={5}>Bundle ETH</Title>

      <InputNumber
        style={{ marginBottom: "80px" }}
        type='number'
        min={0}
        max={balance.formatted}
        placeholder='Enter ETH amount'
        onChange={setEthAmount}
      ></InputNumber>

      <Title level={5}>Bundle ERC20 Token</Title>
      <AssetSelector getAsset={onChangeToken} style={{ width: "auto", minWidth: "120px" }} />
      <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        <Input
          style={{ marginTop: "10px" }}
          type='number'
          placeholder='Enter selected token amount'
          onChange={(e) => onChangeERC20Amount(e.target.value)}
        ></Input>
        <Button onClick={handleAddToken} style={{ marginTop: "8px", marginLeft: "8px" }}>
          Add
        </Button>
      </div>
      <div style={{ width: "100", display: "flex", flexDirection: "column" }}>
        {ERC20Tokens.length > 0 &&
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

export default ERC20Modal;
