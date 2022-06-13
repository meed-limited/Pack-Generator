import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import AdminPane from "components/AdminPane";
import NoMobile from "components/NoMobile";
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
    height: "100vh",
    fontFamily: "Sora, sans-serif"
  },
  pageContent: {
    justifyContent: "top",
    width: "80%",
    height: "81vh",
    margin: "80px auto 70px auto",
    overflow: "auto",
    overflowX: "hidden"
  },
  footer: {
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
  const [width, setWidth] = useState(window.innerWidth);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  const getAdminAddress = async () => {
    const readOptions = {
      contractAddress: contractAddress,
      functionName: "owner",
      abi: assemblyABIJson
    };

    try {
      const owner = await Moralis.executeFunction(readOptions);
      return owner;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const launchApp = async () => {
      if (isWeb3Enabled) {
        const admin = await getAdminAddress();
        setAdminAddress(admin);
        setIsAdminPaneOpen(false);
      }
    };
    launchApp();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, account]);

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout style={styles.layout}>
      {isMobile && <NoMobile />}
      {!isMobile && (
        <>
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
                  <Routes>
                    {/* <Route exact path='BatchMinter'>
                      <BatchMinter />
                    </Route> */}
                    <Route exact path='/Pack/SinglePack' element={<Pack paneToShow={"single"} />} />
                    <Route exact path='/Pack/BatchPacks' element={<Pack paneToShow={"batch"} />} />
                    <Route exact path='/Pack/ClaimPack' element={<Pack paneToShow={"claim"} />} />
                    <Route exact path='/MarketPlace' element={<Marketplace />} />
                    <Route exact path='/YourNFTs' element={<YourNFTs />} />
                    <Route exact path='/Transactions' element={<Transactions />} />
                    <Route exact path='/' element={<Home />} />
                    <Route path='*' element={<Navigate to='/' />} />
                  </Routes>
                </>
              )}
            </div>
          </Router>
          <Footer style={styles.footer}>
            <Community />
          </Footer>
        </>
      )}
    </Layout>
  );
};

export default App;
