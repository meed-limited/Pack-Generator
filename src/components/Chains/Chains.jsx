import { useEffect, useState } from "react";
import useChain from "hooks/useChain";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { PolygonLogo, ETHLogo, LeprichainLogo } from "./Logos";
import { useMoralis } from "react-moralis";
//import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";

/*eslint no-dupe-keys: "Off"*/
const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    color: "white",
    padding: "0 10px",
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
    border: "0",
    borderRadius: "12px"
  }
};

export const menuItems = [
  {
    key: "0x1",
    value: "Ethereum",
    icon: <ETHLogo />
  },
  // {
  //   key: "0x539",
  //   value: "Local Chain",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x3",
  //   value: "Ropsten Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x4",
  //   value: "Rinkeby Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x2a",
  //   value: "Kovan Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x5",
  //   value: "Goerli Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x38",
  //   value: "Binance",
  //   icon: <BSCLogo />,
  // },
  // {
  //   key: "0x61",
  //   value: "Smart Chain Testnet",
  //   icon: <BSCLogo />,
  // },
  {
    key: "0x89",
    value: "Polygon",
    icon: <PolygonLogo />
  },
  {
    key: "0x13881",
    value: "Mumbai",
    icon: <PolygonLogo />
  }
  // {
  //   key: "0xa86a",
  //   value: "Avalanche",
  //   icon: <AvaxLogo />,
  // },
  // {
  //   key: "0xc271",
  //   value: "Leprichain",
  //   icon: <LeprichainLogo />,
  // },
];

function Chains() {
  const { switchNetwork } = useChain();
  const { chainId } = useMoralis();
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

  const menu = (
    <Menu onClick={handleMenuClick}>
      {menuItems?.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
          <span style={{ marginLeft: "5px" }}>{item.value}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Button key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}>
          <span style={{ marginLeft: "5px" }}>{selected?.value}</span>
          <DownOutlined />
        </Button>
      </Dropdown>
    </>
  );
}

export default Chains;
