import { useMoralis } from "react-moralis";
import styles from "components/Pages/Pack/styles";

const AccountVerification = ({ param }) => {
  const { isAuthenticated } = useMoralis();

  const switchMessageToDisplay = () => {
    switch (param) {
      case "pack":
        return "Connect your wallet to start using the Pack-Generator!";
      case "marketplace":
        return "Connect your wallet to browse through the Marketplace.";
      case "yourNfts":
        return "Connect your wallet to display your NFTs.";
      case "transactions":
        return "Connect your wallet to show your Transactions History.";
      default:
        return "Connect your wallet to start!";
    }
  };

  return (
    <>
      {!isAuthenticated && (
        <>
          <div style={styles.transparentContainerNotconnected}>
            <p style={{ textAlign: "center" }}>{switchMessageToDisplay()}</p>
          </div>
          <div style={{ marginBottom: "30px" }}> </div>
        </>
      )}
    </>
  );
};

export default AccountVerification;
