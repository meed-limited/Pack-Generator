import { Input, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import styles from "../styles";

const NumOfNftPerPack = ({ ERC721Number, handleERC721Number, ERC1155Number, handleERC1155Number }) => {
  return (
    <>
      <p style={{ fontSize: "12px" }}>
        Number of ERC721 per pack:
        <Tooltip
          title='Enter the number of ERC721 NFT that will be contained inside each pack (up to 50 ERC721 per pack).'
          style={{ position: "absolute", top: "35px", right: "80px" }}
        >
          <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
        </Tooltip>
      </p>
      <p>
        <Input
          style={styles.transparentInput}
          type='number'
          min='0'
          max='50'
          value={ERC721Number}
          onChange={handleERC721Number}
        />
      </p>
      <p style={{ fontSize: "12px", marginTop: "20px" }}>
        Number of ERC1155 per pack:
        <Tooltip
          title='Enter the number of ERC1155 NFT that will be contained inside each pack (up to 50 ERC1155 per pack).'
          style={{ position: "absolute", top: "35px", right: "80px" }}
        >
          <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
        </Tooltip>
      </p>
      <p>
        <Input
          style={styles.transparentInput}
          type='number'
          min='0'
          max='50'
          value={ERC1155Number}
          onChange={handleERC1155Number}
        />
      </p>
    </>
  );
};

export default NumOfNftPerPack;
