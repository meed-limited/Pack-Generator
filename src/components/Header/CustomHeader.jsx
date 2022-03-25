import { Link } from "react-router-dom";
import MenuItems from "components/Header/components/MenuItems";
import Chains from "components/Chains/Chains";
import NativeBalance from "components/Header/components/NativeBalance";
import Account from "components/Account/Account";
import headerBackground from "../../assets/headerBackground.jpg";
import PG_Logo from "../../assets/PG_Logo.png";
import { Header } from "antd/lib/layout/layout";

const styles = {
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
  }
};

const CustomHeader = () => {
  return (
    <Header style={styles.header}>
      <Link to='/Home'>
        <Logo />
      </Link>
      <MenuItems />

      <div style={styles.headerRight}>
        <Chains />
        <NativeBalance />
        <Account />
      </div>
    </Header>
  );
};

export const Logo = () => (
  <div style={{ width: "260px" }}>
    <img src={PG_Logo} alt='PG_Logo' />
  </div>
);

export default CustomHeader;
