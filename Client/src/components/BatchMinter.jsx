import { Input } from "antd";
import React, { useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Flex } from "uikit/Flex/Flex";

const styles = {
  h2: {
    fontSize: "30px",
    color: "#f1356d",
    marginBottom: "50px"
  },
  container: {
    display: "grid",
    opacity: "0.8",
    borderRadius: "8px",
    backgroundColor: "black",
    paddingTop: "50px",
    paddingBottom: "50px",
    fontSize: "18px",
    color: "white"
  },
  label: {
    display: "block",
    textAlign: "center"
  },
  input: {
    width: "60%",
    margin: "auto",
    marginBottom: "30px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  input2: {
    width: "60%",
    margin: "auto",
    marginBottom: "10px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  textarea: {
    width: "60%",
    margin: "auto",
    marginBottom: "30px",
    display: "block"
  },
  select: {
    width: "100%",
    padding: "6px 10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    display: "block"
  },
  mintButton: {
    marginTop: "30px",
    background: "#f1356d",
    color: "#fff",
    border: "0",
    padding: "20px",
    fontSize: "20px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  modalTitle: {
    padding: "10px",
    textAlign: "center",
    fontSize: "25px"
  }
};

const BatchMinter = () => {
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftRarity, setNftRarity] = useState("");
  const [properties, setProperties] = useState({ attribut: "", value: "" });

  const handleChange = (field) => {
    return (e) =>
      setProperties((properties) => ({
        ...properties,
        [field]: e.target.value
      }));
  };

  return (
    <Flex>
      <h2 style={styles.h2}>Batch as many NFTs as you want in one go !</h2>
      <div style={styles.container}>
        <label style={styles.label}>Name</label>
        <Input style={styles.input} type='text' required value={nftName} onChange={(e) => setNftName(e.target.value)} />
        <label style={styles.label}>Description</label>
        <textarea
          style={styles.textarea}
          required
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
        ></textarea>
        <label style={styles.label}>Rarity</label>
        <Input
          style={styles.input}
          type='number'
          required
          value={nftRarity}
          onChange={(e) => setNftRarity(e.target.value)}
        />
        <label style={styles.label}>Properties</label>
        <Input style={styles.input2} type='text' value={properties.attribut} onChange={handleChange("attribut")} />
        <Input style={styles.input} type='text' value={properties.value} onChange={handleChange("value")} />

        <div>
          {nftName} {nftDescription} {properties.attribut} {properties.value}
        </div>

        <label style={styles.label}>Select your files</label>
        <Input type='file' name='myfile'></Input>
      </div>
    </Flex>
  );
};

export default BatchMinter;
