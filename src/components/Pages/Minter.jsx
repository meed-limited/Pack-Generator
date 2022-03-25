import { Input } from "antd";
import React, { useState } from "react";
//import { useMoralis, useMoralisQuery } from "react-moralis";
import styles from "./Pack/styles";

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
    <div style={styles.content}>
    
      <div style={styles.transparentContainer}>
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

        <>
          {nftName} {nftDescription} {properties.attribut} {properties.value}
        </>

        <label style={styles.label}>Select your files</label>
        <Input type='file' name='myfile'></Input>
      </div>
    
    </div>
  );
};

export default BatchMinter;
