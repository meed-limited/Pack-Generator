import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTTokenIds = (addr) => {
  const { token } = useMoralisWeb3Api();
  const { chainId } = useMoralis();
  const { resolveLink } = useIPFS();
  const [Marketplace, setMarketplace] = useState([]);
  const [totalNFTs, setTotalNFTs] = useState();
  const [fetchSuccess, setFetchSuccess] = useState(true);
  const [fetchResult, setFetchResult] = useState();

  const fetchAllTokenIds = async () => {
    const options = {
      chain: chainId,
      address: addr,
      limit: 20
    };
    const NFTs = await token.getAllTokenIds(options);
    setFetchResult(NFTs);
  };

  useEffect(() => {
    if (addr && addr !== "explore") {
      fetchAllTokenIds();
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr]);

  useEffect(() => {
    fetchData();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResult]);

  async function fetchData() {
    if (fetchResult?.result) {
      const NFTs = fetchResult.result;
      setTotalNFTs(fetchResult.total);
      setFetchSuccess(true);
      for (let NFT of NFTs) {
        if (NFT?.metadata && typeof NFT.metadata === "string") {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            await fetch(NFT.token_uri)
              .then((response) => response.json())
              .then((data) => {
                NFT.image = resolveLink(data.image);
              });
          } catch (error) {
            setFetchSuccess(false);
          }
        }
      }
      setMarketplace(NFTs);
    }
  }

  return {
    Marketplace,
    totalNFTs,
    fetchSuccess
  };
};
