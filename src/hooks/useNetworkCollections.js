import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";

export const useNetworkCollections = () => {
  const { chainId } = useMoralis();  
  const { getAllCollectionDataPerChain, parseChainData } = useQueryMoralisDb();
    const [NFTCollections, setNFTCollections] = useState([]);
  

    const getCollections = async () => {
        const collections = await getAllCollectionDataPerChain(chainId);
        const parsedCollections = await parseChainData(collections, chainId);
        const rename = parsedCollections?.map(item => ({
          addrs: item.collectionAddress,
          ...item
        }))
        setNFTCollections(rename);
      };
    
      useEffect(() => {
        getCollections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [chainId]);

  return { NFTCollections };
};
