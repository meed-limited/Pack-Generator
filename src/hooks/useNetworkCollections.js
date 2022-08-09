import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useMoralisDb } from "hooks/useMoralisDb";

export const useNetworkCollections = () => {
  const { chainId } = useMoralis();
  const { getAllCollectionDataPerChain, parseChainData } = useMoralisDb();
  const [NFTCollections, setNFTCollections] = useState([]);

  const getCollections = async () => {
    const collections = await getAllCollectionDataPerChain(chainId);
    const parsedCollections = await parseChainData(collections, chainId);
    const rename = parsedCollections?.map((item) => ({
      addrs: item.collectionAddress,
      ...item,
    }));
    setNFTCollections(rename);
  };

  useEffect(() => {
    getCollections();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return { NFTCollections };
};
