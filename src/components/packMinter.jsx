import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button } from "antd";
import { useNFTBalance } from "hooks/useNFTBalance";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import { useWeb3ExecuteFunction } from "react-moralis";
import AssetModal from "./Wallet/components/AssetModal"


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
        maxWidth: "80%",
        margin: "0 auto",
        textAlign: "center",
    },
    label: {
        textAlign: "left",
        display: "block",
    },
    h2: {
        fontSize: "30px",
        color: "#f1356d",
        marginBottom: "50px",
    },
    input: {
        width: "100%",
        padding: "6px 10px",
        margin: "10px 0",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        display: "block",
    },
    textarea: {
        width: "100%",
        padding: "6px 10px",
        margin: "10px 0",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        display: "block",
    },
    select: {
        width: "100%",
        padding: "6px 10px",
        margin: "10px 0",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        display: "block",
    },
    mintButton: {
        background: "#f1356d",
        color: "#fff",
        border: "0",
        padding: "20px",
        fontSize: "20px",
        borderRadius: "8px",
        cursor: "pointer",
    },
    container:{
        width: "800px",
        height: "200px",
        opacity: "0.8",
        borderRadius: "8px",
        backgroundColor: "black",
        textAlign: "center",
        paddingTop: "50px",
        fontSize: "25px",
        color: "white",
    },
};


const PackMinter = () => {
    const [bundleName, setBundleName] = useState('');
    const [bundleDescription, setBundleDescription] = useState('');
    const [properties, setProperties] = useState({attribut: "", value: ""});
    const [url, setURL] = useState('');
    const history = useHistory();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    //const [modalText, setModalText] = useState('Content of the modal');

    const showModal = () => {
        setIsModalVisible(true);
        //setModalText( { textToDisplay } );

    };

    const handleOk = () => {
        //setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setIsModalVisible(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setIsModalVisible(false);
    };

    const handleChange = (field) => {
        return (e) => setProperties((properties) => ({ ...properties, [field]: e.target.value }));
      };

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
            <h2 style={styles.h2}>Prepare your NFTs bundles:</h2>
            <form onSubmit={handleSubmit}>

                <div style={styles.container}>
                    <label>Select some assets to bundle</label>
                    <div>
                        <Button type="primary" onClick={showModal}>Pick some NFTs</Button>
                        <Modal
                            title="Select the NFTs to pack"
                            visible={isModalVisible}
                            onOk={handleOk}
                            confirmLoading={confirmLoading}
                            onCancel={handleCancel}
                        >
                            {/* <p>{modalText}</p> */}
                            <AssetModal />
                        </Modal>
                    </div>
                </div>

                <label style={styles.label}>Name</label>
                <input
                    style={styles.input}
                    type="text"
                    required
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                />

                <label style={styles.label}>Description</label>
                <textarea
                    style={styles.textarea}
                    required
                    value={bundleDescription}
                    onChange={(e) => setBundleDescription(e.target.value)}
                ></textarea>

                <label style={styles.label}>Properties</label>
                <input
                    style={styles.input}
                    type="text"
                    value={properties.attribut}
                    onChange={handleChange("attribut")}
                />
                <input
                    style={styles.input}
                    type="text"
                    value={properties.value}
                    onChange={handleChange("value")}
                />
                {/* <label style={styles.label}>NFT author:</label>
                <select
                    style={styles.select}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                >
                    <option value="ETH-Address">ETH Address</option>
                    <option value="collection-name">Collection Name</option>
                </select> */}
                <button style={styles.mintButton}>Bundle All</button>
                <div> {bundleName} {bundleDescription} {properties.attribut} {properties.value} </div>
            </form>
        </div>
    );
}

export default PackMinter;