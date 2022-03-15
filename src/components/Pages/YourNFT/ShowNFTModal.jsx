/*eslint no-dupe-keys: "Off"*/
import { getEllipsisTxt } from "helpers/formatters";
import copy from "copy-to-clipboard";
import { message } from "antd";
import Modal from "antd/lib/modal/Modal";
import { CopyOutlined } from "@ant-design/icons";

const styles = {
  transparentContainer: {
    borderRadius: "20px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    textAlign: "left",
    padding: "15px",
    fontSize: "18px",
    color: "white"
  }
};

const ShowNFTModal = ({ nftToShow, setDetailVisibility, detailVisibility }) => {
  const copyToClipboard = (toCopy) => {
    copy(toCopy);
    message.config({
      maxCount: 1
    });
    message.success(`"${toCopy}" copied!`, 2);
  };

  return (
    <>
      <Modal
        title={`"${nftToShow?.name} #${getEllipsisTxt(nftToShow?.token_id, 6)}" Details`}
        visible={detailVisibility}
        onCancel={() => setDetailVisibility(false)}
        footer={false}
      >
        <img
          src={`${nftToShow?.image}`}
          alt=''
          style={{
            width: "250px",
            height: "250px",
            margin: "auto",
            borderRadius: "10px",
            marginBottom: "15px"
          }}
        />
        <div style={styles.transparentContainer}>
          {nftToShow?.name !== null && <h3 style={{ textAlign: "center", fontSize: "21px" }}>{nftToShow?.name}</h3>}
          {nftToShow?.metadata !== null && (
            <h4 style={{ textAlign: "center", fontSize: "19px" }}>{nftToShow?.metadata.description}</h4>
          )}
          <br></br>

          <div>
            NFT Id:{" "}
            <div style={{ float: "right" }}>
              {nftToShow?.token_id.length > 8 ? getEllipsisTxt(nftToShow?.token_id, 4) : nftToShow?.token_id}{" "}
              <CopyOutlined style={{ color: "blue" }} onClick={() => copyToClipboard(nftToShow?.token_id)} />
            </div>
          </div>
          <div>
            Contract Address:
            <div style={{ float: "right" }}>
              {getEllipsisTxt(nftToShow?.token_address, 6)}{" "}
              <CopyOutlined style={{ color: "blue" }} onClick={() => copyToClipboard(nftToShow?.token_address)} />
            </div>
          </div>
          <div>
            Contract Type:
            <div style={{ float: "right" }}>
              {nftToShow?.contract_type}{" "}
              <CopyOutlined style={{ color: "blue" }} onClick={() => copyToClipboard(nftToShow?.contract_type)} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShowNFTModal;
