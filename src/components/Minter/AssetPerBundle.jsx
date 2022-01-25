import { Button } from "antd";
import { forwardRef, useImperativeHandle } from "react";
import { useState } from "react/cjs/react.development";
import { getNativeByChain } from "../../helpers/networks";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import ERC20Modal from "./ERC20Modal";
import styles from "./styles";

const AssetPerBundle = forwardRef(({ getAssetValues }, ref) => {
  const { chainId } = useMoralisDapp();
  const nativeName = getNativeByChain(chainId);
  const [isAssetModalVisible, setIsAssetModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [ethAmount, setEthAmount] = useState();
  const [selectedTokens, setSelectedTokens] = useState([]);

  const showAssetModal = () => {
    setIsAssetModalVisible(true);
  };

  const handleAssetCancel = () => {
    setIsAssetModalVisible(false);
  };

  const handleAssetOk = (eth, selectedItems) => {
    setEthAmount(eth);
    setSelectedTokens(selectedItems);
    setIsAssetModalVisible(false);
    getAssetValues(eth, selectedItems);
  };

  useImperativeHandle(ref, () => ({
    reset () {
      setEthAmount();
      setSelectedTokens([]);
      getAssetValues(null, []);
    }
  }))

  return (
    <div>
      <Button type='primary' shape='round' style={{ width: "70%", margin: "30px" }} onClick={showAssetModal}>
        Assets per bundle
      </Button>
      <ERC20Modal
        isAssetModalVisible={isAssetModalVisible}
        handleAssetOk={handleAssetOk}
        confirmLoading={confirmLoading}
        handleAssetCancel={handleAssetCancel}
      />

      <div style={{ color: "white", fontSize: "16px" }}>
        <p>{nativeName} to Bundle: </p>
        {ethAmount && ethAmount > 0 && (
          <p key={`${ethAmount}`} style={styles.displayAssets}>
            {ethAmount} {nativeName}
          </p>
        )}
        <div>
          <p style={{ marginTop: "30px" }}>Tokens to bundle:</p>
          {selectedTokens &&
            selectedTokens.length > 0 &&
            selectedTokens.map((selectedToken, key) => (
              <div style={styles.displayAssets} key={`${selectedToken.data.symbol} - ${selectedToken.value}`}>
                <p>{`${selectedToken.data.symbol}: ${selectedToken.value}`}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});

export default AssetPerBundle;
