import { Button } from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import styles from "./styles";

const Uploader = ({ getIpfsHash }) => {
  const { Moralis } = useMoralis();
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setIsSelected(true);
  };

  async function handleSubmission() {
    if (selectedFile) {
      const file = new Moralis.File(selectedFile.name, selectedFile);
      await file.saveIPFS();
      const data = file.hash();
      getIpfsHash(data);
    }
  }

  return (
    <div style={styles.uploadBox}>
      <input type='file' name='file' className='ant-input' onChange={handleChange} />
      {isSelected ? (
        <div>
          <p style={{ margin: "8px" }}>Filename: {selectedFile.name}</p>
        </div>
      ) : (
        <p style={{ margin: "8px" }}>Select a JSON file for the Batch-Bundle</p>
      )}
      <div>
        <Button type='primary' shape='round' size='large' style={ styles.resetButton } onClick={handleSubmission}>
          SUBMIT
        </Button>
      </div>
    </div>
  );
};

export default Uploader;
