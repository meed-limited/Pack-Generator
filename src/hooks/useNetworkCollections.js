import { useEffect, useState } from "react";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";

export const useNetworkCollections = () => {
    const { getAllCollectionData, parseAllData } = useQueryMoralisDb();
    const [NFTCollections, setNFTCollections] = useState([]);
  

    const getCollections = async () => {
        const collections = await getAllCollectionData();
        const parsedCollections = await parseAllData(collections);
        const rename = parsedCollections?.map(item => ({
          addrs: item.collectionAddress,
          ...item
        }))
        setNFTCollections(rename);
      };
    
      useEffect(() => {
        getCollections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

  return { NFTCollections };
};
