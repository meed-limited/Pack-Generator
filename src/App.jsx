import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect, Link } from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
import NFTBalance from "components/NFTBalance";
import NFTMarketplace from "components/NFTMarketplace";
import { Menu, Layout, AutoComplete } from "antd";
//import SearchCollections from "components/SearchCollections";
import "antd/dist/antd.css";
import NativeBalance from "components/NativeBalance";
import "./style.css";
import Text from "antd/lib/typography/Text";
import NFTTransactions from "components/NFTTransactions";
import BatchBundle from "components/BatchBundles";
//import BatchMinter from "components/BatchMinter";
import Home from "components/Home";
import background from "./assets/background.jpg";
import lepriconLogoWhite from "./assets/lepriconLogoWhite.png";
import headerBackground from "./assets/headerBackground.jpg";
import footerBackground from "./assets/footerBackground.jpg";

const { Header, Footer } = Layout;

const styles = {
  layout: {
    backgroundImage: `url(${background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "100vh",
    overflow: "auto"
  },
  pageContent: {
    //minHeight: "100vh",
    //flexDirection: "column",
    justifyContent: "top",
    flex: "auto",
    width: "60%",
    height: "fit-content",
    //display: "flex",

    fontFamily: "Sora, sans-serif",
    margin: "auto",
    marginTop: "75px",
    marginBottom: "100px"
    //transform: "scale(80%)"
  },
  header: {
    backgroundImage: `url(${headerBackground})`,
    //backgroundPosition: "center",
    backgroundSize: "cover",
    //backgroundRepeat: "no-repeat",
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
    fontSize: "15px",
    paddingTop: "10px",
    fontWeight: "500"
  },
  footer: {
    backgroundImage: `url(${footerBackground})`,
    backgroundSize: "cover",
    height: "70px",
    //borderTop: "2px solid rgba(0, 0, 0, 0.06)",
    textAlign: "center",
    marginTop: "30px",
    position: "fixed",
    width: "100%",
    bottom: "0",
    backgroundColor: "transparent"
  }
};
const App = () => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const [inputValue, setInputValue] = useState("explore");

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
          {/* <SearchCollections setInputValue={setInputValue} /> */}
          <Menu
            mode='horizontal'
            style={{
              display: "flex",
              fontSize: "13px",
              fontWeight: "400",
              letterSpacing: "1px",
              color: "white !important",
              borderBottom: "none",
              justifyContent: "center",
              margin: "auto",
              width: "100%",
              paddingTop: "10px",
              backgroundColor: "transparent"
            }}
            defaultSelectedKeys={["/Home"]}
            defaultOpenKeys={["/Home"]}
          >
            {/* <Menu.Item key='batchMinter'>
              <NavLink to='/BatchMinter'>Minter</NavLink>
            </Menu.Item> */}
            <Menu.Item key='batchBundle'>
              <NavLink to='/Bundles'>Bundles</NavLink>
            </Menu.Item>
            <Menu.Item key='nftMarket' onClick={() => setInputValue("explore")}>
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
            {/* <Route exact path='/BatchMinter'>
              <BatchMinter />
            </Route> */}
            <Route exact path='/Bundles'>
              <BatchBundle />
            </Route>
            <Route exact path='/MarketPlace'>
              <NFTMarketplace inputValue={inputValue} setInputValue={setInputValue} />
            </Route>
            <Route exact path='/YourNFTs'>
              <NFTBalance />
            </Route>
            <Route exact path='/Transactions'>
              <NFTTransactions />
            </Route>
          </Switch>
          <Redirect to='/Home' />
        </div>
      </Router>
      <Footer style={styles.footer}>
        <Text style={{ display: "block" }}>
          Lepricon Website |{" "}
          <a href='https://lepricon.io/' target='_blank' rel='noopener noreferrer'>
            Lepricon.io
          </a>
        </Text>
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <img
    style={{ width: "1.25in", maxWidth: "none", margin: "30px", paddingTop: "5px" }}
    src={lepriconLogoWhite}
    alt='LepriconLogo'
  />
);

export default App;
