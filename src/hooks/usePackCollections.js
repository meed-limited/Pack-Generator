import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getAssemblyAddress } from "../Constant/constant";
import { useMoralisDb } from "./useMoralisDb";

export const usePackCollections = () => {
  const { chainId } = useMoralis();
  const { getAllCollectionData, parseAllData } = useMoralisDb();
  const [packCollections, setPackCollections] = useState([]);
  const assemblyAddress = getAssemblyAddress(chainId);

  const getArrayOfCollection = async () => {
    const customCollec = await getAllCollectionData();
    const customCollecParsed = await parseAllData(customCollec);
    var collectionAddressArray = [assemblyAddress?.toLowerCase()];

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
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { packCollections };
};
