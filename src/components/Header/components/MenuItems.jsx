import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
const { SubMenu } = Menu;

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

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <>
      <Menu mode='horizontal' style={styles.menuItems} defaultSelectedKeys={[pathname]} defaultOpenKeys={["/Home"]}>
        <SubMenu key='SubMenu' title='Pack'>
          {/* <Menu.Item key='batchMinter'>
              <NavLink to='/BatchMinter'>Minter</NavLink>
            </Menu.Item> */}
          <Menu.Item key='SinglePack'>
            <NavLink to='/Pack/SinglePack'>Single Pack</NavLink>
          </Menu.Item>
          <Menu.Item key='BatchPacks'>
            <NavLink to='/Pack/BatchPacks'>Batch Packs</NavLink>
          </Menu.Item>
          <Menu.Item key='ClaimPack'>
            <NavLink to='/Pack/ClaimPack'>Claim Pack</NavLink>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key='nftMarket'>
          <NavLink to='/MarketPlace'>MarketPlace</NavLink>
        </Menu.Item>
        <Menu.Item key='nft'>
          <NavLink to='/YourNFTs'>Your NFTs</NavLink>
        </Menu.Item>
        <Menu.Item key='transactions'>
          <NavLink to='/Transactions'>Transactions</NavLink>
        </Menu.Item>
        <Menu.Item
          onClick={() => window.open("https://lepricon.gitbook.io/pack-generator/", "_blank", "noopener noreferrer")}
        >
          Support
        </Menu.Item>
      </Menu>
    </>
  );
}

export default MenuItems;
