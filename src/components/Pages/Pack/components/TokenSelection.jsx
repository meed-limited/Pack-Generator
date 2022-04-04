/*eslint no-dupe-keys: "Off"*/
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNativeBalance } from "react-moralis";
import AssetSelector from "./AssetSelector";
import { Input, Button, InputNumber } from "antd";
import Text from "antd/lib/typography/Text";

const styles = {
  transparentContainerInside: {
    borderRadius: "15px",
    width: "80%",
    margin: "auto",
    paddingBlock: "40px 15px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "center",

  },
  transparentInput: {
    textAlign: "center",
    width: "300px",
    margin: "auto",
    color: "white",
    border: "none",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)"
  }
};

const TokenSelection = forwardRef(({ handleAssets }, ref) => {
  const [nativeAmount, setNativeAmount] = useState();
  const [tokenAmount, setTokenAmount] = useState();
  const [ERC20Tokens, setERC20Tokens] = useState([]);
  const [currentToken, setCurrentToken] = useState();
  const { data: balance, nativeToken } = useNativeBalance();

  const onChangeToken = (token) => {
    setCurrentToken({ ...currentToken, data: token });
  };

  const onChangeERC20Amount = (value) => {
    let max = (currentToken?.data.balance / ("1e" + 18)).toString();
    if (parseFloat(value) <= 0) {
      setTokenAmount(0);
      setCurrentToken({ ...currentToken, value: 0 });
    } else if (parseFloat(value) > parseFloat(max)) {
      setTokenAmount(parseFloat(max));
      setCurrentToken({ ...currentToken, value: parseFloat(max) });
    } else {
      setTokenAmount(parseFloat(value));
      setCurrentToken({ ...currentToken, value: parseFloat(value) });
    }
  };

  const handleAddToken = () => {
    const max = (currentToken.data.balance / ("1e" + 18)).toString();
    const cappedValue = currentToken.value < max ? currentToken.value : max;
    if (ERC20Tokens?.some((selectedToken) => selectedToken.data.token_address === currentToken.data.token_address)) {
      setERC20Tokens(
        ERC20Tokens?.map((tokenItem) =>
          tokenItem.data.token_address !== currentToken.data.token_address
            ? tokenItem
            : { data: currentToken.data, value: cappedValue }
        )
      );
    } else {
      setERC20Tokens(ERC20Tokens?.concat([{ ...currentToken, value: cappedValue }]));
    }
  };

  useEffect(() => {
    const native = nativeAmount === undefined ? 0 : nativeAmount;
    handleAssets(native, ERC20Tokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeAmount, ERC20Tokens]);

  useImperativeHandle(ref, () => ({
    reset() {
      setNativeAmount();
      setERC20Tokens([]);
      setCurrentToken(null);
      onChangeToken(null);
      setTokenAmount();
    }
  }));

  return (
    <div style={styles.transparentContainerInside}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text style={{ fontSize: "16px", marginBottom: "5px" }}>Amount of {nativeToken?.name} coins per pack:</Text>

        <InputNumber
          style={styles.transparentInput}
          type='number'
          step={0.01}
          min={0}
          max={balance?.balance / ("1e" + nativeToken?.decimals)}
          placeholder={`Enter ${nativeToken?.name} amount`}
          onChange={setNativeAmount}
          value={nativeAmount}
        ></InputNumber>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text style={{ marginTop: "60px", fontSize: "16px", marginBottom: "5px" }}>
          Amount of ERC20 Tokens per pack:
        </Text>
        <AssetSelector setAsset={onChangeToken} style={{ width: "300px", margin: "auto", marginBottom: "10px" }} />

        <div style={{ margin: "auto", marginBottom: "20px", width: "300px", alignItems: "center" }}>
          <Input
            style={styles.transparentInput}
            type='number'
            min='0'
            step={0.1}
            placeholder='Enter selected token amount'
            onChange={(e) => onChangeERC20Amount(parseFloat(e.target.value))}
            value={tokenAmount}
            disabled={!currentToken ? true : false}
          ></Input>
          <Button
            onClick={handleAddToken}
            disabled={!currentToken || currentToken.value <= 0 || currentToken.value === undefined ? true : false}
            style={{ marginTop: "8px" }}
          >
            Add
          </Button>
        </div>
      </div>

      <div style={{ width: "100", color: "white", fontSize: "14px", display: "flex", flexDirection: "column" }}>
        {ERC20Tokens &&
          ERC20Tokens.length > 0 &&
          ERC20Tokens?.map((token) => (
            <p key={token.data.symbol}>
              {token.data.symbol}: {token.value}
            </p>
          ))}
      </div>
      <div style={{ width: "100", display: "flex", justifyContent: "flex-end" }}></div>
    </div>
  );
});

export default TokenSelection;
