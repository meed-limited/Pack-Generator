import React, { forwardRef, useImperativeHandle, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useCSVReader, lightenDarkenColor, formatFileSize } from "react-papaparse";
import styles from "./styles";
import { openNotification } from "components/Notification";

const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40);

const Uploader = forwardRef(({ isJsonFile, getJsonFile }, ref) => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR);

  const handleFile = (file) => {
    var object = [];
    var counter = 0;
    try {
      for (let i = 1; i < file.data.length; i++) {
        object[counter] = {
          token_id: parseInt(file.data[i][0]),
          amount: parseInt(file.data[i][1]),
          contract_type: file.data[i][2],
          token_address: file.data[i][3].toLowerCase()
        };
        counter++;
      }
      isJsonFile(true);
      getJsonFile(object);
    } catch (error) {
      console.log(error);
      let title = "Error with CSV file";
      let msg = "Oops, there seems to be an issue with the CSV file you submitted. Please double check your data.";
      openNotification("error", title, msg);
    }
  };

  useImperativeHandle(ref, () => ({
    reset() {
      getJsonFile();
      isJsonFile(false);
    }
  }));

  const text = () => {
    return (
      <p>
        <br />
        Make a copy of the attached template and edit your data. When all set, simply save your file as ".csv". <br />
        Required info: <br />
        1. Token Id <br />
        2. Amount (if ERC1155, else leave blank) <br />
        3. Contract type (ERC721 or ERC1155) <br />
        4. Contract Address
      </p>
    );
  };

  return (
    <div style={styles.uploadBox}>
      <>
        <p style={{ fontSize: "13px", letterSpacing: "1px", fontWeight: "300" }}>
          Import some infos about the NFTs that you wish to pack.
          <Tooltip style={{ position: "absolute", top: "35px", right: "80px" }} title={text}>
            <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
          </Tooltip>
        </p>
        <p>
          <a
            href='https://docs.google.com/spreadsheets/d/1kbv-1nI3Nt51bLE8Nt_8zWlLDwVyIhTo66uZBvWS5Cw/edit#gid=0'
            target='_blank'
            rel='noreferrer noopener'
            style={{ fontSize: "13px", marginBottom: "12px" }}
          >
            Click to open the template.
          </a>
        </p>
        <CSVReader
          onUploadAccepted={(results) => {
            handleFile(results);
            setZoneHover(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setZoneHover(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setZoneHover(false);
          }}
        >
          {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }) => (
            <>
              <div {...getRootProps()} style={Object.assign({}, styles.zone, zoneHover && styles.zoneHover)}>
                {acceptedFile ? (
                  <>
                    <div style={styles.file}>
                      <div style={styles.info}>
                        <span style={styles.size}>{formatFileSize(acceptedFile.size)}</span>
                        <span style={styles.name}>{acceptedFile.name}</span>
                      </div>
                      <div style={styles.progressBar}>
                        <ProgressBar />
                      </div>
                      <div
                        {...getRemoveFileProps()}
                        style={styles.remove}
                        onMouseOver={(event) => {
                          event.preventDefault();
                          setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                        }}
                        onMouseOut={(event) => {
                          event.preventDefault();
                          setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                        }}
                      >
                        <Remove color={removeHoverColor} />
                      </div>
                    </div>
                  </>
                ) : (
                  "Drop CSV file here or click to upload"
                )}
              </div>
            </>
          )}
        </CSVReader>
      </>
    </div>
  );
});

export default Uploader;
