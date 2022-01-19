import React, { useEffect, useState } from "react";
import { Modal, Input, Typography, Button, InputNumber } from "antd";
import AssetSelector from "../Wallet/components/AssetSelector";
import { useNativeBalance } from "hooks/useNativeBalance";

const { Title } = Typography;

const ERC20Modal = ({ isAssetModalVisible, handleAssetOk, confirmLoading, handleAssetCancel }) => {
  const [ethAmount, setEthAmount] = useState(0);
  const [ERC20Tokens, setERC20Tokens] = useState([]);
  const [currentToken, setCurrentToken] = useState();
  const [currentTokenObject, setCurrentTokenObject] = useState();
  const [currentTokenAmount, setCurrentTokenAmount] = useState();
  const [currentTokenMax, setCurrentTokenMax] = useState();
  const { balance, nativeName } = useNativeBalance();

  useEffect(() => {
    if (isAssetModalVisible) {
      setEthAmount(0);
      setERC20Tokens([]);
      setCurrentToken();
      setCurrentTokenAmount();
    }
  }, [isAssetModalVisible]);

  const onChangeToken = (token) => {
    // const max = (token.balance / ("1e" + 18)).toString();
    // setCurrentTokenMax(max);
    setCurrentToken(token);
  };

  // const handleAddToken = () => {
  //   //setCurrentTokenObject({ data: currentToken, value: currentTokenAmount });
  //   //console.log(currentTokenObject);

  //   if (ERC20Tokens.some((selectedToken) => selectedToken.data.token_address === currentToken.data.token_address)) {
  //     setERC20Tokens(
  //       ERC20Tokens.map((tokenItem) =>
  //           tokenItem.data.token_address !== currentToken.data.token_address
  //             ? tokenItem
  //             : { data: currentToken.data, value: currentToken.value }
  //         //: { data: currentToken.data, value: currentTokenAmount }
  //       )
  //     );
  //   } else {
  //     //setERC20Tokens(ERC20Tokens.concat([currentToken])); //from Hai
  //     setERC20Tokens(ERC20Tokens.concat(currentToken));
  //   }

  //   console.log(ERC20Tokens);
  // };

const handleAddToken = () => {
  console.log(currentToken)

    if (ERC20Tokens.some((selectedToken) => selectedToken.data.token_address === currentToken.data.token_address)) {
      setERC20Tokens(
        ERC20Tokens.map((tokenItem) =>
          tokenItem.data.token_address !== currentToken.data.token_address
            ? tokenItem
            : { data: currentToken.data, value: currentToken.value }
        )
      );
    } else {
      //setERC20Tokens(ERC20Tokens.concat([currentToken])); //from Hai
      setERC20Tokens(ERC20Tokens.concat(currentToken));
    }
  };




  // const handleAddToken = () => {
  //   setCurrentTokenObject({ data: currentToken, value: currentTokenAmount });
  //   console.log(currentTokenObject);

  //   if (ERC20Tokens && ERC20Tokens.length > 0 && ERC20Tokens.some(selectedToken => selectedToken.data.token_address === currentTokenObject.data.token_address)) {
  //     setERC20Tokens(
  //       ERC20Tokens.map(tokenItem =>
  //           tokenItem.data.token_address !== currentTokenObject.data.token_address
  //             ? tokenItem
  //             : { data: currentTokenObject.data, value: currentTokenObject.value }
  //         //: { data: currentToken.data, value: currentTokenAmount }
  //       )
  //     );
  //   } else {
  //     //setERC20Tokens(ERC20Tokens.concat([currentToken])); //from Hai
  //     setERC20Tokens(ERC20Tokens.concat(currentTokenObject));
  //   }

  //   console.log(ERC20Tokens);
  // };

  
  // const onChangeToken = (token) => {
  //   const max = (token.balance / ("1e" + 18)).toString();
  //   setCurrentTokenMax(max);
  //   setCurrentToken({ ...currentToken, data: token });
  // };

  const onChangeERC20Amount = (value) => {
    setCurrentToken({ ...currentToken, value });
  };

  // const handleAddToken = (token, amount) => {
  //   setCurrentTokenObject({ data: token, value: amount });

  //   if (
  //     ERC20Tokens &&
  //     ERC20Tokens.some((selectedToken) => selectedToken.data.token_address === currentTokenObject.token_address)
  //   ) {
  //     setERC20Tokens(
  //       ERC20Tokens.map(
  //         (tokenItem) =>
  //           tokenItem.data.token_address !== currentTokenObject.token_address
  //             ? tokenItem
  //             : { data: currentTokenObject, value: amount }
  //         //: { data: currentToken.data, value: currentTokenAmount }
  //       )
  //     );
  //   } else {
  //     //setERC20Tokens(ERC20Tokens.concat([currentToken])); //from Hai
  //     setERC20Tokens(ERC20Tokens.concat([currentTokenObject]));
  //   }

  //   console.log(ERC20Tokens);
  // };

  

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
        // value={ethAmount}
        //onChange={(e) => setEthAmount(e.target.value)}
        onChange={setEthAmount}
      ></InputNumber>

      <Title level={5}>Bundle ERC20 Token</Title>
      <AssetSelector getAsset={onChangeToken} style={{ width: "auto", minWidth: "120px" }} />
      <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        {/* <Input
          style={{ marginTop: "10px" }}
          type='number'
          min={0}
          max={currentTokenMax}
          //value={currentTokenAmount}
          placeholder='Enter selected token amount'
          // onChange={setCurrentTokenAmount}
          onChange={(e) => onChangeERC20Amount(e.target.value)}
        ></Input> */}

        <Input
          style={{ marginTop: "10px" }}
          type='number'
          placeholder='Enter selected token amount'
          onChange={(e) => onChangeERC20Amount(e.target.value)}
        ></Input>

        <Button
          onClick={handleAddToken}
          style={{ marginTop: "8px", marginLeft: "8px" }}
        >
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
