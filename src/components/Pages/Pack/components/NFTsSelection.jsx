/*eslint no-dupe-keys: "Off"*/
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { NFTs_PER_PAGE } from "constant/constant";
import { usePackCollections } from "hooks/usePackCollections";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import { Card, Image, Button, Spin, Alert } from "antd";
const { Meta } = Card;

const styles = {
  NFTSelection: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    margin: "auto",
    padding: "0px 30px",
    alignItems: "center",
  },
  scrollArea: {
    overflowY: "auto",
    minHeight: "51vh",
    minWidth: "52vw",
    maxHeight: "51vh",
    maxWidth: "auto",
  },
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    margin: "0 auto",
    minWidth: "100%",
    maxWidth: "100%",
    gap: "15px",
  },
  loadMoreButton: {
    marginRight: "15px",
    float: "right",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

const NFTsSelection = forwardRef(({ handleNFT, isMultiple = false, isPackOnly }, ref) => {
  const { chainId } = useMoralis();
  const [offset, setOffset] = useState(0);
  const [isNFTloading, setIsNFTloading] = useState(true);
  const [fetchedNFTs, setFetchedNFTs] = useState([]);
  const { packCollections } = usePackCollections();
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const { getNFTBalances, data: NFTBalances, isLoading, isFetching } = useNFTBalances({ limit: NFTs_PER_PAGE });
  const { verifyMetadata } = useVerifyMetadata();
  const [packToClaim, setPackToClaim] = useState([]);

  const addFetchedNFTs = () => {
    if (NFTBalances) {
      let nextFetchedNFTs = fetchedNFTs;
      nextFetchedNFTs.push(...NFTBalances.result);
      setFetchedNFTs(nextFetchedNFTs);
      setIsNFTloading(false);
    }
  };

  useEffect(() => {
    const waitForFetch = () => {
      if (!isLoading && !isFetching) {
        addFetchedNFTs();
      }
    };
    waitForFetch();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFetching]);

  const packOnlyBalance = fetchedNFTs?.filter((results) => {
    return results.contract_type.includes("ERC721");
  });

  useEffect(() => {
    if (isPackOnly) {
      if (packCollections && packCollections.length > 0) {
        setPackToClaim(
          packOnlyBalance?.filter((balance) =>
            packCollections?.some((arrayItem) => arrayItem.toLowerCase() === balance.token_address.toLowerCase())
          )
        );
      }
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPackOnly, packCollections, packOnlyBalance?.length]);

  const handleLoadMore = async () => {
    setIsNFTloading(true);
    await getNFTBalances({ params: { chainId: chainId, limit: NFTs_PER_PAGE, offset: offset + NFTs_PER_PAGE } });
    setOffset(offset + NFTs_PER_PAGE);
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

  useImperativeHandle(ref, () => ({
    reset() {
      setSelectedNFTs([]);
      handleNFT([]);
    },
  }));

  const NftToShow = !isPackOnly ? fetchedNFTs : packToClaim;

  useEffect(() => {
    handleNFT(selectedNFTs);
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NftToShow, selectedNFTs]);

  return (
    <>
      <div style={styles.NFTSelection}>
        <div style={{ ...styles.scrollArea, overflowY: isNFTloading ? "hidden" : "auto" }}>
          <div style={styles.NFTs}>
            {NFTBalances?.total === 0 && <Alert type="info" showIcon message={"No NFTs/Pack found on this account"} />}
            {NftToShow &&
              NftToShow?.map((nft, index) => {
                nft = verifyMetadata(nft);
                return (
                  <Card
                    size="small"
                    onClick={() => handleClickCard(nft)}
                    hoverable
                    style={{
                      width: 190,
                      transform: selectedNFTs.some(
                        (nftItem) =>
                          `${nftItem.token_id}-${nftItem.token_address}` === `${nft.token_id}-${nft.token_address}`
                      )
                        ? undefined
                        : "scale(0.9)",
                      opacity: selectedNFTs.some(
                        (nftItem) =>
                          `${nftItem.token_id}-${nftItem.token_address}` === `${nft.token_id}-${nft.token_address}`
                      )
                        ? "1"
                        : "0.8",
                    }}
                    cover={
                      <Image
                        preview={false}
                        src={nft?.image || "error"}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "190px" }}
                      />
                    }
                    key={index}
                  >
                    <Meta style={{ fontSize: "12x" }} title={nft.name} description={nft.contract_type} />
                  </Card>
                );
              })}
          </div>
          <div style={{ margin: "20px auto", textAlign: "center" }}>
            {!(fetchedNFTs?.length >= NFTBalances?.total) && isNFTloading && <Spin size="large"></Spin>}
            {!(fetchedNFTs?.length >= NFTBalances?.total) && !isNFTloading && (
              <Button type="ghost" style={styles.loadMoreButton} onClick={handleLoadMore}>
                ... Load more
              </Button>
            )}
            {NFTBalances?.total > 0 && fetchedNFTs?.length >= NFTBalances?.total && (
              <Alert style={{ width: "250px", margin: "auto" }} message={"All NFTs loaded"} type="info" showIcon />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

NFTsSelection.displayName = "NFTsSelection";
export default NFTsSelection;
