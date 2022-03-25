import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
const { SubMenu } = Menu;

const styles = {
  menuItems: {
    display: "flex",
    fontSize: "15px",
    letterSpacing: "0.7px",
    borderBottom: "none",
    justifyContent: "center",
    margin: "auto",
    paddingTop: "10px",
    backgroundColor: "transparent"
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
      </Menu>
    </>
  );
}

export default MenuItems;
