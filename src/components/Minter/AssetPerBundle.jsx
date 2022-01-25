import { Button } from "antd";
import { useState } from "react/cjs/react.development";
import { getNativeByChain } from "../../helpers/networks";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import ERC20Modal from "./ERC20Modal";
import styles from "./styles";

const AssetPerBundle = ({ getAssetValues }) => {
  const { chainId } = useMoralisDapp();
  const nativeName = getNativeByChain(chainId);
  const [isAssetModalVisible, setIsAssetModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [ethAmount, setEthAmount] = useState(0);
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
    setConfirmLoading(true);
    setIsAssetModalVisible(false);
    setConfirmLoading(false);
    getAssetValues(eth, selectedItems);
  };

  return (
    <div>
      <Button type='primary' style={{ width: "70%", margin: "30px" }} onClick={showAssetModal}>
        Assets per bundle
      </Button>
      <ERC20Modal
        isAssetModalVisible={isAssetModalVisible}
        handleAssetOk={handleAssetOk}
        confirmLoading={confirmLoading}
        handleAssetCancel={handleAssetCancel}
      />

      <div style={{ color: "white", fontSize: "16px" }}>
        <p>ETH to Bundle: </p>
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
};

export default AssetPerBundle;
