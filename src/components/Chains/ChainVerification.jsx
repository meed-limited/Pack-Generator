import { useMoralis } from "react-moralis";
import styles from "../Pages/Pack/styles";
import { menuItems } from "./Chains"


const ChainVerification = () => {
    const { chainId, isAuthenticated } = useMoralis()
    const onSupportedChain = menuItems?.filter(item => item.key === chainId).length > 0


    return (
        <>
            {isAuthenticated && !onSupportedChain && (
                <div style={styles.transparentContainerNotconnected}>
                <p style={{ textAlign: "center" }}>This chain is not supported, please select a different chain</p>
                </div>
            )}
        </>
    )
};

export default ChainVerification