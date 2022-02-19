import React from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useContractEvents } from "hooks/useContractEvents";
import { Table, Tag, Space } from "antd";
import { PolygonCurrency } from "./Chains/Logos";
import moment from "moment";
import styles from "./Bundle/styles";

function NFTTransactions() {
  const { Moralis } = useMoralis();
  const { walletAddress, chainId, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } = useMoralisDapp();
  const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const queryItemImages = useMoralisQuery("ItemImages");
  const fetchItemImages = JSON.parse(JSON.stringify(queryItemImages.data, ["nftContract", "tokenId", "name", "image"]));
  const queryMarketItems = useMoralisQuery("MarketItems");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "updatedAt",
      "price",
      "nftContract",
      "itemId",
      "sold",
      "tokenId",
      "seller",
      "owner"
    ])
  )
    .filter((item) => item.seller === walletAddress || item.owner === walletAddress)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));

  function getImage(addrs, id) {
    const img = fetchItemImages.find((element) => element.nftContract === addrs && element.tokenId === id);
    return img?.image;
  }

  function getName(addrs, id) {
    const nme = fetchItemImages.find((element) => element.nftContract === addrs && element.tokenId === id);
    return nme?.name;
  }

  // const getCreatedBundle = async (bundleId) => {
  //   const contractAddress = getContractAddress();
  //   const data = await retrieveCreatedAssemblyEvent(bundleId, contractAddress);
  // };

  const getFactoryAddress = () => {
    if (chainId === "0x1") {
      return factoryAddressEthereum;
    } else if (chainId === "0x89") {
      return factoryAddressPolygon;
    } else if (chainId === "0x13881") {
      return factoryAddressMumbai;
    }
  };

  // const getCreatedCollection = async () => {
  //   const contractAddress = getFactoryAddress();
  //   const data = await retrieveCreatedAssemblyEvent(contractAddress);
  // };

  const getCreatedCollection = async () => {
    const CreatedCollections = Moralis.Object.extend("CreatedCollections");
    const query = new Moralis.Query(CreatedCollections);
    query.equalTo("owner", walletAddress);
    const res = await query.find();
    console.log(res);
    return res;
};

// 




  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date"
    },
    {
      title: "Item",
      key: "item",
      render: (text, record) => (
        <Space size='middle'>
          <img src={getImage(record.collection, record.item)} alt='' style={{ width: "40px", borderRadius: "4px" }} />
          <span>#{record.item}</span>
        </Space>
      )
    },
    {
      title: "Collection",
      key: "collection",
      render: (text, record) => (
        <Space size='middle'>
          <span>{getName(record.collection, record.item)}</span>
        </Space>
      )
    },
    {
      title: "Transaction Status",
      key: "tags",
      dataIndex: "tags",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            let color = "geekblue";
            let status = "BUY";
            if (tag === false) {
              color = "volcano";
              status = "waiting";
            } else if (tag === true) {
              color = "green";
              status = "confirmed";
            }
            if (tag === walletAddress) {
              status = "SELL";
            }
            return (
              <Tag color={color} key={tag}>
                {status.toUpperCase()}
              </Tag>
            );
          })}
        </>
      )
    },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      render: (e) => (
        <Space size='middle'>
          <PolygonCurrency />
          <span>{e}</span>
        </Space>
      )
    }
  ];

  const data = fetchMarketItems?.map((item, index) => ({
    key: index,
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.nftContract,
    item: item.tokenId,
    tags: [item.seller, item.sold],
    price: item.price / ("1e" + 18)
  }));

  return (
    <>
      <div style={{ marginTop: "100px" }}>
        <div style={styles.table}>
          <Table columns={columns} dataSource={data} />
        </div>
      </div>
    </>
  );
}

export default NFTTransactions;
