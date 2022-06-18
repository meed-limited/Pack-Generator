import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import MenuItems from "components/Header/components/MenuItems";
import Chains from "components/Chains/Chains";
import NativeBalance from "components/Header/components/NativeBalance";
import Account from "components/Account/Account";
import PG_Logo from "../../assets/PG_Logo.png";
import beta from "../../assets/beta.png";
import { Button } from "antd";
import { Header } from "antd/lib/layout/layout";

const styles = {
  header: {
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
  adminButton: {
    height: "40px",
    padding: "0 20px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    margin: "20px 20px",
    border: "none",
    background: "black",
    color: "white",
    fontFamily: "Sora, sans-serif"
  }
};

const CustomHeader = ({ isAdmin, isAdminPaneOpen, setIsAdminPaneOpen }) => {
  const { isAuthenticated } = useMoralis();

  useEffect(() => {}, [isAdmin, isAuthenticated]);

  const openAdminPane = () => {
    if (!isAdminPaneOpen) {
      setIsAdminPaneOpen(true);
    } else setIsAdminPaneOpen(false);
  };

  return (
    <Header style={styles.header}>
      <Link to='/Home'>
        <Logo />
      </Link>
      <MenuItems isAdminPaneOpen={isAdminPaneOpen} setIsAdminPaneOpen={setIsAdminPaneOpen} />

      <div style={styles.headerRight}>
        {isAuthenticated && isAdmin && (
          <div>
            <Button style={styles.adminButton} shape='round' onClick={openAdminPane}>
              Admin
            </Button>
          </div>
        )}
        <Chains />
        <NativeBalance />
        <Account />
      </div>
    </Header>
  );
};

export const Logo = () => (
  <div style={{ display: "flex", alignSelf: "center" }}>
    <div style={{ paddingTop: "0px", marginLeft: "-10px", width: "70px", height: "70px" }}>
      <img src={beta} alt='beta' />
    </div>
    <div style={{ paddingTop: "25px", width: "220px" }}>
      <img src={PG_Logo} alt='PG_Logo' />
    </div>
  </div>
);

export default CustomHeader;
