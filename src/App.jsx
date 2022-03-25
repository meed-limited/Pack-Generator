import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect, Link } from "react-router-dom";
import { useMoralis } from "react-moralis";
//import AdminPane from "./AdminPane";
import Home from "components/Pages/Home";
//import BatchMinter from "components/BatchMinter";
import Pack from "components/Pages/Pack/Pack";
import Marketplace from "components/Pages/Marketplace";
import YourNFTs from "components/Pages/YourNFT/YourNFTs";
import Transactions from "components/Pages/Transactions";
import Chains from "components/Chains";
import NativeBalance from "components/NativeBalance";
import Account from "components/Account/Account";
import Community from "components/Community";
import background from "./assets/background.jpg";
import headerBackground from "./assets/headerBackground.jpg";
import footerBackground from "./assets/footerBackground.jpg";
import PG_Logo from "./assets/PG_Logo.png";
import { Menu, Layout } from "antd";
import "antd/dist/antd.css";
import "./style.css";
const { SubMenu } = Menu;
const { Header, Footer } = Layout;

const styles = {
  layout: {
    backgroundImage: `url(${background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "95vh",
    overflow: "auto"
  },
  pageContent: {
    justifyContent: "top",
    width: "80%",
    fontFamily: "Sora, sans-serif",
    margin: "80px auto 20px auto"
  },
  header: {
    backgroundImage: `url(${headerBackground})`,
    backgroundSize: "cover",
    height: "70px",
    position: "fixed",
    zIndex: 1,
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Sora, sans-serif",
    padding: "0 10px"
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "500"
  },
  menuItems: {
    display: "flex",
    fontSize: "15px",
    letterSpacing: "0.7px",
    borderBottom: "none",
    justifyContent: "center",
    margin: "auto",
    paddingTop: "10px",
    backgroundColor: "transparent"
  },
  footer: {
    backgroundImage: `url(${footerBackground})`,
    backgroundSize: "cover",
    height: "70px",
    textAlign: "center",
    position: "fixed",
    width: "100%",
    bottom: "0",
    backgroundColor: "transparent"
  }
};
const App = () => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout style={styles.layout}>
      <Router>
        <Header style={styles.header}>
          <Link to='/Home'>
            <Logo />
          </Link>
          <Menu mode='horizontal' style={styles.menuItems} defaultSelectedKeys={["/Home"]} defaultOpenKeys={["/Home"]}>
            {/* <Menu.Item key='batchMinter'>
              <NavLink to='/BatchMinter'>Minter</NavLink>
            </Menu.Item> */}

            <SubMenu key='SubMenu' title='Pack'>
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

          <div style={styles.headerRight}>
            <Chains />
            <NativeBalance />
            <Account />
          </div>
        </Header>
        <div style={styles.pageContent}>
          <Switch>
            <Route path='/Home'>
              <Home />
            </Route>
            {/* <Route exact path='BatchMinter'>
              <BatchMinter />
            </Route> */}

            <Route exact path='/Pack/SinglePack'>
              <Pack paneToShow={"single"} />
            </Route>
            <Route exact path='/Pack/BatchPacks'>
              <Pack paneToShow={"batch"} />
            </Route>
            <Route exact path='/Pack/ClaimPack'>
              <Pack paneToShow={"claim"} />
            </Route>

            <Route exact path='/MarketPlace'>
              <Marketplace />
            </Route>
            <Route exact path='/YourNFTs'>
              <YourNFTs />
            </Route>
            <Route exact path='/Transactions'>
              <Transactions />
            </Route>
          </Switch>
          <Redirect to='/Home' />
        </div>
      </Router>
      <Footer style={styles.footer}>
        <Community />
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <div style={{ width: "260px" }}>
    <img src={PG_Logo} alt='PG_Logo' />
  </div>
);

export default App;
