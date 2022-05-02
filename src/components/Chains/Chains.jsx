import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import useChain from "hooks/useChain";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { PolygonLogo, ETHLogo, BSCLogo } from "./Logos";
//import { AvaxLogo, PolygonLogo } from "./Logos";

/*eslint no-dupe-keys: "Off"*/
const styles = {
  item: {
    fontFamily: "Sora, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    backgroundColor: "transparent",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)"
  },
  button: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    border: "0",
    borderRadius: "12px"
  }
};

export const menuItems = [
  {
    key: "0x1",
    value: "Ethereum",
    icon: <ETHLogo />,
    label: "Ethereum"
  },
  // {
  //   key: "0x539",
  //   value: "Local Chain",
  //   icon: <ETHLogo />,
  //   label: "Local Chain"
  // },
  // {
  //   key: "0x3",
  //   value: "Ropsten Testnet",
  //   icon: <ETHLogo />,
  //   label: "Ropsten Testnet"
  // },
  // {
  //   key: "0x4",
  //   value: "Rinkeby Testnet",
  //   icon: <ETHLogo />,
  //   label: "Rinkeby Testnet"
  // },
  // {
  //   key: "0x2a",
  //   value: "Kovan Testnet",
  //   icon: <ETHLogo />,
  //   label: "Kovan Testnet"
  // },
  // {
  //   key: "0x5",
  //   value: "Goerli Testnet",
  //   icon: <ETHLogo />,
  //   label: "Goerli Testnet"
  // },
  {
    key: "0x38",
    value: "Binance",
    icon: <BSCLogo />,
    label: "Binance"
  },
  {
    key: "0x61",
    value: "Smart Chain Testnet",
    icon: <BSCLogo />,
    label: "Smart Chain Testnet"
  },
  {
    key: "0x89",
    value: "Polygon",
    icon: <PolygonLogo />,
    label: "Polygon"
  },
  {
    key: "0x13881",
    value: "Mumbai",
    icon: <PolygonLogo />,
    label: "Mumbai"
  }
  // {
  //   key: "0xa86a",
  //   value: "Avalanche",
  //   icon: <AvaxLogo />,
  //   label: "Avalanche"
  // },
  // {
  //   key: "0xa869",
  //   value: "Avalanche Testnet",
  //   icon: <AvaxLogo />,
  //   label: "Avalanche Testnet""
  // },
];

function Chains() {
  const { switchNetwork } = useChain();
  const { isAuthenticated, chainId } = useMoralis();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);
    switchNetwork(e.key);
  };

  const menu = <Menu onClick={handleMenuClick} items={menuItems} style={styles.item} />;

  if (!chainId || !isAuthenticated) return null;

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Button key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}>
          {!selected && <span style={{ marginLeft: "5px" }}>Select Chain</span>}
          {selected && <span style={{ marginLeft: "5px" }}>{selected?.value}</span>}
          <DownOutlined />
        </Button>
      </Dropdown>
    </>
  );
}

export default Chains;
