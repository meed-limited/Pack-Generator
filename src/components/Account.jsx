import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "./Blockie";
import { Button, Card, Modal } from "antd";
import { useState } from "react";
import Address from "./Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import buttonImg from "assets/buttonImg.svg"

/*eslint no-dupe-keys: "Off"*/
const styles = {
  account: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    padding: "5px",
    backgroundColor: "transparent",
    background: "rgba(240, 248, 255, 0.10)",
    background: "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background: "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background: "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    justifyContent: "center",
    width: "100%",
    borderRadius: "12px",
    border: "0",
    cursor: "pointer",
  },
  text: {
    color: "white"
  },
  disconnectButton: {
    width: "100%",
    margin: "auto",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "none",
    borderRadius: "25px",
    height: "50px",
    fontSize: "20px",
    marginTop: "15px",
    color: "white",
  }
};

function Account() {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const { walletAddress, chainId } = useMoralisDapp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={styles.account} onClick={() => authenticate({ signingMessage: "Welcome to Lepricon Pack!" })}>
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        <p style={{ marginRight: "5px", ...styles.text }}>{getEllipsisTxt(walletAddress, 6)}</p>
        <Blockie currentWallet scale={3} />
      </div>
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500"
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width='400px'
      >
        Account
        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
          <Address avatar='left' size={6} copyable style={{ fontSize: "20px" }} />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a href={`${getExplorer(chainId)}/address/${walletAddress}`} target='_blank' rel='noreferrer' style={{ color: "#dbff18"}}>
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>
        <Button
          // size='large'
          // type='primary'
          // style={{
          //   width: "100%",
          //   marginTop: "10px",
          //   borderRadius: "0.5rem",
          //   fontSize: "16px",
          //   fontWeight: "500",
          // }}
          style={styles.disconnectButton}
          onClick={() => {
            logout();
            setIsModalVisible(false);
          }}
        >
          Disconnect Wallet
        </Button>
      </Modal>
    </>
  );
}

export default Account;
