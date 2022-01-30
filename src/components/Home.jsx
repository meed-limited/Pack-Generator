import React from "react";
import pack from "../assets/Home/pack.png";
import TEXT_LEPLOGO from "../../src/assets/Home/TEXT_LEPLOGO.svg";
import { Button } from "antd";
import buttonImg from "assets/buttonImg.svg";
import { Link } from "react-router-dom";

const styles = {
  homeButton: {
    width: "193px",
    margin: "auto",
    backgroundImage: `url(${buttonImg})`,
    backgroundSize: "cover",
    border: "none",
    borderRadius: "2px",
    height: "50px",
    fontSize: "20px",
    marginTop: "40px"
  }
};

const Home = () => {
  const text = `Pack and unpack NFTs with other digital assets. \nMintone or mint a batch. \nIt's like DLC for blockchain.`;
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "50% 50%", width: "100vw", height: "fit-content", paddingTop: "100px" }}
    >
      <div style={{ position: "relative", height: "auto" }}>
        <p style={{ letterSpacing: "6px", color: "white", fontSize: "45px", fontWeight: "370" }}>PACK GENERATOR</p>
        <img
          src={TEXT_LEPLOGO}
          alt=''
          position='relative'
          style={{
            transform: "scale(1)",
            marginTop: "0",
            margin: "auto",
            paddingTop: "0"
          }}
        />
        <p
          style={{
            color: "white",
            fontSize: "15px",
            fontWeight: "350",
            letterSpacing: "1px",
            whiteSpace: "pre-wrap"
          }}
        >
          {text}
        </p>
        <Link to='/Bundles'>
        <Button ghost style={styles.homeButton}>
          Get Started
        </Button>
        </Link>
      </div>

      <div>
        <img src={pack} alt='' style={{ transform: "scale(1.2)", margin: "auto", paddingTop: "70px" }} />
      </div>
    </div>
  );
};

export default Home;
