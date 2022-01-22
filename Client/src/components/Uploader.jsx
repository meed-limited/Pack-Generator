import { Button } from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";

const styles = {
  container: {
    display: "flex-grid",
    marginTop: "40px",
    margin: "auto",
    padding: "15px",
    backgroundColor: "white",
    borderRadius: "8px",
    opacity: "0.9",
    color: "#f1356d",
    marginBottom: "50px",
    fontSize: "18px"
  },
  submitButton: {
    margin: "auto",
    width: "200px",
    height: "auto",
    background: "#f1356d",
    color: "#fff",
    border: "0",
    padding: "15px",
    fontSize: "15px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

const Uploader = ({ getIpfsHash }) => {
  const { Moralis, isInitialized, ...rest } = useMoralis();
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setIsSelected(true);
  };

  async function handleSubmission() {
    const file = new Moralis.File(selectedFile.name, selectedFile);
    await file.saveIPFS();
    const data = file.hash();
    getIpfsHash(data);
  }

  return (
    <div style={styles.container}>
      <input type='file' name='file' onChange={handleChange} />
      {isSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
        </div>
      ) : (
        <p>Select a CSV file for the Batch-Bundle</p>
      )}
      <div>
        <Button style={styles.submitButton} onClick={handleSubmission}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Uploader;
