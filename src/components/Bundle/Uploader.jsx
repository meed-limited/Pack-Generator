import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React, { useState } from "react";
import { useCSVReader, lightenDarkenColor, formatFileSize } from "react-papaparse";
import styles from "./styles";

const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40);

const Uploader = ({ getJsonFile, isJsonFile }) => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR);

  const handleFile = (file) => {
    var object = [];
    for (let i = 0; i < file.data.length; i++) {
      object[i] = {
        token_id: parseInt(file.data[i][0]),
        amount: parseInt(file.data[i][1]),
        contract_type: file.data[i][2],
        token_address: file.data[i][3].toLowerCase()
      };
    }
    isJsonFile(true);
    getJsonFile(object);
  };

  return (
    <div style={styles.uploadBox}>
      <div>
        <p style={{ fontSize: "16px", letterSpacing: "1px", fontWeight: "300" }}>
          Import some infos about the NFTs that you wish to bundle.
          <Tooltip
            title='Make a copy of the attached template and use Excel/Google Sheet/OpenOffice to edit your data. When all set, simply save your file as ".csv".
            Required info: Token Id | Amount (if ERC1155, else 0) | Contract type (ERC721 or ERC1155) | Contract Address'
            style={{ position: "absolute", top: "35px", right: "80px" }}
          >
            <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
          </Tooltip>
        </p>
        <p>
          <a
            href='https://docs.google.com/spreadsheets/d/1kbv-1nI3Nt51bLE8Nt_8zWlLDwVyIhTo66uZBvWS5Cw/edit#gid=0'
            target='_blank'
            rel='noreferrer noopener'
            style={{ fontSize: "16px", marginBottom: "12px" }}
          >
            Click to check the template.
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
      </div>
    </div>
  );
};

export default Uploader;
