import { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import AdminPane from "components/AdminPane";
import CustomHeader from "components/Header/CustomHeader";
import Home from "components/Pages/Home";
//import BatchMinter from "components/BatchMinter";
import Pack from "components/Pages/Pack/Pack";
import Marketplace from "components/Pages/Marketplace";
import YourNFTs from "components/Pages/YourNFT/YourNFTs";
import Transactions from "components/Pages/Transactions";
import Community from "components/CommunityItems";
import { assemblyABI, getAssemblyAddress } from "./Constant/constant";
import background from "./assets/background.jpg";
import footerBackground from "./assets/footerBackground.jpg";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./style.css";
const { Footer } = Layout;

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
  const { account, chainId, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const contractAddress = getAssemblyAddress(chainId);
  const assemblyABIJson = JSON.parse(assemblyABI);
  const [isAdminPaneOpen, setIsAdminPaneOpen] = useState(false);
  const [adminAddress, setAdminAddress] = useState();
  const isAdmin = account?.toLowerCase() === adminAddress?.toLowerCase() ? true : false;

  const getAdminAddress = async () => {
    const readOptions = {
      contractAddress: contractAddress,
      functionName: "owner",
      abi: assemblyABIJson
    };

    try {
      const owner = await Moralis.executeFunction(readOptions);
      setAdminAddress(owner);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getAdminAddress();
      setIsAdminPaneOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, account]);

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout style={styles.layout}>
      <Router>
        <CustomHeader isAdmin={isAdmin} isAdminPaneOpen={isAdminPaneOpen} setIsAdminPaneOpen={setIsAdminPaneOpen} />
        <div style={styles.pageContent}>
          {isAdmin && isAdminPaneOpen && (
            <AdminPane
              adminAddress={adminAddress}
              setAdminAddress={setAdminAddress}
              setIsAdminPaneOpen={setIsAdminPaneOpen}
            />
          )}
          {!isAdminPaneOpen && (
            <>
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
            </>
          )}
        </div>
      </Router>
      <Footer style={styles.footer}>
        <Community />
      </Footer>
    </Layout>
  );
};

export default App;
