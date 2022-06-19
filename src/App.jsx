import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router";
import { useMoralis } from "react-moralis";
import { useUserData } from "userContext/UserContextProvider";
import AdminPane from "components/AdminPane";
import NoMobile from "components/NoMobile";
import CustomHeader from "components/Header/CustomHeader";
import { Home, Pack, Marketplace, YourNFTs, Transactions } from "components/Pages";
import Community from "components/CommunityItems";
import { getAdminAddress } from "helpers/contractCalls/readCall";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./style.css";
import background from "./assets/background.jpg";
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
  const { account, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const { assemblyAddress } = useUserData();
  const [isAdminPaneOpen, setIsAdminPaneOpen] = useState(false);
  const [adminAddress, setAdminAddress] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
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

  useEffect(() => {
    const launchApp = async () => {
      if (isWeb3Enabled) {
        const admin = await getAdminAddress(assemblyAddress);
        setAdminAddress(admin);
        setIsAdminPaneOpen(false);
      }
    };
    launchApp();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, account]);

  useEffect(() => {
    if (adminAddress) {
      const bool = account?.toLowerCase() === adminAddress?.toLowerCase() ? true : false;
      setIsAdmin(bool);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAddress, account]);

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
