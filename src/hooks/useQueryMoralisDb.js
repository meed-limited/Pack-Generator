import { useMoralis } from "react-moralis";

export const useQueryMoralisDb = () => {
  const { Moralis } = useMoralis();

  const getCreatedCollectionData = async (owner) => {
    const CreatedCollections = Moralis.Object.extend("CreatedCollections");
    const query = new Moralis.Query(CreatedCollections);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const getCreatedPackData = async (owner) => {
    const CreatedSinglePack = Moralis.Object.extend("CreatedSinglePack");
    const query = new Moralis.Query(CreatedSinglePack);
    query.equalTo("firstHolder", owner);
    const res = await query.find();
    return res;
  };

  const getCreatedBatchPackData = async (owner) => {
    const CreatedBatchPack = Moralis.Object.extend("CreatedBatchPack");
    const query = new Moralis.Query(CreatedBatchPack);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const getClaimedPackData = async (owner) => {
    const ClaimedPack = Moralis.Object.extend("ClaimedPack");
    const query = new Moralis.Query(ClaimedPack);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const getCustomCollectionData = async (owner) => {
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const query = new Moralis.Query(CustomCollections);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const parseData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.owner === owner);
    return parsedData;
  };

  const parseCreatedPackData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.firstHolder === owner);
    return parsedData;
  };

  return {
    getCreatedCollectionData,
    getCreatedPackData,
    getCreatedBatchPackData,
    getClaimedPackData,
    getCustomCollectionData,
    parseData,
    parseCreatedPackData,
  };
};
