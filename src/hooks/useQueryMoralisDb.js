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

  const getCreatedBundleData = async (owner) => {
    const CreatedSingleBundle = Moralis.Object.extend("CreatedSingleBundle");
    const query = new Moralis.Query(CreatedSingleBundle);
    query.equalTo("firstHolder", owner);
    const res = await query.find();
    return res;
  };

  const getCreatedBatchBundleData = async (owner) => {
    const CreatedBatchBundle = Moralis.Object.extend("CreatedBatchBundle");
    const query = new Moralis.Query(CreatedBatchBundle);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const getClaimedBundleData = async (owner) => {
    const ClaimedBundle = Moralis.Object.extend("ClaimedBundle");
    const query = new Moralis.Query(ClaimedBundle);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const parseData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.owner === owner);
    return parsedData;
  };

  const parseCreatedBundleData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.firstHolder === owner);
    return parsedData;
  };

  return { getCreatedCollectionData, getCreatedBundleData, getCreatedBatchBundleData, getClaimedBundleData, parseData, parseCreatedBundleData };
};