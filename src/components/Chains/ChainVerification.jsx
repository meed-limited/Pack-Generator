import { useMoralis } from "react-moralis";
import { useUserData } from "userContext/UserContextProvider";
import styles from "../Pages/Pack/styles";

const ChainVerification = () => {
  const { isAuthenticated } = useMoralis();
  const { onSupportedChain } = useUserData();

  return (
    <>
      {isAuthenticated && !onSupportedChain && (
        <div style={styles.transparentContainerNotconnected}>
          <p style={{ textAlign: "center" }}>This chain is not supported, please select a different chain</p>
        </div>
      )}
    </>
  );
};

export default ChainVerification;
