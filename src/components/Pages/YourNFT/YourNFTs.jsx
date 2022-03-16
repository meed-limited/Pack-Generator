/*eslint no-dupe-keys: "Off"*/
import React, { useEffect, useState } from "react";
import { Moralis } from "moralis";
import { useMoralis, useNFTBalances, useNativeBalance } from "react-moralis";
import ClaimSingleNFT from "./ClaimSingleNFT";
import { getMarketplaceAddress, marketABI } from "../../../Constant/constant";
import ChainVerification from "components/Chains/ChainVerification";
import AccountVerification from "components/Account/AccountVerification";
import { usePackCollections } from "hooks/usePackCollections";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "helpers/formatters";
import { approveNFTcontract } from "../../../helpers/approval";
import { openNotification } from "../../../helpers/notifications";
import { Card, Image, Tooltip, Modal, Input, Spin, Button, Alert, Space } from "antd";
import { FileSearchOutlined, KeyOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import ShowNFTModal from "../../ShowNFTModal";

const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    height: "fit-content",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    margin: "40px auto",
    width: "100%",
    gap: "15px"
  },
  loadMoreButton: {
    margin: "auto",
    borderRadius: "8px",
    background: "#d020ba",
    background: "-moz-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "-webkit-linear-gradient(left, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    background: "linear-gradient(to right, #d020ba 0%, #BF28C3 10%, #6563E0 100%)",
    color: "yellow",
    border: "0.5px solid white",
    fontSize: "15px",
    cursor: "pointer"
  }
};

function YourNFTs() {
  const { chainId, isAuthenticated } = useMoralis();
  const marketAddress = getMarketplaceAddress(chainId);
  const NFTsPerPage = 50;
  const [offset, setOffset] = useState(0);
  const [fetchedNFTs, setFetchedNFTs] = useState([]);
  const { nativeToken } = useNativeBalance(chainId);
  const { getNFTBalances, data: NFTBalances, isLoading, isFetching } = useNFTBalances({ limit: NFTsPerPage });
  const { verifyMetadata } = useVerifyMetadata();
  const { packCollections } = usePackCollections();
  const [visible, setVisibility] = useState(false);
  const [detailVisibility, setDetailVisibility] = useState(false);
  const [claimModalvisible, setClaimModalvisible] = useState(false);
  const [isClaimSuccess, setIsClaimSuccess] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [nftToShow, setNftToShow] = useState();
  const [nftToClaim, setNftToClaim] = useState(null);
  const [price, setPrice] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isNFTloading, setIsNFTLoading] = useState(false);
  const marketABIJson = JSON.parse(marketABI);
  const listItemFunction = "createMarketItem";
  const ItemImage = Moralis.Object.extend("ItemImages");

  const addFetchedNFTs = () => {
    if (NFTBalances) {
      setIsNFTLoading(true);
      let nextFetchedNFTs = fetchedNFTs;
      nextFetchedNFTs.push(...NFTBalances.result);
      setFetchedNFTs(nextFetchedNFTs);
      setIsNFTLoading(false);
    }
  };

  useEffect(() => {
    const cleanupFunction = () => {
      if (!isLoading && !isFetching) {
        addFetchedNFTs();
      }
    };
    cleanupFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFetching]);

  const handleLoadMore = async () => {
    setIsNFTLoading(true);
    await getNFTBalances({ params: { chainId: chainId, limit: NFTsPerPage, offset: offset + NFTsPerPage } });
    setOffset(offset + NFTsPerPage);
  };

  async function list(nft, listPrice) {
    setLoading(true);
    const p = listPrice * ("1e" + 18);
    const sendOptions = {
      contractAddress: marketAddress,
      functionName: listItemFunction,
      abi: marketABIJson,
      params: {
        nftContract: nft.token_address,
        tokenId: nft.token_id,
        price: String(p)
      }
    };

    try {
      const transaction = await Moralis.executeFunction(sendOptions);
      await transaction.wait(2);

      setLoading(false);
      setVisibility(false);
      addItemImage();
      let title = "NFTs listed succesfully";
      let msg = "Your NFT has been succesfully listed to the marketplace.";
      openNotification("success", title, msg);
      console.log("NFTs listed succesfully");
    } catch (error) {
      setLoading(false);
      let title = "Error during listing!";
      let msg = "Something went wrong while listing your NFT to the marketplace. Please try again.";
      openNotification("error", title, msg);
      console.log(error);
    }
  }

  const approveAll = async (nft) => {
    setLoading(true);
    approveNFTcontract(nft.token_address, marketAddress);
    setLoading(false);
  };

  const handleSellClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleClaimClick = async (nft) => {
    setNftToClaim(nft);
    setClaimModalvisible(true);
  };

  const getClaimStatut = (bool) => {
    setIsClaimSuccess(bool);
  };

  useEffect(() => {
    const cleanupFunction2 = () => {
      if (isClaimSuccess) {
        setClaimModalvisible(false);
      }
    };
    cleanupFunction2();
  }, [isClaimSuccess]);

  function addItemImage() {
    const itemImage = new ItemImage();

    itemImage.set("image", nftToSend.image);
    itemImage.set("nftContract", nftToSend.token_address);
    itemImage.set("tokenId", nftToSend.token_id);
    itemImage.set("name", nftToSend.name);

    itemImage.save();
  }

  const handleShowDetail = (nft) => {
    setNftToShow(nft);
    setDetailVisibility(true);
  };

  const isClaimable = (nft) => {
    if (packCollections.includes(nft.token_address.toLowerCase()) === true) {
      return (
        <Tooltip title='Claim Pack'>
          <KeyOutlined onClick={() => handleClaimClick(nft)} />
        </Tooltip>
      );
    }
  };

  return (
    <>
      <AccountVerification param={"yourNfts"} />
      <ChainVerification />
      <div style={styles.NFTs}>
        {isAuthenticated && !NFTBalances && (
          <Space>
            <Spin size='large' />
          </Space>
        )}
        {fetchedNFTs &&
          fetchedNFTs?.map((nft, index) => {
            nft = verifyMetadata(nft);
            return (
              <Card
                size='small'
                hoverable
                actions={[
                  <Tooltip title='View On Blockexplorer'>
                    <FileSearchOutlined
                      onClick={() => window.open(`${getExplorer(chainId)}address/${nft.token_address}`, "_blank")}
                    />
                  </Tooltip>,
                  <Tooltip title='List NFT for sale'>
                    <ShoppingCartOutlined onClick={() => handleSellClick(nft)} />
                  </Tooltip>,
                  isClaimable(nft)
                ]}
                style={{ width: 190, border: "2px solid #e7eaf3" }}
                cover={
                  <Image
                    preview={false}
                    src={nft?.image || "error"}
                    fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='
                    alt=''
                    style={{ height: "190px" }}
                    onClick={() => handleShowDetail(nft)}
                  />
                }
                key={index}
              >
                <Meta title={nft.name} description={nft.contract_type} />
              </Card>
            );
          })}
      </div>

      <Modal
        title={`List "${nftToSend?.name} #${getEllipsisTxt(nftToSend?.token_id, 6)}" For Sale`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => list(nftToSend, price)}
        okText='List'
        footer={[
          <Button onClick={() => setVisibility(false)}>Cancel</Button>,
          <Button onClick={() => approveAll(nftToSend)} type='primary'>
            Approve
          </Button>,
          <Button onClick={() => list(nftToSend, price)} type='primary'>
            List
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          <img
            src={`${nftToSend?.image}`}
            alt=''
            style={{
              width: "250px",
              height: "250px",
              margin: "auto",
              borderRadius: "10px",
              marginBottom: "15px"
            }}
          />
          <label style={{ color: "white" }}>Set the price in {nativeToken?.name}:</label>
          <Input autoFocus onChange={(e) => setPrice(e.target.value)} />
        </Spin>
      </Modal>

      <Modal
        title={`Claim "${nftToClaim?.name} #${getEllipsisTxt(nftToClaim?.token_id, 6)}" to reveal its content!`}
        visible={claimModalvisible}
        onCancel={() => setClaimModalvisible(false)}
        footer={false}
      >
        <ClaimSingleNFT nftToClaim={nftToClaim} getClaimStatut={getClaimStatut} />
      </Modal>

      <ShowNFTModal
        nftToShow={nftToShow}
        setDetailVisibility={setDetailVisibility}
        detailVisibility={detailVisibility}
      />

      {fetchedNFTs && fetchedNFTs?.length > 0 && (
        <div style={{ margin: "20px auto", textAlign: "center" }}>
          {!(fetchedNFTs?.length >= NFTBalances?.total) && isNFTloading && <Spin size='large'></Spin>}

          {!(fetchedNFTs?.length >= NFTBalances?.total) && !isNFTloading && (
            <Button style={styles.loadMoreButton} onClick={handleLoadMore}>
              ... Load more
            </Button>
          )}
          {fetchedNFTs?.length >= NFTBalances?.total && (
            <Alert style={{ width: "250px", margin: "auto" }} message={"All NFTs loaded"} type='info' showIcon />
          )}
        </div>
      )}
    </>
  );
}

export default YourNFTs;
