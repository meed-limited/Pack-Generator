import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { getNativeByChain } from "../../helpers/networks";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import ModalERC20 from "./ModalERC20";
import styles from "./styles";

const AssetPerBundle = forwardRef(({ getAssetValues }, ref) => {
  const { chainId } = useMoralisDapp();
  const nativeName = getNativeByChain(chainId);
  const [isModalNFTVisible, setIsModalNFTVisible] = useState(false);
  const [ethAmount, setEthAmount] = useState();
  const [selectedTokens, setSelectedTokens] = useState([]);

  const showModalERC20 = () => {
    setIsModalNFTVisible(true);
  };

  const handleAssetCancel = () => {
    setIsModalNFTVisible(false);
  };

  const handleAssetOk = (eth, selectedItems) => {
    setEthAmount(eth);
    setSelectedTokens(selectedItems);
    setIsModalNFTVisible(false);
    getAssetValues(eth, selectedItems);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      setEthAmount();
      setSelectedTokens([]);
      getAssetValues(null, []);
    }
  }));

  return (
    <div>
      <Button type='primary' shape='round' style={styles.selectButton} onClick={showModalERC20}>
        ASSETS TO BUNDLE
      </Button>
      <Tooltip
        title="Select all the assets (Native and/or ERC20) that you'd like to add to the bundle(s)."
        style={{ position: "absolute", top: "35px", right: "80px" }}
      >
        <QuestionCircleOutlined
          style={{ color: "white", paddingLeft: "15px", paddingBottom: "40px", transform: "scale(0.8)" }}
        />
      </Tooltip>
      <ModalERC20
        isModalNFTVisible={isModalNFTVisible}
        handleAssetOk={handleAssetOk}
        handleAssetCancel={handleAssetCancel}
      />

      <div style={{ color: "white", fontSize: "16px" }}>
        <p style={{ marginBottom: "10px" }}>{nativeName} to Bundle: </p>
        {ethAmount && ethAmount > 0 && (
          <p key={`${ethAmount}`} style={styles.displayAssets}>
            {ethAmount} {nativeName}
          </p>
        )}
        <div>
          <p style={{ marginTop: "30px", marginBottom: "10px" }}>Tokens to bundle:</p>
          {selectedTokens &&
            selectedTokens.length > 0 &&
            selectedTokens.map((selectedToken, key) => (
              <div style={styles.displayAssets} key={`${selectedToken.value} - ${selectedToken.data.symbol}`}>
                <p style={{ marginBottom: "5px" }}>{`${selectedToken.value} ${selectedToken.data.symbol}`}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});

export default AssetPerBundle;
