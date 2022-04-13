/*eslint no-dupe-keys: "Off"*/
import React, { useEffect, useState, useRef } from "react";
import { Moralis } from "moralis";
import { useMoralis, useNativeBalance } from "react-moralis";
import { menuItems } from "../Chains/Chains";
import SearchCollections from "components/SearchCollections";
import { Card, Image, Tooltip, Modal, Badge, Alert, Spin, Button } from "antd";
import { useNetworkCollections } from "hooks/useNetworkCollections";
import { useNFTTokenIds } from "hooks/useNFTTokenIds";
import { FileSearchOutlined, RightCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getMarketplaceAddress, marketABI } from "../../Constant/constant";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import ChainVerification from "components/Chains/ChainVerification";
import AccountVerification from "components/Account/AccountVerification";
import ShowNFTModal from "../ShowNFTModal";
const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "15px"
  },
  banner: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: "0 auto",
    width: "600px",
    height: "150px",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "solid 1px #e3e3e3"
  },
  logo: {
    height: "115px",
    width: "115px",
    borderRadius: "50%",
    border: "solid 4px white"
  },
  backButton: {
    width: "150px",
    paddingLeft: "10px",
    paddingRight: "10px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    color: "yellow",
    border: "0.5px solid white",
    fontSize: "12px",
    cursor: "pointer"
  },
  text: {
    color: "white",
    fontSize: "27px",
    fontWeight: "bold",
    letterSpacing: "2px"
  }
};

function Marketplace() {
  const fallbackImg =
    "data:image/png;base64,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";
  const { account, chainId, isAuthenticated } = useMoralis();
  const onSupportedChain = menuItems?.filter((item) => item.key === chainId).length > 0;
  const [collectionAddr, setCollectionAddr] = useState();
  const { Marketplace, totalNFTs } = useNFTTokenIds(collectionAddr);
  const { getMarketItemData, parseAllData } = useQueryMoralisDb();
  const { NFTCollections } = useNetworkCollections();
  const { nativeToken } = useNativeBalance(chainId);
  const [detailVisibility, setDetailVisibility] = useState(false);
  const [visible, setVisibility] = useState(false);
  const [nftToBuy, setNftToBuy] = useState(null);
  const [nftToShow, setNftToShow] = useState();
  const [loading, setLoading] = useState(false);
  const [marketItems, setMarketItems] = useState([]);
  const marketABIJson = JSON.parse(marketABI);
  const purchaseItemFunction = "createMarketSale";
  const mounted = useRef(false);

  const getMarketItems = async () => {
    const res = await getMarketItemData();
    const parsedMarketItems = await parseAllData(res);
    setMarketItems(parsedMarketItems);
  };

  const handleShowDetail = (nft) => {
    setNftToShow(nft);
    setDetailVisibility(true);
  };

  useEffect(() => {
    mounted.current = true;
    getMarketItems();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchase = async () => {
    setLoading(true);
    const marketAddress = getMarketplaceAddress(chainId);
    const tokenDetails = getMarketItem(nftToBuy);
    const itemID = tokenDetails.itemId;
    const tokenPrice = tokenDetails.price;
    const sendOptions = {
      contractAddress: marketAddress,
      functionName: purchaseItemFunction,
      abi: marketABIJson,
      params: {
        nftContract: nftToBuy.token_address,
        itemId: itemID
      },
      msgValue: tokenPrice
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      await transaction.wait(2);
      setLoading(false);
      setVisibility(false);
      updateSoldMarketItem();
      succPurchase();
    } catch (error) {
      setLoading(false);
      failPurchase();
    }
  };

  const handleBuyClick = (nft) => {
    setNftToBuy(nft);
    setVisibility(true);
  };

  function succPurchase() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `You have purchased this NFT`
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failPurchase() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem when purchasing this NFT`
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  async function updateSoldMarketItem() {
    const id = getMarketItem(nftToBuy).objectId;
    const marketList = Moralis.Object.extend("CreatedMarketItems");
    const query = new Moralis.Query(marketList);
    await query.get(id).then((obj) => {
      obj.set("sold", true);
      obj.set("owner", account);
      obj.set("collectionName", nftToBuy.name);
      obj.save();
    });
  }

  const getMarketItem = (nft) => {
    const result = marketItems?.find(
      (e) =>
        e.nftContract === nft?.token_address && e.tokenId === nft?.token_id && e.sold === false && e.confirmed === true
    );
    return result;
  };

  return (
    <>
      <AccountVerification param={"marketplace"} />
      <ChainVerification />
      {isAuthenticated && onSupportedChain && (
        <div style={{ marginTop: "40px" }}>
          <div style={{ textAlign: "center", margin: "auto", paddingBottom: "20px" }}>
            <SearchCollections setInputValue={setCollectionAddr} inputValue={collectionAddr} />
          </div>

          {collectionAddr && (
            <div style={{ textAlign: "center", paddingBottom: "30px" }}>
              <Button style={styles.backButton} shape='round' onClick={() => setCollectionAddr()}>
                Back to collections
              </Button>
            </div>
          )}

          {collectionAddr !== undefined && totalNFTs !== undefined && (
            <>
              <div style={styles.banner}>
                <Image
                  preview={false}
                  src={Marketplace[0]?.image || "error"}
                  fallback={fallbackImg}
                  alt=''
                  style={styles.logo}
                />
                <div style={styles.text}>
                  <>
                    <>{`${Marketplace[0]?.name}`}</>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "yellow",
                        fontWeight: "normal"
                      }}
                    >
                      Collection Size: {`${totalNFTs}`}
                    </div>
                  </>
                </div>
              </div>
            </>
          )}

          <div style={styles.NFTs}>
            {collectionAddr === undefined &&
              NFTCollections?.map((nft, index) => (
                <Card
                  hoverable
                  size='small'
                  onClick={() => setCollectionAddr(nft?.addrs)}
                  actions={[
                    <Tooltip title='View Collection'>
                      <RightCircleOutlined />
                    </Tooltip>
                  ]}
                  style={{ width: "200px", transform: "scale(0.9)", border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={nft?.image || "error"}
                      fallback={fallbackImg}
                      alt=''
                      style={{ height: "200px" }}
                    />
                  }
                  key={index}
                >
                  <Meta title={nft.name} />
                </Card>
              ))}

            {collectionAddr !== undefined &&
              Marketplace.slice(0, 50).map((nft, index) => (
                <Card
                  hoverable
                  size='small'
                  actions={[
                    <Tooltip title='View On Blockexplorer'>
                      <FileSearchOutlined
                        onClick={() => window.open(`${getExplorer(chainId)}address/${nft.token_address}`, "_blank")}
                      />
                    </Tooltip>,
                    <Tooltip title='Buy NFT'>
                      <ShoppingCartOutlined onClick={() => handleBuyClick(nft)} />
                    </Tooltip>
                  ]}
                  style={{ width: "190px", border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={nft.image || "error"}
                      fallback={fallbackImg}
                      alt=''
                      style={{ height: "190px" }}
                      onClick={() => handleShowDetail(nft)}
                    />
                  }
                  key={index}
                >
                  {getMarketItem(nft) && <Badge.Ribbon text='Buy Now' color='green'></Badge.Ribbon>}
                  <Meta title={nft.name} description={`#${getEllipsisTxt(nft.token_id, 6)}`} />

                  <ShowNFTModal
                    nftToShow={nftToShow}
                    setDetailVisibility={setDetailVisibility}
                    detailVisibility={detailVisibility}
                  />
                </Card>
              ))}
          </div>
          {getMarketItem(nftToBuy) ? (
            <Modal
              title={`Buy ${nftToBuy?.name} #${getEllipsisTxt(nftToBuy?.token_id, 6)}`}
              visible={visible}
              onCancel={() => setVisibility(false)}
              onOk={() => purchase()}
              okText='Buy'
            >
              <Spin spinning={loading}>
                <div style={{ width: "250px", margin: "auto" }}>
                  <Badge.Ribbon
                    color='green'
                    text={`${getMarketItem(nftToBuy).price / ("1e" + 18)} ${nativeToken?.name}`}
                  >
                    <img
                      src={nftToBuy?.image}
                      alt=''
                      style={{
                        width: "250px",
                        borderRadius: "10px",
                        marginBottom: "15px"
                      }}
                    />
                  </Badge.Ribbon>
                </div>
              </Spin>
            </Modal>
          ) : (
            <Modal
              title={`Buy ${nftToBuy?.name} #${getEllipsisTxt(nftToBuy?.token_id, 6)} ?`}
              visible={visible}
              onCancel={() => setVisibility(false)}
              onOk={() => setVisibility(false)}
            >
              <img
                src={nftToBuy?.image}
                alt=''
                style={{
                  width: "250px",
                  margin: "auto",
                  borderRadius: "10px",
                  marginBottom: "15px"
                }}
              />
              <Alert message='This NFT is currently not for sale' type='warning' />
            </Modal>
          )}
        </div>
      )}
    </>
  );
}

export default Marketplace;
