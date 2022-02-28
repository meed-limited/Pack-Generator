/*eslint no-dupe-keys: "Off"*/
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Card, Image, Modal, Button, Spin } from "antd";
import { useNFTBalance } from "hooks/useNFTBalance";
const { Meta } = Card;

const styles = {
  scrollArea: {
    overflowY: "scroll",
    maxHeight: "60vh",
    justifyContent: "center",
  },
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px"
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

const ModalNFT = forwardRef(
  ({ handleNFTCancel, isModalNFTVisible, handleNFTOk, confirmLoading, getAsset, isMultiple = false }, ref) => {
    const [selectedNFTs, setSelectedNFTs] = useState([]);
    const [next, setNext] = useState(0);
    const updatedNFTBalance = useNFTBalance({ limit: 20, offset: next });
    const [allBalances, setAllBalances] = useState([]);
    const [isNFTloading, setIsNFTLoading] = useState(true);
    const nftsPerPage = 20;

    useEffect(() => {
      if (updatedNFTBalance.start > allBalances.length) {
        setAllBalances(allBalances.concat(updatedNFTBalance.NFTBalance));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updatedNFTBalance.NFTBalance]);

    useEffect(() => {
      if (allBalances.length > 0) {
        setIsNFTLoading(false);
      }
    }, [allBalances]);

    const handleLoadMore = () => {
      setIsNFTLoading(true);
      setNext(next + nftsPerPage);
    };

    const handleClickCard = (nftItem) => {
      if (isMultiple) {
        if (
          selectedNFTs.some(
            (currentNft) =>
              `${currentNft.token_id}-${currentNft.token_address}` === `${nftItem.token_id}-${nftItem.token_address}`
          )
        ) {
          setSelectedNFTs(
            selectedNFTs.filter(
              (nft) => `${nft.token_id}-${nft.token_address}` !== `${nftItem.token_id}-${nftItem.token_address}`
            )
          );
        } else {
          setSelectedNFTs(selectedNFTs.concat([nftItem]));
        }
      } else {
        if (
          selectedNFTs.some(
            (currentNft) =>
              `${currentNft.token_id}-${currentNft.token_address}` === `${nftItem.token_id}-${nftItem.token_address}`
          )
        ) {
          setSelectedNFTs([]);
        } else {
          setSelectedNFTs([nftItem]);
        }
      }
    };

    const handleClickOk = () => {
      handleNFTOk(selectedNFTs);
    };

    useImperativeHandle(ref, () => ({
      reset() {
        setSelectedNFTs([]);
        handleNFTOk([]);
      }
    }));

    return (
      <>
        <Modal
          width={"900px"}
          title='Select NFTs to pack'
          visible={isModalNFTVisible}
          onOk={handleClickOk}
          confirmLoading={confirmLoading}
          onCancel={handleNFTCancel}
        >
          <div style={styles.scrollArea}>
            <div style={styles.NFTs}>
              {allBalances &&
                allBalances.map((nft, index) => {
                  return (
                    <Card
                      hoverable
                      size='small'
                      style={{
                        width: 200,
                        transform: "scale(0.9)",
                        border: selectedNFTs.some(
                          (nftItem) =>
                            `${nftItem.token_id}-${nftItem.token_address}` === `${nft.token_id}-${nft.token_address}`
                        )
                          ? "2px solid black"
                          : undefined,
                        opacity: selectedNFTs.some(
                          (nftItem) =>
                            `${nftItem.token_id}-${nftItem.token_address}` === `${nft.token_id}-${nft.token_address}`
                        )
                          ? "1"
                          : "0.8"
                      }}
                      cover={
                        <Image
                          preview={false}
                          src={nft?.image || "error"}
                          fallback='data:image/png;base64,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'
                          alt=''
                          style={{ height: "200px" }}
                        />
                      }
                      key={index}
                      onClick={() => handleClickCard(nft)}
                    >
                      <Meta title={nft.name} description={nft.contract_type} />
                    </Card>
                  );
                })}
            </div>
            <div style={{ margin: "20px auto", textAlign: "center" }}>
              {isNFTloading && <Spin size='large'></Spin>}
              {!isNFTloading && allBalances.length > 19 && (
                <Button style={styles.loadMoreButton} onClick={handleLoadMore}>
                  ... Load more
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </>
    );
  }
);

export default ModalNFT;
