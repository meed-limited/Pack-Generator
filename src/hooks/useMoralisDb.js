import { useMoralis } from "react-moralis";

export const useMoralisDb = () => {
  const { Moralis, chainId, account } = useMoralis();

  const getCreatedPackData = async (owner) => {
    const CreatedSinglePacks = Moralis.Object.extend("CreatedSinglePacks");
    const query = new Moralis.Query(CreatedSinglePacks);
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
    const ClaimedPacks = Moralis.Object.extend("ClaimedPacks");
    const query = new Moralis.Query(ClaimedPacks);
    query.equalTo("owner", owner);
    const res = await query.find();
    return res;
  };

  const getAllCollectionData = async () => {
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const query = new Moralis.Query(CustomCollections);
    const res = await query.find();
    return res;
  };

  const getAllCollectionDataPerChain = async (chainId) => {
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const query = new Moralis.Query(CustomCollections);
    query.equalTo("chainId", chainId);
    const res = await query.find();
    return res;
  };

  const getCustomCollectionData = async (owner) => {
    const CustomCollections = Moralis.Object.extend("CustomCollections");
    const query = new Moralis.Query(CustomCollections);
    query.equalTo("owner", owner);
    query.equalTo("chainId", chainId);
    const res = await query.find();
    return res;
  };

  const getMarketItemData = async () => {
    const CreatedMarketItems = Moralis.Object.extend("CreatedMarketItems");
    const query = new Moralis.Query(CreatedMarketItems);
    const res = await query.find();
    return res;
  };

  const parseAllData = async (res) => {
    const parsedData = await JSON.parse(JSON.stringify(res));
    return parsedData;
  };

  const parseChainData = async (res, chainId) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.chainId === chainId);
    return parsedData;
  };

  const parseData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.owner === owner);
    return parsedData;
  };

  const parseCreatedPackData = async (res, owner) => {
    const parsedData = await JSON.parse(JSON.stringify(res)).filter((item) => item.firstHolder === owner);
    return parsedData;
  };

  const addItemImage = (nftToSend) => {
    const ItemImage = Moralis.Object.extend("ItemImages");
    const itemImage = new ItemImage();
    itemImage.set("image", nftToSend.image);
    itemImage.set("nftContract", nftToSend.token_address);
    itemImage.set("tokenId", nftToSend.token_id);
    itemImage.set("name", nftToSend.name);
    itemImage.save();
  };

  const saveMarketItemInDB = async (nft, listPrice) => {
    const CreatedMarketItem = Moralis.Object.extend("CreatedMarketItems");
    const item = new CreatedMarketItem();

    item.set("chainId", chainId);
    item.set("amount", nft.amount);
    item.set("seller", account);
    item.set("block_number", nft.block_number);
    item.set("block_number_minted", nft.block_number_minted);
    item.set("contract_type", nft.contract_type);
    item.set("image", nft.image);
    item.set("last_metadata_sync", nft.last_metadata_sync);
    item.set("last_token_uri_sync", nft.last_token_uri_sync);
    item.set("metadata", nft.metadata);
    item.set("collectionName", nft.name);
    item.set("owner", nft.owner_of);
    item.set("symbol", nft.symbol);
    item.set("synced_at", nft.synced_at);
    item.set("token_address", nft.token_address);
    item.set("token_hash", nft.token_hash);
    item.set("tokenId", nft.token_id);
    item.set("token_uri", nft.token_uri);
    item.set("sold", false);
    item.set("price", listPrice);
    item.save();
  };

  return {
    getCreatedPackData,
    getCreatedBatchPackData,
    getClaimedPackData,
    getAllCollectionData,
    getAllCollectionDataPerChain,
    getCustomCollectionData,
    getMarketItemData,
    parseAllData,
    parseChainData,
    parseData,
    parseCreatedPackData,
    addItemImage,
    saveMarketItemInDB,
  };
};
