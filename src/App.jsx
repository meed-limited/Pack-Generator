import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect, Link } from "react-router-dom";
import { useMoralis } from "react-moralis";
import Home from "components/Pages/Home";
//import BatchMinter from "components/BatchMinter";
import Pack from "components/Pages/Pack/Pack";
import Marketplace from "components/Pages/Marketplace";
import YourNFTs from "components/Pages/YourNFT/YourNFTs";
import Transactions from "components/Pages/Transactions";
import Chains from "components/Chains";
import NativeBalance from "components/NativeBalance";
import Account from "components/Account/Account";
import Text from "antd/lib/typography/Text";
import background from "./assets/background.jpg";
import headerBackground from "./assets/headerBackground.jpg";
import footerBackground from "./assets/footerBackground.jpg";
import PG_Logo from "./assets/PG_Logo.png";
import LepriconLogo_Black from "./assets/LepriconLogo_Black.png";
import discord from "./assets/discord.png";
import telegram from "./assets/telegram.png";
import { Menu, Layout } from "antd";
import { FacebookOutlined, LinkedinOutlined, TwitterOutlined } from "@ant-design/icons";
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
        <Text style={{ display: "flex", color: "white", float: "left" }}>
          Powered by |
          <a href='https://lepricon.io/' target='_blank' rel='noopener noreferrer'>
            <div style={{ width: "90px", paddingLeft: "10px" }}>
              <img src={LepriconLogo_Black} alt='LepriconLogo_Black' />
            </div>
          </a>
        </Text>
        <Text style={{ display: "flex", color: "white", float: "right" }}>
          Community |
          <a href='https://twitter.com/lepriconio' target='_blank' rel='noopener noreferrer'>
            <div style={{ padding: "0 10px 0 15px" }}>
              <TwitterOutlined style={{ color: "white" }} />
            </div>
          </a>
          <a href='http://discord.gg/lepricon' target='_blank' rel='noopener noreferrer'>
            <div style={{ padding: "4px 10px 0 10px" }}>
              <img src={discord} alt='discord' />
            </div>
          </a>
          <a href='https://t.me/lepriconio' target='_blank' rel='noopener noreferrer'>
            <div style={{ padding: "4px 10px 0 10px" }}>
              <img src={telegram} alt='telegram' />
            </div>
          </a>
          <a href='https://www.facebook.com/lepriconio' target='_blank' rel='noopener noreferrer'>
            <div style={{ padding: "0 10px" }}>
              <FacebookOutlined style={{ color: "white" }} />
            </div>
          </a>
          <a href='https://sc.linkedin.com/company/lepricon-io' target='_blank' rel='noopener noreferrer'>
            <div style={{ padding: "0 10px" }}>
              <LinkedinOutlined style={{ color: "white" }} />
            </div>
          </a>
        </Text>
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
