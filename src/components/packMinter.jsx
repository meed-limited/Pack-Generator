import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button } from "antd";
import { useNFTBalance } from "hooks/useNFTBalance";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import { useWeb3ExecuteFunction } from "react-moralis";
const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
  bundleMinter: {
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center",
  },
  label: {
    textAlign: "left",
    display: "block",
   },
//   mint h2 {
//     fontSize: 20px,
//     color: #f1356d,
//     marginBottom: 30px,
//   },
//   mint input, .mint textarea, .mint select {
//     width: 100%,
//     padding: 6px 10px,
//     margin: 10px 0,
//     border: 1px solid #ddd,
//     box-sizing: border-box,
//     display: block,
//   },
  mintButton: {
    background: "#f1356d",
    color: "#fff",
    border: "0",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};


const PackMinter =  () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [author, setAuthor] = useState('ETH Address');
    const [url, setURL] = useState('');
    const history = useHistory();
  
    const handleSubmit = (e) => {
    //   e.preventDefault();
    //   const nft = { url, title, body, author };
  
    //   fetch('http://localhost:8000/nfts/', {
    //     method: 'POST',
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(nft)
    //   }).then(() => {
    //     history.push('/');
    //   })
    }
  
    return (
      <div style={styles.bundleMinter}>
        <h2>Add all your NFTs features</h2>
        <form onSubmit={handleSubmit}>
        <label style={styles.label}>NFT URL:</label>
          <input 
            type="text" 
            required 
            value={url}
            onChange={(e) => setURL(e.target.value)}
          />
          <label style={styles.label}>NFT title:</label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label style={styles.label}>NFT body:</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
          <label style={styles.label}>NFT author:</label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            <option value="ETH-Address">ETH Address</option>
            <option value="collection-name">Collection Name</option>
          </select>
          <button style={styles.mintButton}>Mint NFTs</button>
        </form>
      </div>
    );
  }
   
  export default PackMinter;