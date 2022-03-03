import { useEffect, useState } from "react";
import { useQueryMoralisDb } from "./useQueryMoralisDb";

export const usePackCollections = () => {
  const { getAllCollectionData, parseAllData } = useQueryMoralisDb();
  const [packCollections, setPackCollections] = useState([]);

  const getArrayOfCollection = async () => {
    const customCollec = await getAllCollectionData();
    const customCollecParsed = await parseAllData(customCollec);
    var collectionAddressArray = [];

    for (let i = 0; i < customCollecParsed.length; i++) {
      collectionAddressArray.push(customCollecParsed[i].collectionAddress.toLowerCase());
    }

    setPackCollections(collectionAddressArray);
  };

  useEffect(() => {
    async function waitForArray() {
      await getArrayOfCollection();
    }
    waitForArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { packCollections };
};
