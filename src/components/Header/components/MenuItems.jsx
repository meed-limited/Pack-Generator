import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const styles = {
  menuItems: {
    backgroundColor: "transparent",
    display: "flex",
    width: "100%",
    justifyContent: "center",
    paddingTop: "10px",
    borderBottom: "none",
    fontSize: "15px",
    color: "white"
  }
};

function MenuItems({ isAdminPaneOpen, setIsAdminPaneOpen }) {
  const [current, setCurrent] = useState("/");

  const onClick = (e) => {
    if (isAdminPaneOpen) {
      setIsAdminPaneOpen(false);
    }
    setCurrent(e.key);
  };

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label
    };
  }

  const menuItems = [
    {
      key: "sub1",
      label: "Pack",
      children: [
        {
          type: "group",
          children: [
            getItem(<NavLink to='/Pack/SinglePack'>Single Pack</NavLink>, "SinglePack"),
            getItem(<NavLink to='/Pack/BatchPacks'>Batch Packs</NavLink>, "BatchPacks"),
            getItem(<NavLink to='/Pack/ClaimPack'>Claim Pack</NavLink>, "ClaimPack")
          ]
        }
      ]
    },
    getItem(<NavLink to='/MarketPlace'>MarketPlace</NavLink>, "nftMarket"),
    getItem(<NavLink to='/YourNFTs'>Your NFTs</NavLink>, "nft"),
    getItem(<NavLink to='/Transactions'>Transactions</NavLink>, "transactions"),
    {
      key: "documentation",
      label: "Support",
      children: [
        {
          type: "group",
          children: [
            getItem(
              <a href='https://lepricon.gitbook.io/pack-generator/' target='_blank' rel='noopener noreferrer'>
                Documentation / FAQ
              </a>,
              "docLink"
            ),

            getItem(
              <a
                href='https://techdev2021.atlassian.net/servicedesk/customer/portal/6'
                target='_blank'
                rel='noopener noreferrer'
              >
                Contact / Repport an issue
              </a>,
              "contactLink"
            )
          ]
        }
      ]
    }
  ];

  return (
    <>
      <Menu
        onClick={onClick}
        mode='horizontal'
        items={menuItems}
        selectedKeys={[current]}
        defaultOpenKeys={["/"]}
        style={styles.menuItems}
      />
    </>
  );
}

export default MenuItems;
