import React from "react";
import pack from "../assets/Home/pack.png";
import TEXT_LEPLOGO from "../../src/assets/Home/TEXT_LEPLOGO.svg";
import { Button } from "antd";
import buttonImg from "assets/buttonImg.svg";
import { Link } from "react-router-dom";

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "60% 40%",
    width: "100vw",
    height: "auto",
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
    //marginTop: "10px"
  },
  title: {
    //position: "absolute",
    //top: "0px",
    marginTop: "20px",
    letterSpacing: "6px",
    color: "white",
    fontSize: "40px",
    fontWeight: "370"
  },
  text: {
    position: "absolute",
    bottom: "60px",
    color: "white",
    fontSize: "15px",
    fontWeight: "350",
    letterSpacing: "1px",
    whiteSpace: "pre-wrap"
  },
  imageDLC: {
    transform: "scale(1)",
    marginTop: "0",
    margin: "auto",
    paddingTop: "0",
    width: "100%"
  }
};

const Home = () => {
  const text = `Pack and unpack NFTs with other digital assets. \nMintone or mint a batch. \nIt's like DLC for blockchain.`;

  return (
    <div style={styles.grid}>
      <div>
        <div style={styles.title}>PACK GENERATOR</div>
        <div style={{ position: "relative", textAlign: "left", height: "fit-content" }}>
          <img src={TEXT_LEPLOGO} alt='' position='relative' style={styles.imageDLC} />

          <div style={styles.text}>{text}</div>
        </div>

        <Link to='/Bundles'>
          <Button ghost style={styles.homeButton}>
            Get Started
          </Button>
        </Link>
      </div>

      <div>
        <img
          src={pack}
          alt=''
          style={{ transform: "scale(1.2)", margin: "auto", paddingTop: "70px", paddingLeft: "80px" }}
        />
      </div>
    </div>
  );
};

export default Home;
