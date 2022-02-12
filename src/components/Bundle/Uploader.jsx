import { Button } from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { openNotification } from "../Notification";
import styles from "./styles";

const Uploader = ({ getIpfsHash, isFile }) => {
  const { Moralis } = useMoralis();
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setIsSelected(true);
  };

  const handleSubmission = async () => {
      if (selectedFile) {
        isFile(true);
        let title = "Processing JSON file";
        let msg = "Please be patient while the submitted file is being processed.";
        openNotification("info", title, msg);

        const file = new Moralis.File(selectedFile.name, selectedFile);
        await file.saveIPFS()
          .then(res => res.hash())
          .then(data => getIpfsHash(data))
      }
  };

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
        <Button type='primary' shape='round' size='large' style={styles.resetButton} onClick={handleSubmission}>
          SUBMIT
        </Button>
      </div>
    </div>
  );
};

export default Uploader;
