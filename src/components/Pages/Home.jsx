import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import buttonImg from "assets/buttonImg.svg";
import Homepage_pack2 from "../../assets/Homepage_pack2.png";
import TEXT_LEPLOGO from "../../../src/assets/Home/TEXT_LEPLOGO.svg";

const styles = {
  grid: {
    display: "grid",
    width: "60vw",
    gridTemplateColumns: "60% 40%",
    marginLeft: "-80px",
    height: "-webkit-fill-available",
    paddingTop: "100px"
  },
  homeButton: {
    width: "193px",
    margin: "auto",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "none",
    borderRadius: "2px",
    height: "50px",
    fontSize: "20px",
  },
  title: {
    marginTop: "10px",
    letterSpacing: "6px",
    color: "white",
    fontSize: "35px",
    fontWeight: "370"
  },
  text: {
    position: "absolute",
    bottom: "30px",
    color: "white",
    fontSize: "15px",
    fontWeight: "350",
    letterSpacing: "1px",
    whiteSpace: "pre-wrap"
  },
  imageDLC: {
    margin: "auto",
    marginTop: "0",
    paddingTop: "0",
    width: "100%"
  }
};

const Home = () => {
  const text = `Pack and unpack NFTs with other digital assets. \nMint one or mint a batch. \nIt's like DLC for blockchain.`;

  return (
    <div style={styles.grid}>
      <div>
        <div style={styles.title}>PACK GENERATOR</div>
        <div style={{ position: "relative", textAlign: "left", height: "fit-content" }}>
          <img src={TEXT_LEPLOGO} alt='' position='relative' style={styles.imageDLC} />

          <div style={styles.text}>{text}</div>
        </div>

        <Link to='/Packs'>
          <Button ghost style={styles.homeButton}>
            Get Started
          </Button>
        </Link>
      </div>

      <div>
        <img
          src={Homepage_pack2}
          alt=''
          style={{ transform: "scale(2)", paddingTop: "30px", marginLeft: "80px" }}
        />
      </div>
    </div>
  );
};

export default Home;
