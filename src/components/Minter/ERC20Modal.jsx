import React, { useState } from "react";
import { Modal, Input, Typography, Button } from "antd";
import AssetSelector from "../Wallet/components/AssetSelector";
const { Title } = Typography;

const ERC20Modal = ({ isAssetModalVisible, handleAssetOk, confirmLoading, handleAssetCancel }) => {
  const [ethAmount, setEthAmount] = useState(0);
  const [ERC20Tokens, setERC20Tokens] = useState([]);
  const [currentToken, setCurrentToken] = useState();
  //const [currentTokenAmount, setCurrentTokenAmount] = useState();
  //const [currentToken, setCurrentToken] = useState({});

  const onChangeToken = (token) => {
    setCurrentToken(token);
  };

  // const onChangeTokenAmount = (value) => {
  //     setCurrentTokenAmount(value);
  //     setERC20Tokens({ currentToken, currentTokenAmount })
  // }

  const handleClickOk = () => {
    handleAssetOk(ethAmount, ERC20Tokens);
  };

  const handleReset = () => {
    setERC20Tokens([]);
  };

  const onChangeERC20Amount = (value) => {
    // //if (ERC20Tokens.some(selectedToken => selectedToken.symbol === currentToken)) {
    // if (ERC20Tokens.some(selectedToken => selectedToken.token_address === currentToken.token_address)) {
    //     //setERC20Tokens(ERC20Tokens.filter(token => token.token_address !== currentToken.token_address))
    //     //  setERC20Tokens(ERC20Tokens.map(token => {
    //     //     if (token.token_address === currentToken.token_address) {
    //     //         ERC20Tokens.splice(token, 1)
    //     //         //return {
    //     //         //     //...token,
    //     //         //     currentToken: currentToken.symbol,
    //     //         //     value: value
    //     //         //}
    //     //     }
    //     //     //else return token
    //     // }
    //     // ))
    // }
    // else {
    //     setERC20Tokens(ERC20Tokens.concat([{ currentToken, value }]))
    // }

    for (let i = 0; i < ERC20Tokens.length; i++) {
      let token = ERC20Tokens[i];
      if (token.currentToken.token_address === currentToken.token_address) {
        setERC20Tokens(ERC20Tokens.splice(token, 1));
      }
    }
    if (value > 0) {
      setERC20Tokens(ERC20Tokens.concat([{ currentToken, value }]));
    }
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
      <Input
        style={{ marginBottom: "80px" }}
        type='number'
        placeholder='Enter ETH amount'
        onChange={(e) => setEthAmount(e.target.value)}
      ></Input>
      <Title level={5}>Bundle ERC20 Token</Title>
      <AssetSelector getAsset={onChangeToken} />
      <Input
        style={{ marginTop: "10px" }}
        type='number'
        placeholder='Enter selected token amount'
        onChange={(e) => onChangeERC20Amount(e.target.value)}
      ></Input>
      <div style={{ width: "100", display: "flex", justifyContent: "flex-end" }}>
        <Button type='primary' style={{ margin: "50px 30px 0px" }} onClick={handleReset} danger>
          Delete all tokens
        </Button>
      </div>
    </Modal>
  );
};

export default ERC20Modal;
